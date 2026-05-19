// ============================================
// NYODERA HEIGHTS - JAVASCRIPT
// ============================================

// ============================================
// DOM Elements
// ============================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const priceFilter = document.getElementById('price-filter');
const priceValue = document.getElementById('price-value');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const contactForm = document.getElementById('contact-form');
const bookingForm = document.getElementById('booking-form');
const formMessage = document.getElementById('form-message');

// ============================================
// MOBILE NAVIGATION
// ============================================

function toggleMobileMenu() {
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.style.display = 'none';
            });
        });
    }
}

// ============================================
// PRICE FILTER UPDATE
// ============================================

function setupPriceFilter() {
    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }
}

// ============================================
// APPLY FILTERS
// ============================================

function setupFilterButtons() {
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const price = document.getElementById('price-filter').value;
            const bedrooms = document.getElementById('bedrooms').value;
            const location = document.getElementById('location').value;
            
            console.log('Filters Applied:', { price, bedrooms, location });
            alert(`Filters applied: Price: $${price}, Bedrooms: ${bedrooms || 'Any'}, Location: ${location || 'Any'}`);
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (priceFilter) priceFilter.value = 5000;
            if (priceValue) priceValue.textContent = '5000';
            if (document.getElementById('bedrooms')) document.getElementById('bedrooms').value = '';
            if (document.getElementById('location')) document.getElementById('location').value = '';
            
            const checkboxes = document.querySelectorAll('.amenities-list input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            
            console.log('Filters cleared');
        });
    }
}

// ============================================
// CONTACT FORM SUBMISSION
// ============================================

function setupContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (name && email && subject && message) {
                showFormMessage('Thank you! Your message has been sent successfully. We will contact you shortly.', 'success');
                contactForm.reset();
            } else {
                showFormMessage('Please fill in all required fields.', 'error');
            }
        });
    }
}

// ============================================
// BOOKING FORM SUBMISSION
// ============================================

function setupBookingForm() {
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;
            
            if (checkIn && checkOut && guests) {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                
                if (checkOutDate > checkInDate) {
                    alert(`Booking confirmed!\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\n\nWe will send confirmation details to your email.`);
                    bookingForm.reset();
                } else {
                    alert('Check-out date must be after check-in date.');
                }
            } else {
                alert('Please fill in all booking details.');
            }
        });
    }
}

// ============================================
// FORM MESSAGE DISPLAY
// ============================================

function showFormMessage(message, type) {
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }
}

// ============================================
// GALLERY IMAGE CHANGE
// ============================================

function changeMainImage(src) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = src;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === src) {
            thumb.classList.add('active');
        }
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function setupSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const element = document.querySelector(href);
                element.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// PROPERTY DETAILS PAGE
// ============================================

function setupPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (propertyId) {
        loadPropertyDetails(propertyId);
    }
}

function loadPropertyDetails(id) {
    // Sample property data
    const properties = {
        1: {
            title: 'Luxury Studio Apartment',
            price: '$2,500',
            location: 'Downtown District',
            bedrooms: 1,
            bathrooms: 1,
            sqft: '550 sq ft',
            description: 'Experience luxury living in this beautifully furnished studio apartment. Located in the heart of the downtown district, this property offers the perfect blend of comfort, style, and convenience.'
        },
        2: {
            title: 'Elegant One Bedroom',
            price: '$3,200',
            location: 'Midtown Elegance',
            bedrooms: 1,
            bathrooms: 1,
            sqft: '750 sq ft',
            description: 'Spacious one-bedroom apartment with separate living area, fully equipped kitchen, and premium finishes.'
        },
        3: {
            title: 'Premium Two Bedroom',
            price: '$4,500',
            location: 'Highrise Avenue',
            bedrooms: 2,
            bathrooms: 2,
            sqft: '1000 sq ft',
            description: 'Luxurious two-bedroom apartment with master suite, guest bedroom, and expansive living space.'
        },
        4: {
            title: 'Luxury Two Bedroom Penthouse',
            price: '$5,800',
            location: 'Waterfront Plaza',
            bedrooms: 2,
            bathrooms: 2,
            sqft: '1200 sq ft',
            description: 'Exclusive waterfront penthouse with panoramic views, private balcony, and state-of-the-art amenities.'
        },
        5: {
            title: 'Spacious Three Bedroom',
            price: '$6,500',
            location: 'Uptown Heights',
            bedrooms: 3,
            bathrooms: 2,
            sqft: '1400 sq ft',
            description: 'Perfect for families or groups. Three bedrooms, spacious living area, and modern amenities throughout.'
        },
        6: {
            title: 'Modern Studio with Balcony',
            price: '$2,800',
            location: 'Downtown District',
            bedrooms: 1,
            bathrooms: 1,
            sqft: '550 sq ft',
            description: 'Contemporary studio with private balcony, high ceilings, and access to building amenities.'
        }
    };
    
    const property = properties[id];
    if (property) {
        // Update page title
        const titleElement = document.getElementById('property-title');
        if (titleElement) titleElement.textContent = property.title;
        
        // Update bedrooms, bathrooms, sqft
        const bedroomsEl = document.getElementById('bedrooms');
        const bathroomsEl = document.getElementById('bathrooms');
        const sqftEl = document.getElementById('sqft');
        
        if (bedroomsEl) bedroomsEl.textContent = property.bedrooms;
        if (bathroomsEl) bathroomsEl.textContent = property.bathrooms;
        if (sqftEl) sqftEl.textContent = property.sqft;
    }
}

// ============================================
// EMAIL VALIDATION
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// DATE VALIDATION FOR BOOKING
// ============================================

function validateDates(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
        return { valid: false, message: 'Check-in date must be in the future.' };
    }
    
    if (checkOutDate <= checkInDate) {
        return { valid: false, message: 'Check-out date must be after check-in date.' };
    }
    
    return { valid: true };
}

// ============================================
// SCROLL ANIMATIONS (Optional Enhancement)
// ============================================

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    const cards = document.querySelectorAll('.property-card, .service-card, .testimonial-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });
}

// ============================================
// INITIALIZE ALL FUNCTIONS
// ============================================

// Dynamically load PayPal SDK with the provided client id
function loadPayPalSdk(clientId) {
    return new Promise((resolve, reject) => {
        if (!clientId) return reject(new Error('Missing PayPal client id'));
        if (window.paypal) return resolve(window.paypal);
        const s = document.createElement('script');
        s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`;
        s.async = true;
        s.onload = () => { if (window.paypal) resolve(window.paypal); else reject(new Error('PayPal SDK loaded but window.paypal missing')); };
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });
}

async function checkStripeCheckoutResult() {
    const sessionId = getUrlParameter('session_id');
    const canceled = getUrlParameter('canceled');
    if (!sessionId && !canceled) return;

    const base = window.PAYMENTS_SERVER || '';
    if (canceled) {
        alert('Stripe checkout was canceled.');
        return;
    }

    try {
        const resp = await fetch(base + `/checkout-session/${encodeURIComponent(sessionId)}`);
        if (!resp.ok) throw new Error('Unable to retrieve session');
        const session = await resp.json();
        const amount = session.amount_total / 100;
        const paymentIntent = session.payment_intent;
        const last4 = paymentIntent?.charges?.data?.[0]?.payment_method_details?.card?.last4 || 'card';
        const record = {
            id: session.id,
            provider: 'Stripe',
            amount,
            last4,
            date: new Date().toISOString(),
            status: session.payment_status,
            description: session.payment_intent?.description || 'Stripe Checkout'
        };
        const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
        payments.push(record);
        localStorage.setItem('nh_payments', JSON.stringify(payments));
        renderPaymentHistory();
        alert(`Stripe payment completed: ${formatCurrency(amount)}`);
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (err) {
        console.error(err);
        alert('Unable to verify Stripe checkout result.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    toggleMobileMenu();
    setupPriceFilter();
    setupFilterButtons();
    setupContactForm();
    setupBookingForm();
    setupSmoothScroll();
    setupPropertyDetails();
    observeElements();
    setupAuthForms();
    setupPaymentForm();

    // Load payment configuration from server and initialize SDKs
    const base = window.PAYMENTS_SERVER || '';
    try {
        const cfgResp = await fetch(base + '/config');
        if (cfgResp.ok) {
            const cfg = await cfgResp.json();
            if (cfg.stripePublishableKey) window.STRIPE_PUBLISHABLE_KEY = cfg.stripePublishableKey;
            if (cfg.paypalClientId) {
                try { await loadPayPalSdk(cfg.paypalClientId); } catch (e) { console.warn('PayPal SDK load failed', e); }
            }
        } else {
            console.warn('Could not fetch payment config');
        }
    } catch (err) {
        console.warn('Error fetching payment config', err);
    }

    setupStripeAndPayPal();
    await checkStripeCheckoutResult();

    console.log('Nyodera Heights website initialized successfully!');
});

// ============================================
// AUTH (LOGIN / SIGNUP) - simple client-side
// ============================================
function setupAuthForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    function loadUsers() {
        try { return JSON.parse(localStorage.getItem('nh_users') || '[]'); } catch { return []; }
    }

    function saveUsers(users) { localStorage.setItem('nh_users', JSON.stringify(users)); }

    if (signupForm) {
        const msg = document.getElementById('signup-message');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const pass = document.getElementById('signup-password').value;
            const pass2 = document.getElementById('signup-password-confirm').value;

            if (!name || !email || !pass) {
                msg.textContent = 'Please fill all fields.'; msg.className = 'form-message error'; return;
            }
            if (pass !== pass2) { msg.textContent = 'Passwords do not match.'; msg.className = 'form-message error'; return; }

            const users = loadUsers();
            if (users.find(u => u.email === email)) { msg.textContent = 'Email already registered.'; msg.className = 'form-message error'; return; }

            users.push({ name, email, password: pass });
            saveUsers(users);
            msg.textContent = 'Account created. You may now log in.'; msg.className = 'form-message success';
            signupForm.reset();
        });
    }

    if (loginForm) {
        const msg = document.getElementById('login-message');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const pass = document.getElementById('login-password').value;

            if (!email || !pass) { msg.textContent = 'Please enter email and password.'; msg.className = 'form-message error'; return; }

            const users = loadUsers();
            const user = users.find(u => u.email === email && u.password === pass);
            if (!user) { msg.textContent = 'Invalid credentials.'; msg.className = 'form-message error'; return; }

            msg.textContent = `Welcome back, ${user.name}!`; msg.className = 'form-message success';
            // Simulate session
            localStorage.setItem('nh_session', JSON.stringify({ email: user.email, name: user.name }));
            setTimeout(() => { window.location.href = 'index.html'; }, 900);
        });
    }
}

// ============================================
// PAYMENT FORM (demo client-side)
// ============================================
function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    const msg = document.getElementById('payment-message');
    if (!form) return;

    function show(type, text) {
        msg.textContent = text;
        msg.className = `form-message ${type}`;
    }

    const methodSelect = document.getElementById('pay-method');
    const mpesaField = document.getElementById('mpesa-field');
    const cardFields = document.getElementById('card-fields');
    const amountField = document.getElementById('amount-field');
    const mpesaInput = document.getElementById('pay-mpesa-phone');
    const cardInputs = cardFields ? cardFields.querySelectorAll('input') : [];

    function updatePaymentMethodFields() {
        const method = methodSelect?.value || 'card';
        if (mpesaField) mpesaField.style.display = method === 'mpesa' ? 'block' : 'none';
        if (cardFields) cardFields.style.display = method === 'mpesa' ? 'none' : 'block';
        cardInputs.forEach(input => { input.disabled = method === 'mpesa'; });
        if (mpesaInput) mpesaInput.disabled = method !== 'mpesa';
        if (amountField) amountField.style.display = 'block';
    }

    if (methodSelect) {
        methodSelect.addEventListener('change', updatePaymentMethodFields);
    }
    updatePaymentMethodFields();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const method = methodSelect?.value || 'card';
        const amount = Number(document.getElementById('pay-amount').value);

        if (!amount || amount <= 0) {
            show('error', 'Please enter a valid amount.');
            return;
        }

        if (method === 'mpesa') {
            const phone = mpesaInput?.value.trim();
            if (!phone || !/^\+?\d{8,15}$/.test(phone)) {
                show('error', 'Enter a valid M-Pesa phone number.');
                return;
            }

            show('success', 'Processing M-Pesa payment...');
            try {
                const base = window.PAYMENTS_SERVER || '';
                const resp = await fetch(base + '/create-mpesa-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, currency: 'USD', phone })
                });
                const data = await resp.json();
                if (data.error) throw new Error(data.error);

                const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
                const record = {
                    id: data.transaction.id,
                    provider: 'M-Pesa',
                    last4: phone.slice(-4),
                    amount,
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    description: `M-Pesa payment from ${phone}`
                };
                payments.push(record);
                localStorage.setItem('nh_payments', JSON.stringify(payments));
                show('success', `M-Pesa payment of $${amount.toFixed(2)} successful. Transaction ID: ${data.transaction.id}`);
                form.reset();
                updatePaymentMethodFields();
                renderPaymentHistory();
            } catch (err) {
                console.error(err);
                show('error', 'M-Pesa payment failed. See console for details.');
            }
            return;
        }

        const name = document.getElementById('pay-name').value.trim();
        const number = document.getElementById('pay-number').value.replace(/\s+/g, '');
        const exp = document.getElementById('pay-exp').value.trim();
        const cvv = document.getElementById('pay-cvv').value.trim();

        if (!name || !number || !exp || !cvv) {
            show('error', 'Please complete all payment fields.');
            return;
        }
        if (!/^\d{12,19}$/.test(number)) { show('error', 'Enter a valid card number.'); return; }
        if (!/^\d{2}\/\d{2}$/.test(exp)) { show('error', 'Expiry use MM/YY.'); return; }
        if (!/^\d{3,4}$/.test(cvv)) { show('error', 'Enter a valid CVV.'); return; }

        show('success', 'Processing payment...');
        setTimeout(() => {
            const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
            payments.push({ id: Date.now(), provider: 'Card', last4: number.slice(-4), amount, date: new Date().toISOString(), description: 'Card payment' });
            localStorage.setItem('nh_payments', JSON.stringify(payments));
            show('success', `Payment of $${amount.toFixed(2)} successful. Receipt saved.`);
            form.reset();
            updatePaymentMethodFields();
            renderPaymentHistory();
        }, 900);
    });

    // render history on load
    renderPaymentHistory();

    // Toggle visibility (hide/show history) persisted in localStorage
    const panel = document.querySelector('.payment-history-panel');
    const toggleBtn = document.getElementById('toggle-payments-visibility');
    const visibilityKey = 'nh_payments_visible';
    function isVisible() {
        const v = localStorage.getItem(visibilityKey);
        return v === null ? true : v === 'true';
    }

    function updateVisibilityUI() {
        const visible = isVisible();
        if (panel) panel.style.display = visible ? 'block' : 'none';
        if (toggleBtn) toggleBtn.textContent = visible ? 'Hide History' : 'Show History';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const newVal = !isVisible();
            localStorage.setItem(visibilityKey, String(newVal));
            updateVisibilityUI();
        });
    }

    updateVisibilityUI();
}

function renderPaymentHistory() {
    const container = document.getElementById('payments-history');
    if (!container) return;
    const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
    if (!payments.length) {
        container.innerHTML = '<p style="color:#bbb">No payments yet.</p>';
        return;
    }

    const rows = payments.slice().reverse().map(p => {
        const date = new Date(p.date);
        return `
            <div class="payment-item" style="padding:10px;border-radius:6px;background:#121212;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-weight:600;color:#fff">${formatCurrency(p.amount)} <small style="color:#999">• ${p.provider || 'Card'} • **** ${p.last4}</small></div>
                    <div style="color:#999;font-size:0.9rem">${date.toLocaleString()}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = rows;
}

// ============================================
// STRIPE + PAYPAL INTEGRATION (client-side)
// Requires server endpoints at /create-checkout-session and /create-paypal-order
// ============================================
function setupStripeAndPayPal() {
    // Stripe
    const stripeBtn = document.getElementById('stripe-checkout');
    if (stripeBtn) {
        stripeBtn.addEventListener('click', async () => {
            const amount = Number(document.getElementById('pay-amount').value) || 0;
            if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
            try {
                const base = window.PAYMENTS_SERVER || '';
                const resp = await fetch(base + '/create-checkout-session', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount })
                });
                const data = await resp.json();
                if (data.error) throw new Error(data.error);
                const stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY || (window.__STRIPE_PUBKEY__));
                await stripe.redirectToCheckout({ sessionId: data.id });
            } catch (err) {
                console.error(err);
                alert('Stripe checkout failed. See console for details.');
            }
        });
    }

    // PayPal
    if (window.paypal) {
        paypal.Buttons({
            createOrder: async function() {
                const amount = Number(document.getElementById('pay-amount').value) || 0;
                if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
                const base = window.PAYMENTS_SERVER || '';
                const res = await fetch(base + '/create-paypal-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'USD' }) });
                const d = await res.json();
                if (d.error) throw new Error(d.error);
                return d.id;
            },
            onApprove: async function(data, actions) {
                try {
                    const capture = await actions.order.capture();
                    const details = capture.purchase_units?.[0]?.payments?.captures?.[0];
                    const amount = details?.amount?.value ? Number(details.amount.value) : Number(document.getElementById('pay-amount').value);
                    const payerName = capture.payer?.name?.given_name || 'PayPal user';
                    const record = {
                        id: data.orderID,
                        provider: 'PayPal',
                        amount,
                        last4: 'PayPal',
                        date: new Date().toISOString(),
                        status: details?.status || 'COMPLETED',
                        description: `PayPal payment by ${payerName}`
                    };
                    const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
                    payments.push(record);
                    localStorage.setItem('nh_payments', JSON.stringify(payments));
                    alert(`PayPal payment completed: ${formatCurrency(amount)}`);
                    renderPaymentHistory();
                } catch (err) {
                    console.error(err);
                    alert('PayPal capture failed.');
                }
            },
            onCancel: function() {
                alert('PayPal payment was canceled.');
            },
            onError: function(err) { console.error(err); alert('PayPal error'); }
        }).render('#paypal-button-container');
    }

    const mpesaBtn = document.getElementById('mpesa-checkout');
    if (mpesaBtn) {
        mpesaBtn.addEventListener('click', async () => {
            const methodSelect = document.getElementById('pay-method');
            const mpesaPhone = document.getElementById('pay-mpesa-phone');
            if (methodSelect) {
                methodSelect.value = 'mpesa';
                methodSelect.dispatchEvent(new Event('change'));
            }
            if (mpesaPhone) {
                mpesaPhone.focus();
            }

            const amount = Number(document.getElementById('pay-amount').value) || 0;
            const phone = mpesaPhone?.value.trim();
            if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
            if (!phone || !/^\+?\d{8,15}$/.test(phone)) { alert('Enter a valid M-Pesa phone number.'); return; }

            try {
                const base = window.PAYMENTS_SERVER || '';
                const resp = await fetch(base + '/create-mpesa-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, currency: 'USD', phone })
                });
                const data = await resp.json();
                if (data.error) throw new Error(data.error);

                const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
                const record = {
                    id: data.transaction.id,
                    provider: 'M-Pesa',
                    amount,
                    last4: phone.slice(-4),
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    description: `M-Pesa payment from ${phone}`
                };
                payments.push(record);
                localStorage.setItem('nh_payments', JSON.stringify(payments));
                alert(`M-Pesa payment completed: ${formatCurrency(amount)}. Transaction ID: ${data.transaction.id}`);
                renderPaymentHistory();
            } catch (err) {
                console.error(err);
                alert('M-Pesa payment failed. See console for details.');
            }
        });
    }
}


// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Log analytics (Example)
function logEvent(eventName, eventData) {
    console.log(`Event: ${eventName}`, eventData);
    // Integration point for analytics
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validateDates,
        formatCurrency,
        getUrlParameter
    };
}
