// Stripe checkout button handler
document.getElementById('checkout-button').addEventListener('click', function(e) {
    e.preventDefault();

    // TODO: Replace with your actual Stripe payment link
    const stripePaymentLink = 'YOUR_STRIPE_PAYMENT_LINK_HERE';

    if (stripePaymentLink === 'YOUR_STRIPE_PAYMENT_LINK_HERE') {
        alert('Please set up your Stripe payment link first!\n\nInstructions:\n1. Create a product in Stripe Dashboard\n2. Set up a payment link\n3. Replace the URL in script.js');
        return;
    }

    // Redirect to Stripe checkout
    window.location.href = stripePaymentLink;
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
