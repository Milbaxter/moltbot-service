# Customer Onboarding Workflow

## Overview

When a customer signs up for StuffPress ($89.99/month), they get their own Moltbot instance running on a private cloud server. This doc walks through the entire onboarding process from Stripe payment to customer handoff.

---

## 1. Customer Signs Up (Stripe)

**What happens:**
- Customer clicks "Start Your Subscription" on stuffpress landing page
- Stripe checkout completes
- You receive email notification from Stripe

**Your action:**
```bash
# Add customer to tracking system
./customer-cli.js add customer@example.com sub_abc123xyz
```

**Output:**
```
✅ Saved customer: customer@example.com

📋 Next steps:
   1. Provision DigitalOcean droplet
   2. Install Moltbot/Clawdbot
   3. Get customer's Telegram username
   4. Connect and test
   5. Send onboarding message
```

---

## 2. Contact Customer (Within 4 Hours)

**Email template:**

```
Subject: Welcome to StuffPress! Quick setup info needed

Hi [Name],

Thanks for signing up! 🎉

I'm setting up your personal Moltbot instance now. To finish the setup, I need:

1. Your Telegram username (starts with @)
   - If you don't have Telegram yet: https://telegram.org/
   
2. Any integrations you'd like connected initially:
   [ ] Google Calendar
   [ ] Gmail
   [ ] Notion
   [ ] Other: ___________

I'll have everything ready within 24 hours. Reply with your Telegram username and I'll send you the bot link when it's live.

- Mili
  StuffPress
```

**Track the outreach:**
```bash
./customer-cli.js timeline customer@example.com contact_sent "Sent setup email"
./customer-cli.js note customer@example.com "Waiting for Telegram username"
```

---

## 3. Provision Infrastructure (~30 min)

### Create DigitalOcean Droplet

**Specs:**
- **Size:** Basic Droplet ($5-10/month)
- **Image:** Ubuntu 22.04 LTS
- **Region:** Closest to customer (ask if needed, default SF)
- **SSH Keys:** Add your key for setup access

**After creation:**
```bash
# Record droplet details
./customer-cli.js update customer@example.com setup.droplet.id 123456789
./customer-cli.js update customer@example.com setup.droplet.ip "64.23.123.45"
./customer-cli.js update customer@example.com setup.droplet.created "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
./customer-cli.js timeline customer@example.com droplet_created "Created DO droplet 123456789"
```

### SSH into droplet and install dependencies

```bash
ssh root@64.23.123.45

# Update system
apt update && apt upgrade -y

# Install Node.js (NVM recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24

# Install Clawdbot globally
npm install -g clawdbot

# Verify installation
clawdbot --version
```

---

## 4. Configure Moltbot (~15 min)

### Create Telegram Bot (for customer)

1. Message @BotFather on Telegram
2. Send `/newbot`
3. Name: `[CustomerName]'s Moltbot`
4. Username: `[customername]_moltbot` (must be unique)
5. Copy the bot token

**Track:**
```bash
./customer-cli.js update customer@example.com setup.messaging.botToken "1234567890:ABCDEF..."
```

### Initialize Clawdbot

```bash
# On the droplet
clawdbot configure

# Follow wizard:
# - Model: Anthropic Claude Sonnet 4.5
# - API Key: Use YOUR Anthropic key (you manage fair use limits)
# - Workspace: /root/clawd
# - Telegram bot token: [paste token from BotFather]
```

### Set up workspace files

```bash
mkdir -p /root/clawd/memory

# Create SOUL.md
cat > /root/clawd/SOUL.md << 'EOF'
# SOUL.md - Who You Are

You're Moltbot, a personal AI assistant for [CUSTOMER_NAME].

Be genuinely helpful, not performatively helpful. Skip filler. Have opinions. Be resourceful before asking.

You have access to [his/her] Telegram. Treat that access with respect. Private things stay private.

Be the assistant they'd actually want to talk to.
EOF

# Create USER.md  
cat > /root/clawd/USER.md << 'EOF'
# USER.md - About Your Human

- **Name:** [CUSTOMER_NAME]
- **Timezone:** [TIMEZONE]
- **Joined StuffPress:** [DATE]

## Notes

[Add any customer-specific context here]
EOF

# Create initial MEMORY.md
cat > /root/clawd/MEMORY.md << 'EOF'
# MEMORY.md

## Setup
- Joined StuffPress on [DATE]
- Initial setup completed by Mili

## Preferences
[To be filled in as you learn]
EOF
```

### Start Clawdbot

```bash
# Start gateway (run in tmux/screen for persistence)
tmux new -s clawdbot
clawdbot gateway start

# Detach: Ctrl+B, then D
```

**Track:**
```bash
./customer-cli.js update customer@example.com setup.moltbot.installed true
./customer-cli.js update customer@example.com setup.moltbot.installedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
./customer-cli.js update customer@example.com setup.moltbot.version "$(clawdbot --version)"
./customer-cli.js timeline customer@example.com moltbot_installed "Moltbot installed and started"
```

---

## 5. Connect Customer (5 min)

### Pair Customer's Telegram

```bash
# On droplet, attach to tmux session
tmux attach -t clawdbot

# Use Clawdbot CLI to send pairing code
# (Customer will /start the bot from Telegram)
```

Or send them the bot link directly:
```
https://t.me/[bot_username]
```

**Test message:**
Send as the customer (or ask them to): "Hey, are you there?"

Bot should respond. If not, check logs:
```bash
clawdbot logs
```

**Track:**
```bash
./customer-cli.js update customer@example.com setup.messaging.connected true
./customer-cli.js update customer@example.com setup.messaging.username "@customertelegram"
./customer-cli.js timeline customer@example.com telegram_connected "Customer connected via Telegram"
```

---

## 6. Customer Handoff (Final Step)

### Send Onboarding Message

Via the Moltbot Telegram (as you, from the server):

```
Hey! 👋 Your Moltbot is live.

You're talking to your own personal AI assistant running on a private server. Here's what you can do:

**Quick Start:**
- Just text me naturally — I'm here to help with anything
- I remember our conversations (check /status to see memory)
- I can run code, search the web, help with projects

**Useful Commands:**
- /status - See session info & memory
- /help - List all commands
- /restart - Restart my brain (clears short-term memory)

**Next Steps:**
- Tell me about yourself! Timezone, preferences, projects
- If you want integrations (Calendar, Gmail, etc.), just ask
- Customize me by editing files in ~/clawd/ on your server

**Your Access:**
- Server IP: 64.23.123.45
- SSH: root@64.23.123.45 (ask Mili for access)
- You own this — full control, export data anytime

Questions? Reply here or email mili@stuffpress.com

Let's get started! What would you like help with?
```

**Track:**
```bash
./customer-cli.js update customer@example.com setup.handoff.completed true
./customer-cli.js update customer@example.com setup.handoff.completedAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
./customer-cli.js update customer@example.com setup.handoff.onboardingMessageSent true
./customer-cli.js update customer@example.com status "active"
./customer-cli.js timeline customer@example.com onboarding_complete "Customer onboarded successfully"
```

---

## 7. Post-Onboarding (Ongoing)

### Customer Requests Handover

If customer wants full ownership:

```bash
# On droplet, reset root password
passwd

# Send to customer:
"Here's your server access:
 - IP: 64.23.123.45
 - User: root
 - Password: [the new password]
 - SSH: ssh root@64.23.123.45

You now have full control. Clawdbot is installed and running. 
Your Anthropic API key is in ~/.clawdbot/clawdbot.json — you'll need to add your own.

After handover, you'll pay:
 - DigitalOcean: ~$5-10/month (droplet hosting)
 - Anthropic: ~$10-50/month (Claude API usage, depends on use)

No more $89.99 to me — you're fully independent! 🎉"
```

**Track:**
```bash
./customer-cli.js timeline customer@example.com handover_complete "Customer took full ownership"
./customer-cli.js update customer@example.com status "handed_over"
# Move to archive if they cancel subscription
mv customers/active/customer_at_example.com.json customers/archive/
```

---

## Quick Reference Commands

```bash
# Add new customer
./customer-cli.js add email@example.com sub_stripeID

# List all customers
./customer-cli.js list

# View customer details
./customer-cli.js show email@example.com

# Update setup progress
./customer-cli.js update email@example.com setup.droplet.id 123456
./customer-cli.js update email@example.com setup.moltbot.installed true
./customer-cli.js update email@example.com setup.messaging.connected true
./customer-cli.js update email@example.com setup.handoff.completed true

# Add timeline events
./customer-cli.js timeline email@example.com event_name "Event details"

# Add notes
./customer-cli.js note email@example.com "Customer prefers WhatsApp"

# Change status
./customer-cli.js update email@example.com status "active"
```

---

## Troubleshooting

**Customer can't connect to bot:**
- Check bot token is correct in config
- Verify gateway is running: `clawdbot status`
- Check logs: `clawdbot logs`
- Restart: `clawdbot gateway restart`

**Bot not responding:**
- Check Anthropic API key is valid
- Check fair use limits (if too many requests, throttle)
- Restart gateway

**Customer wants different messaging platform:**
- WhatsApp: Requires phone number + WhatsApp auth
- Discord: Requires Discord bot setup
- Signal: Requires Signal CLI setup
- **Recommendation:** Start with Telegram (easiest), offer others as add-ons

---

## Monthly Costs (Your Side)

Per customer:
- **DigitalOcean droplet:** $5-10/month
- **Anthropic API (fair use):** ~$10-30/month average
- **Total cost:** ~$15-40/month
- **Revenue:** $89.99/month
- **Margin:** ~$50-75/month per customer

**At 10 customers:** $500-750/month profit  
**At 50 customers:** $2,500-3,750/month profit

---

## Notes

- **Keep it simple:** Don't over-engineer early on. Manual setup is fine for first 10-20 customers.
- **Automate later:** Once you have 20+ customers, automate droplet provisioning (Terraform/DigitalOcean API).
- **Customer retention:** Most churn happens in first 7 days. Quick setup + good onboarding = happy customers.
- **Support:** Use customer timeline/notes to track issues. Build a FAQ from common questions.

🦎 **Remember:** You're not just selling software — you're selling managed infrastructure + your time setting it up. That's the value of the $89.99/month.
