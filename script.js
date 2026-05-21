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
        // Check payment status and show notice if needed
        const session = getSession();
        const paymentNotice = document.getElementById('booking-payment-notice');
        
        if (session && paymentNotice) {
            const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
            const userPayment = payments.find(p => p.userEmail === session.email);
            if (!userPayment) {
                paymentNotice.style.display = 'block';
            }
        }
        
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;
            const session = getSession();
            
            if (checkIn && checkOut && guests) {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                
                if (checkOutDate > checkInDate) {
                    if (!session) {
                        alert('Please sign in to confirm your booking.');
                        window.location.href = 'login.html';
                        return;
                    }
                    
                    // Calculate total cost and redirect user to payment flow
                    const checkInDateObj = checkInDate;
                    const checkOutDateObj = checkOutDate;
                    const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
                    const totalPrice = Number(((nights / 30) * PRICE_PER_MONTH).toFixed(2));

                    // Create a pending booking awaiting payment
                    const pending = {
                        id: `PENDING_${Date.now()}`,
                        userEmail: session.email,
                        property: document.getElementById('property-title')?.textContent || 'Luxury Apartment',
                        checkIn,
                        checkOut,
                        guests,
                        nights,
                        amount: totalPrice,
                        createdDate: new Date().toISOString(),
                        status: 'pending_payment'
                    };
                    localStorage.setItem('nh_pending_booking', JSON.stringify(pending));

                    // Redirect to payments page with booking id and amount prefilled
                    const params = new URLSearchParams({ booking_id: pending.id, amount: String(totalPrice) });
                    window.location.href = `payments.html?${params.toString()}`;
                    return;
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
// RESERVATIONS MANAGEMENT
// ============================================
function setupReservationsPage() {
    const session = getSession();

    // If we were redirected here from a booking, prefill the amount and lock it
    const urlParams = new URLSearchParams(window.location.search);
    const bookingIdParam = urlParams.get('booking_id');
    const pendingBooking = JSON.parse(localStorage.getItem('nh_pending_booking') || 'null');
    if (pendingBooking && (!bookingIdParam || pendingBooking.id === bookingIdParam)) {
        const amountInput = document.getElementById('pay-amount');
        if (amountInput) {
            amountInput.value = pendingBooking.amount;
            amountInput.readOnly = true;
        }
        const amountLabel = document.getElementById('pay-amount-label');
        if (amountLabel) amountLabel.textContent = 'Amount (USD) - Reservation total';
    }
    const container = document.getElementById('reservations-container');
    const loginNote = document.getElementById('reservations-login-note');
    const bookingsList = document.getElementById('bookings-list');
    
    if (!container) return;
    
    if (!session) {
        loginNote.style.display = 'block';
        container.style.display = 'none';
        return;
    }
    
    loginNote.style.display = 'none';
    container.style.display = 'block';
    
    renderBookings();
}

function renderBookings() {
    const session = getSession();
    const bookingsList = document.getElementById('bookings-list');
    const noBookingsMessage = document.getElementById('no-bookings-message');
    
    if (!bookingsList) return;
    
    const allBookings = JSON.parse(localStorage.getItem('nh_bookings') || '[]');
    const userBookings = allBookings.filter(b => b.userEmail === session?.email && b.status === 'confirmed');
    
    if (!userBookings.length) {
        bookingsList.innerHTML = '';
        if (noBookingsMessage) noBookingsMessage.style.display = 'block';
        return;
    }
    
    if (noBookingsMessage) noBookingsMessage.style.display = 'none';
    
    const bookingsHtml = userBookings.map(booking => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const pricePerMonth = 2500;
        const totalPrice = (nights / 30) * pricePerMonth;
        
        return `
            <div class="booking-card">
                <div class="booking-header">
                    <div class="booking-title">${booking.property}</div>
                    <div class="booking-status">CONFIRMED</div>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="detail-label">Check-in Date</span>
                        <span class="detail-value">${checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Check-out Date</span>
                        <span class="detail-value">${checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Number of Guests</span>
                        <span class="detail-value">${booking.guests} ${booking.guests == 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Price</span>
                        <span class="detail-value">$${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="stay-duration">
                    <strong>${nights} Night${nights !== 1 ? 's' : ''}</strong> • ${nights > 30 ? 'Long term stay' : 'Short term stay'}
                </div>
                <div class="booking-actions">
                    <button class="btn-extend" onclick="openExtendModal('${booking.id}', '${booking.checkOut}')">Extend Stay</button>
                    <button class="btn-cancel" onclick="showCancelConfirmation('${booking.id}')">Cancel Booking</button>
                </div>
            </div>
        `;
    }).join('');
    
    bookingsList.innerHTML = bookingsHtml;
}

function openExtendModal(bookingId, currentCheckOut) {
    const modal = document.getElementById('extend-modal');
    const currentCheckoutField = document.getElementById('current-checkout');
    const newCheckoutField = document.getElementById('new-checkout');
    const form = document.getElementById('extend-form');
    
    if (currentCheckoutField) {
        currentCheckoutField.value = new Date(currentCheckOut).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    
    newCheckoutField.value = '';
    newCheckoutField.min = currentCheckOut;
    form.onsubmit = (e) => handleExtendStay(e, bookingId, currentCheckOut);
    
    modal.style.display = 'block';
}

function closeExtendModal() {
    const modal = document.getElementById('extend-modal');
    modal.style.display = 'none';
}

function handleExtendStay(e, bookingId, currentCheckOut) {
    e.preventDefault();
    
    const newCheckoutField = document.getElementById('new-checkout');
    const newCheckout = newCheckoutField.value;
    const currentCheckoutDate = new Date(currentCheckOut);
    const newCheckoutDate = new Date(newCheckout);
    
    if (newCheckoutDate <= currentCheckoutDate) {
        alert('New check-out date must be after the current check-out date.');
        return;
    }
    
    const allBookings = JSON.parse(localStorage.getItem('nh_bookings') || '[]');
    const booking = allBookings.find(b => b.id == bookingId);
    
    if (booking) {
        const additionalNights = Math.ceil((newCheckoutDate - currentCheckoutDate) / (1000 * 60 * 60 * 24));
        booking.checkOut = newCheckout;
        localStorage.setItem('nh_bookings', JSON.stringify(allBookings));
        
        alert(`Stay extended successfully!\nNew check-out date: ${newCheckoutDate.toLocaleDateString()}\nAdditional nights: ${additionalNights}\nAdditional cost: $${(additionalNights / 30 * 2500).toFixed(2)}`);
        closeExtendModal();
        renderBookings();
    }
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        return;
    }
    
    const allBookings = JSON.parse(localStorage.getItem('nh_bookings') || '[]');
    const booking = allBookings.find(b => b.id == bookingId);
    
    if (booking) {
        booking.status = 'cancelled';

        // Attempt server-side refund for 50% of paid amount
        (async () => {
            try {
                const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
                const payment = payments.find(p => p.id === booking.paymentId || p.id === String(booking.paymentId));
                if (!payment || !payment.amount) {
                    alert('Booking cancelled successfully. No payment was found to refund.');
                    localStorage.setItem('nh_bookings', JSON.stringify(allBookings));
                    renderBookings();
                    return;
                }

                const refundAmount = Number((payment.amount * 0.5).toFixed(2));
                const base = await getPaymentsServer();
                const resp = await fetch((base ? base : '') + '/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: payment.provider || 'stripe', paymentId: payment.id, amount: refundAmount, currency: payment.currency || 'USD', captureId: payment.captureId })
                });

                const data = await resp.json().catch(() => null);
                if (!resp.ok || !data?.success) {
                    console.warn('Server refund failed, falling back to client-side refund', data);
                    // Fallback: record refund locally
                    const refundRecord = {
                        id: `REF_${Date.now()}`,
                        provider: 'Refund',
                        amount: refundAmount,
                        currency: payment.currency || 'USD',
                        date: new Date().toISOString(),
                        status: 'REFUNDED',
                        description: `50% refund for booking ${booking.id}`,
                        userEmail: booking.userEmail,
                        relatedPaymentId: payment.id
                    };
                    payments.push(refundRecord);
                    localStorage.setItem('nh_payments', JSON.stringify(payments));
                    booking.refund = { amount: refundAmount, date: refundRecord.date };
                    alert(`Booking cancelled. A 50% refund of ${formatCurrency(refundAmount, refundRecord.currency)} has been recorded (local fallback).`);
                } else {
                    // Use server-provided refund id/details
                    const refundInfo = data.refund || {};
                    const refundId = refundInfo.id || `REF_${Date.now()}`;
                    const refundRecord = {
                        id: refundId,
                        provider: payment.provider === 'PayPal' ? 'PayPal Refund' : 'Stripe Refund',
                        amount: refundAmount,
                        currency: payment.currency || (refundInfo.currency || 'USD'),
                        date: new Date().toISOString(),
                        status: 'REFUNDED',
                        description: `Server-side refund for booking ${booking.id}`,
                        userEmail: booking.userEmail,
                        relatedPaymentId: payment.id,
                        serverResponse: refundInfo
                    };
                    payments.push(refundRecord);
                    localStorage.setItem('nh_payments', JSON.stringify(payments));
                    booking.refund = { amount: refundAmount, date: refundRecord.date, id: refundId };
                    alert(`Booking cancelled. Server-issued refund of ${formatCurrency(refundAmount, refundRecord.currency)} completed.`);
                }

                localStorage.setItem('nh_bookings', JSON.stringify(allBookings));
                renderBookings();
            } catch (err) {
                console.error('Refund error:', err);
                alert('Booking cancelled. Refund processing failed; please contact support.');
                localStorage.setItem('nh_bookings', JSON.stringify(allBookings));
                renderBookings();
            }
        })();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('extend-modal');
    if (modal && event.target === modal) {
        modal.style.display = 'none';
    }
};

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

// Pricing constant used across booking/payment calculations
const PRICE_PER_MONTH = 2500; // USD


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

let paymentsServerCache = null;
let paymentsServerProbePromise = null;

function normalizeServerBase(value) {
    if (!value) return '';
    return value.toString().trim().replace(/\/+$/g, '');
}

function getPaymentsServerCandidates() {
    const candidates = [];
    const envServer = normalizeServerBase(window.PAYMENTS_SERVER || '');
    const origin = normalizeServerBase(window.location.origin || '');
    const pathname = window.location.pathname || '';

    if (envServer) candidates.push(envServer);
    if (origin) {
        candidates.push(origin);

        const pathPrefixMatch = pathname.match(/^\/(\d+)(?:\/|$)/);
        if (pathPrefixMatch) {
            candidates.push(`${origin}/${pathPrefixMatch[1]}`);
        }

        if (origin.includes('.app.github.dev') || origin.includes('.githubpreview.dev') || origin.includes('.github.dev')) {
            candidates.push(`${origin}/4242`);
            const host = origin.replace(/^https?:\/\//, '');
            if (!host.startsWith('4242-')) {
                candidates.push(`${window.location.protocol}//4242-${host}`);
            }
        }
    }

    if (origin && !origin.startsWith('file:')) {
        candidates.push('');
    }

    candidates.push('http://localhost:4242', 'https://localhost:4242');
    return Array.from(new Set(candidates));
}

async function probePaymentsServerBase(base) {
    const url = base ? `${base}/config` : '/config';
    try {
        const resp = await fetch(url, { method: 'GET' });
        return resp.ok;
    } catch (err) {
        console.warn('[Payments] probe failed:', url, err);
        return false;
    }
}

async function getPaymentsServer() {
    if (paymentsServerCache !== null) return paymentsServerCache;
    if (!paymentsServerProbePromise) {
        paymentsServerProbePromise = (async () => {
            const candidates = getPaymentsServerCandidates();
            for (const base of candidates) {
                const normalized = normalizeServerBase(base);
                const probeUrl = normalized ? `${normalized}/config` : '/config';
                console.log('[Payments] probing server base:', probeUrl);
                if (await probePaymentsServerBase(normalized)) {
                    paymentsServerCache = normalized;
                    console.log('[Payments] selected server base:', normalized || '(relative)');
                    return normalized;
                }
            }
            paymentsServerCache = normalizeServerBase(candidates[0] || '');
            console.warn('[Payments] no valid server base found, falling back to:', paymentsServerCache || '(relative)');
            return paymentsServerCache;
        })();
    }
    return paymentsServerProbePromise;
}

// Persist a payment record and attach the current logged-in user if any
function addPaymentRecord(record) {
    try {
        const session = getSession();
        const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]');
        const rec = Object.assign({}, record, { userEmail: session?.email || null });
        payments.push(rec);
        localStorage.setItem('nh_payments', JSON.stringify(payments));
        return rec;
    } catch (err) {
        console.error('addPaymentRecord error', err);
        return record;
    }
}

// Finalize a pending booking (if any) after receiving a payment record
function finalizeBookingAfterPayment(paymentRecord) {
    try {
        const pending = JSON.parse(localStorage.getItem('nh_pending_booking') || 'null');
        if (!pending) return;
        const session = getSession();
        if (pending.userEmail && session && pending.userEmail !== session.email) return;

        const booking = Object.assign({}, pending, {
            status: 'confirmed',
            paymentId: paymentRecord.id,
            paidAmount: paymentRecord.amount,
            confirmedDate: new Date().toISOString()
        });

        const bookings = JSON.parse(localStorage.getItem('nh_bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('nh_bookings', JSON.stringify(bookings));
        localStorage.removeItem('nh_pending_booking');

        alert(`Booking confirmed!\nProperty: ${booking.property}\nCheck-in: ${booking.checkIn}\nCheck-out: ${booking.checkOut}\nAmount paid: ${formatCurrency(booking.paidAmount, paymentRecord.currency || 'USD')}`);
        // Redirect to reservations page so user can view the confirmed booking
        window.location.href = 'reservations.html';
    } catch (err) {
        console.error('finalizeBookingAfterPayment error', err);
    }
}

async function checkStripeCheckoutResult() {
    const sessionId = getUrlParameter('session_id');
    const canceled = getUrlParameter('canceled');
    if (!sessionId && !canceled) return;

    const base = await getPaymentsServer();
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
            currency: 'USD',
            last4,
            date: new Date().toISOString(),
            status: session.payment_status,
            description: session.payment_intent?.description || 'Stripe Checkout'
        };
        // Persist payment and associate with any pending booking
        const saved = addPaymentRecord(record);
        renderPaymentHistory();
        alert(`Stripe payment completed: ${formatCurrency(amount, 'USD')}`);
        // Finalize booking if there was a pending booking for this user
        finalizeBookingAfterPayment(saved);
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
    setupAuthNav();
    setupAuthForms();
    setupAccountPage();
    setupPaymentForm();
    setupReservationsPage();

    // Load payment configuration from server and initialize SDKs
    const base = await getPaymentsServer();
    try {
        const cfgResp = await fetch((base ? base : '') + '/config');
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
function getSession() {
    try {
        return JSON.parse(localStorage.getItem('nh_session') || 'null');
    } catch {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem('nh_session');
}

function loadUsers() {
    try { return JSON.parse(localStorage.getItem('nh_users') || '[]'); } catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem('nh_users', JSON.stringify(users));
}

function setupAuthNav() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;

    const session = getSession();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const createNavItem = (href, text, id) => {
        const li = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.textContent = text;
        if (id) anchor.id = id;
        if (href.endsWith(currentPage) || currentPage === '' && href.endsWith('index.html')) {
            anchor.classList.add('active');
        }
        li.appendChild(anchor);
        return li;
    };

    const removeLink = (selector) => {
        const item = nav.querySelector(selector);
        if (item) {
            const li = item.closest('li');
            if (li) li.remove();
        }
    };

    const hasLink = (href) => Boolean(nav.querySelector(`a[href="${href}"]`));

    if (session) {
        removeLink('a[href="login.html"]');
        removeLink('a[href="signup.html"]');

        if (!hasLink('account.html')) {
            const accountItem = createNavItem('account.html', 'Account');
            nav.appendChild(accountItem);
        }
        if (!nav.querySelector('#nav-logout-link')) {
            const logoutItem = createNavItem('#', 'Log Out', 'nav-logout-link');
            logoutItem.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                clearSession();
                window.location.href = 'login.html';
            });
            nav.appendChild(logoutItem);
        }
    } else {
        removeLink('a[href="account.html"]');
        removeLink('#nav-logout-link');

        if (!hasLink('login.html')) {
            nav.appendChild(createNavItem('login.html', 'Login'));
        }
        if (!hasLink('signup.html')) {
            nav.appendChild(createNavItem('signup.html', 'Sign Up'));
        }
    }

    const logoutAnchor = document.getElementById('nav-logout-link');
    if (logoutAnchor) {
        logoutAnchor.addEventListener('click', (e) => {
            e.preventDefault();
            clearSession();
            window.location.href = 'login.html';
        });
    }
}

function setupAccountPage() {
    const accountForm = document.getElementById('account-form');
    const accountInfo = document.getElementById('account-info');
    const accountMessage = document.getElementById('account-message');
    const logoutButton = document.getElementById('logout-button');

    if (!accountForm) return;

    const session = getSession();
    if (!session) {
        if (accountInfo) accountInfo.textContent = 'You are not logged in. Please log in first.';
        accountForm.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        return;
    }

    if (accountInfo) {
        accountInfo.textContent = `Signed in as ${session.email}. Use the form below to change your password.`;
    }

    accountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            accountMessage.textContent = 'Please complete all password fields.';
            accountMessage.className = 'form-message error';
            return;
        }

        if (newPassword.length < 8) {
            accountMessage.textContent = 'New password must be at least 8 characters.';
            accountMessage.className = 'form-message error';
            return;
        }

        if (newPassword !== confirmPassword) {
            accountMessage.textContent = 'New password and confirmation do not match.';
            accountMessage.className = 'form-message error';
            return;
        }

        const users = loadUsers();
        const user = users.find(u => u.email === session.email);
        if (!user) {
            accountMessage.textContent = 'Unable to find your user account.';
            accountMessage.className = 'form-message error';
            return;
        }

        if (user.password !== currentPassword) {
            accountMessage.textContent = 'Current password is incorrect.';
            accountMessage.className = 'form-message error';
            return;
        }

        user.password = newPassword;
        saveUsers(users);
        accountMessage.textContent = 'Password changed successfully.';
        accountMessage.className = 'form-message success';
        accountForm.reset();
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearSession();
            window.location.href = 'login.html';
        });
    }
}

function setupAuthForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const session = getSession();

    function loadUsers() {
        try { return JSON.parse(localStorage.getItem('nh_users') || '[]'); } catch { return []; }
    }

    function saveUsers(users) { localStorage.setItem('nh_users', JSON.stringify(users)); }

    if (signupForm) {
        if (session) {
            window.location.href = 'index.html';
            return;
        }

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
            localStorage.setItem('nh_session', JSON.stringify({ email, name }));
            window.location.href = 'index.html';
        });
    }

    if (loginForm) {
        if (session) {
            window.location.href = 'index.html';
            return;
        }

        const msg = document.getElementById('login-message');
        const forgotLink = document.getElementById('forgot-password-link');
        const forgotPanel = document.getElementById('forgot-password-panel');
        const forgotForm = document.getElementById('forgot-password-form');
        const forgotMsg = document.getElementById('forgot-password-message');
        const backToLogin = document.getElementById('back-to-login');

        const showForgotPanel = () => {
            loginForm.style.display = 'none';
            if (forgotPanel) forgotPanel.style.display = 'block';
            if (msg) { msg.textContent = ''; msg.className = 'form-message'; }
        };

        const hideForgotPanel = () => {
            loginForm.style.display = 'block';
            if (forgotPanel) forgotPanel.style.display = 'none';
            if (forgotMsg) { forgotMsg.textContent = ''; forgotMsg.className = 'form-message'; }
            if (forgotForm) forgotForm.reset();
            const emailBox = document.getElementById('forgot-password-email-box');
            if (emailBox) emailBox.style.display = 'none';
        };

        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                showForgotPanel();
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                hideForgotPanel();
            });
        }

        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgot-email').value.trim().toLowerCase();
                if (!email) {
                    forgotMsg.textContent = 'Please enter your email.';
                    forgotMsg.className = 'form-message error';
                    return;
                }

                const users = loadUsers();
                const user = users.find(u => u.email === email);
                if (!user) {
                    forgotMsg.textContent = 'No account was found for that email.';
                    forgotMsg.className = 'form-message error';
                    return;
                }

                const tempPassword = Math.random().toString(36).slice(-8);
                user.password = tempPassword;
                saveUsers(users);

                try {
                    const base = await getPaymentsServer();
                    const response = await fetch((base ? base : '') + '/send-reset-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, name: user.name, tempPassword })
                    });
                    let data;
                    const text = await response.text();
                    try {
                        data = text ? JSON.parse(text) : {};
                    } catch (parseErr) {
                        data = null;
                    }

                    if (!response.ok) {
                        const errorMessage = data?.error || data?.message || text || 'Failed to send reset email';
                        throw new Error(errorMessage);
                    }

                    const emailBox = document.getElementById('forgot-password-email-box');
                    const previewLink = document.getElementById('forgot-password-preview-link');
                    const emailText = document.getElementById('forgot-password-email-text');

                    if (emailBox) emailBox.style.display = 'block';
                    if (previewLink) {
                        if (data.previewUrl) {
                            previewLink.href = data.previewUrl;
                            previewLink.style.display = 'inline-block';
                        } else {
                            previewLink.style.display = 'none';
                        }
                    }

                    if (data.mode === 'ethereal') {
                        forgotMsg.textContent = `Temporary password created. A test email preview is available below because SMTP is not configured.`;
                        if (emailText) {
                            emailText.textContent = 'This environment uses a test mail preview. No actual email will be delivered unless SMTP is configured.';
                        }
                    } else {
                        forgotMsg.textContent = `Password reset email sent to ${email}. Please check your inbox.`;
                        if (emailText) {
                            emailText.textContent = 'A password reset email has been sent to your address.';
                        }
                    }
                    forgotMsg.className = 'form-message success';
                } catch (err) {
                    forgotMsg.textContent = `Reset email failed: ${err.message}`;
                    forgotMsg.className = 'form-message error';
                }
            });
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const pass = document.getElementById('login-password').value;

            if (!email || !pass) { msg.textContent = 'Please enter email and password.'; msg.className = 'form-message error'; return; }

            const users = loadUsers();
            const user = users.find(u => u.email === email && u.password === pass);
            if (!user) { msg.textContent = 'Invalid credentials.'; msg.className = 'form-message error'; return; }

            msg.textContent = `Welcome back, ${user.name}! Redirecting to the home page...`;
            msg.className = 'form-message success';
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
    const paymentDetails = document.getElementById('payment-details');
    const cardInputs = cardFields ? cardFields.querySelectorAll('input') : [];
    const panel = document.querySelector('.payment-history-panel');
    const toggleBtn = document.getElementById('toggle-payments-visibility');
    const historyNote = document.getElementById('payments-history-note');
    const visibilityKey = 'nh_payments_visible';
    const session = getSession();

    function isHistoryVisible() {
        return localStorage.getItem(visibilityKey) !== 'false';
    }

    function updateHistoryPanelVisibility() {
        const loggedIn = Boolean(session);
        const visible = loggedIn && isHistoryVisible();

        if (panel) {
            panel.style.display = visible ? 'block' : 'none';
        }

        if (toggleBtn) {
            toggleBtn.style.display = loggedIn ? 'inline-flex' : 'none';
            toggleBtn.textContent = visible ? 'Hide History' : 'Show History';
        }

        if (historyNote) {
            if (!loggedIn) {
                historyNote.style.display = 'block';
                historyNote.textContent = 'Please sign in to view your payment history.';
            } else {
                historyNote.style.display = 'none';
                historyNote.textContent = '';
            }
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const newValue = !isHistoryVisible();
            localStorage.setItem(visibilityKey, String(newValue));
            updateHistoryPanelVisibility();
            if (newValue) renderPaymentHistory();
        });
    }

    updateHistoryPanelVisibility();

    function ownerPaymentRecord(record) {
        return {
            ...record,
            userEmail: session?.email || null
        };
    }

    function showDetails(text) {
        if (paymentDetails) paymentDetails.textContent = text || '';
    }

    function updatePaymentMethodFields() {
        const method = methodSelect?.value || 'card';
        if (mpesaField) mpesaField.style.display = method === 'mpesa' ? 'block' : 'none';
        if (cardFields) cardFields.style.display = method === 'mpesa' ? 'none' : 'block';
        cardInputs.forEach(input => { input.disabled = method === 'mpesa'; });
        if (mpesaInput) mpesaInput.disabled = method !== 'mpesa';
        if (amountField) amountField.style.display = 'block';
        const amountLabel = document.getElementById('pay-amount-label');
        if (amountLabel) {
            amountLabel.textContent = method === 'mpesa' ? 'Amount (KES)' : 'Amount (USD)';
        }
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
            showDetails('');
            try {
                const base = await getPaymentsServer();
                const payload = { amount, currency: 'KES', phone };
                console.log('M-Pesa submit payload:', payload);
                console.log('[Payments] M-Pesa request URL:', (base ? base : '') + '/create-mpesa-payment');
                const resp = await fetch((base ? base : '') + '/create-mpesa-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => null);
                if (!resp.ok) {
                    const msg = data?.error || data?.message || `${resp.status} ${resp.statusText}`;
                    throw new Error(`HTTP ${resp.status}: ${msg}`);
                }
                if (data?.error) throw new Error(data.error);

                const record = {
                    id: data.transaction.id,
                    provider: 'M-Pesa',
                    last4: phone.slice(-4),
                    amount,
                    currency: 'KES',
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    description: `M-Pesa payment from ${phone}`
                };
                const saved = addPaymentRecord(record);
                show('success', `M-Pesa STK push sent to ${phone}. ${data.transaction.note || ''}`);
                showDetails(`Request ID: ${data.transaction.id} • Phone: ${phone}`);
                form.reset();
                updatePaymentMethodFields();
                renderPaymentHistory();
                finalizeBookingAfterPayment(saved);
            } catch (err) {
                console.error('M-Pesa payment error:', err);
                const message = err?.message || 'Unknown error';
                show('error', `M-Pesa payment failed: ${message}`);
                showDetails(`Error: ${message}`);
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
            const record = { id: Date.now(), provider: 'Card', last4: number.slice(-4), amount, currency: 'USD', date: new Date().toISOString(), description: 'Card payment' };
            const saved = addPaymentRecord(record);
            show('success', `Payment of $${amount.toFixed(2)} successful. Receipt saved.`);
            form.reset();
            updatePaymentMethodFields();
            renderPaymentHistory();
            finalizeBookingAfterPayment(saved);
        }, 900);
    });
}

function renderPaymentHistory() {
    const container = document.getElementById('payments-history');
    if (!container) return;
    const session = getSession();
    if (!session) {
        container.innerHTML = '<p style="color:#bbb">Sign in to see your own payment history.</p>';
        return;
    }

    const payments = JSON.parse(localStorage.getItem('nh_payments') || '[]').filter(p => p.userEmail === session.email);
    if (!payments.length) {
        container.innerHTML = `<p style="color:#bbb">No payments found for ${session.email}.</p>`;
        return;
    }

    const rows = payments.slice().reverse().map(p => {
        const date = new Date(p.date);
        const currency = p.currency || 'USD';
        return `
            <div class="payment-item" style="padding:10px;border-radius:6px;background:#121212;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-weight:600;color:#fff">${formatCurrency(p.amount, currency)} <small style="color:#999">• ${p.provider || 'Card'} • **** ${p.last4}</small></div>
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
                const base = await getPaymentsServer();
                const resp = await fetch((base ? base : '') + '/create-checkout-session', {
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
                const base = await getPaymentsServer();
                const res = await fetch((base ? base : '') + '/create-paypal-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'USD' }) });
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
                        currency: 'USD',
                        last4: 'PayPal',
                        date: new Date().toISOString(),
                        status: details?.status || 'COMPLETED',
                        description: `PayPal payment by ${payerName}`
                    };
                    const saved = addPaymentRecord(record);
                    alert(`PayPal payment completed: ${formatCurrency(amount, 'USD')}`);
                    renderPaymentHistory();
                    finalizeBookingAfterPayment(saved);
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
                const base = await getPaymentsServer();
                const payload = { amount, currency: 'KES', phone };
                console.log('M-Pesa button payload:', payload);
                console.log('[Payments] M-Pesa button request URL:', (base ? base : '') + '/create-mpesa-payment');
                const resp = await fetch((base ? base : '') + '/create-mpesa-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await resp.json().catch(() => null);
                if (!resp.ok) {
                    const msg = data?.error || data?.message || `${resp.status} ${resp.statusText}`;
                    throw new Error(`HTTP ${resp.status}: ${msg}`);
                }
                if (data?.error) throw new Error(data.error);

                const record = {
                    id: data.transaction.id,
                    provider: 'M-Pesa',
                    amount,
                    currency: 'KES',
                    last4: phone.slice(-4),
                    date: new Date().toISOString(),
                    status: 'COMPLETED',
                    description: `M-Pesa payment from ${phone}`
                };
                const saved = addPaymentRecord(record);
                alert(`M-Pesa STK push sent to ${phone}. ${data.transaction.note || ''}`);
                if (paymentDetails) paymentDetails.textContent = `Request ID: ${data.transaction.id} • Phone: ${phone}`;
                renderPaymentHistory();
                finalizeBookingAfterPayment(saved);
            } catch (err) {
                console.error('M-Pesa button error:', err);
                const message = err?.message || 'Unknown error';
                alert(`M-Pesa payment failed: ${message}`);
                if (paymentDetails) paymentDetails.textContent = `Error: ${message}`;
            }
        });
    }
}


// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
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
        getUrlParameter,
        setupReservationsPage,
        renderBookings,
        openExtendModal,
        closeExtendModal,
        cancelBooking,
        handleExtendStay
    };
}
