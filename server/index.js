require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files from the project root so GET / serves index.html
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for single-page navigation
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// M-Pesa Safaricom Daraja API Setup
const DARAJA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const DARAJA_STK_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const DARAJA_CALLBACK_URL = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate';

let mpesaAccessToken = null;
let mpesaTokenExpiry = 0;

// Get M-Pesa Access Token
async function getMpesaAccessToken() {
  try {
    if (mpesaAccessToken && Date.now() < mpesaTokenExpiry) {
      return mpesaAccessToken;
    }

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(DARAJA_AUTH_URL, {
      headers: { Authorization: `Basic ${auth}` }
    });

    mpesaAccessToken = response.data.access_token;
    mpesaTokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return mpesaAccessToken;
  } catch (err) {
    console.error('M-Pesa token error:', err.response?.data || err.message);
    throw err;
  }
}

// Generate M-Pesa password
function generateMpesaPassword() {
  // Build timestamp in YYYYMMDDHHMMSS (no T or timezone) as expected by Daraja
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const passkey = process.env.MPESA_PASSKEY || '';
  const shortcode = process.env.MPESA_SHORTCODE || '';
  const data = `${shortcode}${passkey}${timestamp}`;
  const password = Buffer.from(data).toString('base64');
  return { password, timestamp };
}



app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency, product_data: { name: 'Nyodera Heights Payment' }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
      success_url: `${req.headers.origin}/payments.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payments.html?canceled=true`
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe error' });
  }
});

app.post('/create-paypal-order', async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: currency, value: String(amount.toFixed ? amount.toFixed(2) : amount) } }]
    });

    const client = paypalClient();
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PayPal error' });
  }
});

app.get('/checkout-session/:id', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, { expand: ['payment_intent'] });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to retrieve Stripe session' });
  }
});

// Public config endpoint to return non-secret keys to the client
app.get('/config', (req, res) => {
  res.json({
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    paypalClientId: process.env.PAYPAL_CLIENT_ID || null,
    mpesaEnabled: true
  });
});

// M-Pesa Integration Endpoint - Initiates STK Push
app.post('/create-mpesa-payment', async (req, res) => {
  try {
    const { amount, phone } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });
    if (!phone) return res.status(400).json({ error: 'Missing phone number' });
    if (!/^\+?\d{8,15}$/.test(phone)) return res.status(400).json({ error: 'Invalid phone number format' });

    // Validate M-Pesa credentials are configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      console.warn('M-Pesa credentials not configured - returning simulated response');
      const transactionId = `DEMO_${Date.now()}`;
      return res.json({
        success: true,
        transaction: {
          id: transactionId,
          provider: 'M-Pesa',
          amount,
          phone: `****${phone.slice(-4)}`,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          note: 'Demo mode: Check your phone for STK prompt. For production, configure M-Pesa credentials.'
        }
      });
    }

    try {
      // Get access token
      const accessToken = await getMpesaAccessToken();

      // Generate password and timestamp
      const { password, timestamp } = generateMpesaPassword();

      // Format phone number (convert to 254xxxxxxxxx format if needed)
      let formattedPhone = phone.replace(/^0/, '254');
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = formattedPhone.startsWith('+') ? formattedPhone.substring(1) : formattedPhone;
      }

      // Initiate STK Push
      const stkPayload = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://example.com/callback',
        AccountReference: 'Nyodera_Heights',
        TransactionDesc: 'Property Payment'
      };

      // Log payload without exposing the password/passkey
      const safePayload = { ...stkPayload, Password: '***REDACTED***' };
      console.log('STK Push payload:', JSON.stringify(safePayload));

      const response = await axios.post(DARAJA_STK_URL, stkPayload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const checkoutId = response.data.CheckoutRequestID;
      res.json({
        success: true,
        transaction: {
          id: checkoutId,
          provider: 'M-Pesa',
          amount,
          phone: `****${phone.slice(-4)}`,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          note: '✓ STK push sent! Enter PIN on your phone.'
        }
      });
    } catch (apiErr) {
      console.error('STK Push error:', apiErr.response?.data || apiErr.message);
      
      // Fallback to demo if API fails
      if (apiErr.response?.status === 401) {
        return res.status(400).json({
          error: 'M-Pesa credentials invalid or expired',
          hint: 'Verify MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env'
        });
      }
      throw apiErr;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'M-Pesa payment error: ' + err.message });
  }
});

// M-Pesa Callback Handler (for payment notifications)
app.post('/mpesa-callback', (req, res) => {
  try {
    const body = req.body;
    console.log('M-Pesa Callback:', JSON.stringify(body, null, 2));

    // Store callback in memory (in production, save to database)
    const isSuccess = body.Body?.stkCallback?.ResultCode === 0;
    
    if (isSuccess) {
      const callbackMetadata = body.Body.stkCallback.CallbackMetadata.Item;
      const amount = callbackMetadata.find(item => item.Name === 'Amount')?.Value;
      const phone = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;
      const mpesaRef = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;

      console.log(`✓ Payment received: ${amount} from ${phone} (Ref: ${mpesaRef})`);
    } else {
      console.log(`✗ Payment failed with code: ${body.Body?.stkCallback?.ResultCode}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Received' });
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).json({ error: 'Callback processing failed' });
  }
});


const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Payments server listening on ${PORT}`));
