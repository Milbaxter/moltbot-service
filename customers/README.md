# Customer Tracking System

Simple JSON-based customer tracking for StuffPress.

## Directory Structure

```
customers/
├── README.md           # This file
├── TEMPLATE.json       # Customer record template
├── active/             # Active customer records
│   └── *.json         # One file per customer (email-based filename)
└── archive/            # Archived/cancelled customers
    └── *.json         # Moved here when customer cancels
```

## Customer Record Schema

Each customer is stored as `email_at_domain.json` in `active/`:

```json
{
  "id": "cust_1234567890",
  "email": "customer@example.com",
  "name": "Customer Name",
  "signupDate": "2026-01-29T05:54:00Z",
  "status": "active|pending_setup|handed_over|cancelled",
  
  "subscription": {
    "stripeSubscriptionId": "sub_abc123",
    "stripePriceId": "price_...",
    "plan": "stuffpress-monthly",
    "amount": 8999,
    "currency": "usd",
    "status": "active",
    "currentPeriodEnd": "2026-02-29T05:54:00Z"
  },
  
  "setup": {
    "status": "pending|in_progress|complete",
    "droplet": {
      "provider": "digitalocean",
      "id": "123456789",
      "ip": "64.23.123.45",
      "created": "2026-01-29T06:00:00Z"
    },
    "moltbot": {
      "installed": true,
      "installedAt": "2026-01-29T06:15:00Z",
      "version": "2026.1.24-3"
    },
    "messaging": {
      "platform": "telegram",
      "connected": true,
      "username": "@customertg",
      "botToken": "123456:ABC..."
    },
    "handoff": {
      "completed": true,
      "completedAt": "2026-01-29T06:30:00Z",
      "onboardingMessageSent": true
    }
  },
  
  "notes": [
    {
      "timestamp": "2026-01-29T06:00:00Z",
      "note": "Customer requested WhatsApp instead of Telegram"
    }
  ],
  
  "timeline": [
    {
      "timestamp": "2026-01-29T05:54:00Z",
      "event": "subscription_created",
      "details": "Customer signed up via Stripe"
    },
    {
      "timestamp": "2026-01-29T06:00:00Z",
      "event": "droplet_created",
      "details": "Created DO droplet 123456789"
    }
  ],
  
  "metadata": {
    "source": "stripe",
    "referrer": null,
    "landingPage": "stuffpress"
  }
}
```

## CLI Usage

See `../customer-cli.js` for the management tool.

```bash
# Add new customer
./customer-cli.js add customer@example.com sub_abc123

# List customers
./customer-cli.js list

# Show details
./customer-cli.js show customer@example.com

# Update fields
./customer-cli.js update customer@example.com setup.droplet.id 123456
./customer-cli.js update customer@example.com status "active"

# Add notes and timeline events
./customer-cli.js note customer@example.com "Customer wants WhatsApp"
./customer-cli.js timeline customer@example.com droplet_created "DO droplet 123456"
```

## Status Values

- **pending_setup** - New customer, setup not started
- **in_progress** - Setup in progress (droplet created, Moltbot installing)
- **active** - Fully onboarded, customer is using the service
- **handed_over** - Customer took full ownership (cancelled subscription but kept server)
- **cancelled** - Customer cancelled and didn't take ownership (archived)

## Best Practices

1. **Always add timeline events** when making progress on setup
2. **Use notes** for customer-specific context (preferences, issues, requests)
3. **Move to archive/** when customer cancels (don't delete)
4. **Keep subscription data updated** from Stripe webhooks (future automation)

## Future Enhancements

- Stripe webhook integration (auto-create customers)
- Email templates (auto-send onboarding emails)
- Setup automation (Terraform for droplet provisioning)
- Customer dashboard (simple web UI)
- Billing dashboard (track MRR, churn, etc.)

For now: keep it simple. Manual is fine for <20 customers.
