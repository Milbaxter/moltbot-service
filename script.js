// Stripe checkout button handler
const stripePaymentLinks = {
    monthly: 'YOUR_STRIPE_MONTHLY_LINK_HERE',
    annual: 'YOUR_STRIPE_ANNUAL_LINK_HERE'
};

let currentPeriod = 'monthly';

// Handle checkout button clicks
document.getElementById('checkout-button').addEventListener('click', handleCheckout);
document.getElementById('checkout-button-final').addEventListener('click', handleCheckout);

function handleCheckout(e) {
    e.preventDefault();

    const stripeLink = stripePaymentLinks[currentPeriod];

    if (stripeLink.includes('YOUR_STRIPE')) {
        alert('Please set up your Stripe payment links first!\n\nInstructions:\n1. Create products in Stripe Dashboard (Monthly & Annual)\n2. Set up payment links for each\n3. Replace the URLs in script.js\n\nMonthly: $49/month\nAnnual: $490/year (2 months free)');
        return;
    }

    // Redirect to Stripe checkout
    window.location.href = stripeLink;
}

// Handle pricing toggle (Monthly/Annual)
const toggleButtons = document.querySelectorAll('.toggle-btn');
const monthlyPrice = document.querySelector('.monthly-price');
const annualPrice = document.querySelector('.annual-price');

toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const period = this.dataset.period;
        currentPeriod = period;

        // Update active state
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Show/hide prices
        if (period === 'monthly') {
            monthlyPrice.style.display = 'block';
            annualPrice.style.display = 'none';
        } else {
            monthlyPrice.style.display = 'none';
            annualPrice.style.display = 'block';
        }
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
