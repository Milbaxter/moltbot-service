# Moltbot Service - Landing Page

A simple landing page for offering managed Moltbot (AI assistant) instances as a service.

## What This Is

This landing page lets customers sign up for a fully-managed Moltbot instance running in the cloud. You handle the setup manually during beta, and customers get access to Claude AI via WhatsApp, Telegram, or iMessage.

## Setup Instructions

### 1. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a new Product:
   - Name: "Moltbot Personal Assistant"
   - Price: $49/month (recurring)
3. Create a Payment Link for this product
4. Copy the payment link URL
5. Open `script.js` and replace `YOUR_STRIPE_PAYMENT_LINK_HERE` with your actual Stripe payment link

### 2. Update Contact Information

Edit `index.html` and update:
- Email address in the footer (currently `support@moltbot.com`)
- Any other contact details you want to use

### 3. Deploy

You can deploy this to:
- **GitHub Pages** (free, easy)
- **Vercel** (free, automatic deployment)
- **Netlify** (free, drag-and-drop)
- Any static hosting service

#### GitHub Pages Deployment:
```bash
# Push to GitHub
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main

# Enable GitHub Pages in repository settings
# Settings -> Pages -> Source: main branch
```

### 4. Create Terms of Service & Privacy Policy

You'll need to create these documents (linked in footer). Consider:
- Using a template from [Termly](https://termly.io/) or similar
- Consulting with a lawyer for proper legal coverage
- Being clear about data handling and API key usage

## Manual Setup Process

When a customer subscribes:

1. **Collect Information** (via email):
   - Preferred messaging platform (WhatsApp/Telegram/iMessage)
   - Their Anthropic API key
   - Contact info for that platform

2. **Provision Infrastructure**:
   - Create DigitalOcean droplet
   - Install Moltbot
   - Configure with their API key and messaging platform

3. **Test & Handoff**:
   - Send test message to confirm it works
   - Provide customer with usage instructions
   - Give them a way to contact you for support

## Pricing Considerations

Current pricing ($49/month) should cover:
- DigitalOcean droplet: ~$6-12/month
- Your time for setup & support
- Stripe fees (2.9% + 30¢)
- Small profit margin

Customer pays separately for:
- Anthropic API usage (typically $5-20/month)

## Next Steps

- [ ] Set up Stripe product and payment link
- [ ] Deploy landing page
- [ ] Create Terms of Service and Privacy Policy
- [ ] Set up support email
- [ ] Test the checkout flow
- [ ] Plan onboarding email templates
- [ ] Document your manual setup process

## Legal Considerations

Before launching:
- ✓ Verify Anthropic's ToS allows this use case
- ✓ Research WhatsApp Business API requirements
- ✓ Consider business entity (LLC, etc.)
- ✓ Understand tax implications
- ✓ Get proper Terms of Service and Privacy Policy
- ✓ Plan for GDPR compliance if serving EU customers

## Files

- `index.html` - Main landing page
- `style.css` - Styling
- `script.js` - Stripe checkout integration
- `README.md` - This file
