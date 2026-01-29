#!/usr/bin/env node

/**
 * Customer Tracking CLI for StuffPress
 * 
 * Usage:
 *   ./customer-cli.js add <email> <stripeSubId>
 *   ./customer-cli.js list
 *   ./customer-cli.js show <email>
 *   ./customer-cli.js update <email> <field> <value>
 *   ./customer-cli.js timeline <email> <event> <details>
 *   ./customer-cli.js note <email> <note>
 */

const fs = require('fs');
const path = require('path');

const CUSTOMERS_DIR = path.join(__dirname, 'customers', 'active');
const ARCHIVE_DIR = path.join(__dirname, 'customers', 'archive');

// Ensure directories exist
[CUSTOMERS_DIR, ARCHIVE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function getCustomerPath(email) {
  const filename = email.replace('@', '_at_').replace(/[^a-z0-9_.-]/gi, '_') + '.json';
  return path.join(CUSTOMERS_DIR, filename);
}

function loadCustomer(email) {
  const customerPath = getCustomerPath(email);
  if (!fs.existsSync(customerPath)) {
    console.error(`Customer not found: ${email}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(customerPath, 'utf8'));
}

function saveCustomer(email, data) {
  const customerPath = getCustomerPath(email);
  fs.writeFileSync(customerPath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved customer: ${email}`);
}

function addTimeline(customer, event, details) {
  customer.timeline.push({
    timestamp: new Date().toISOString(),
    event,
    details
  });
}

// Commands

function addCustomer(email, stripeSubId) {
  const customerPath = getCustomerPath(email);
  if (fs.existsSync(customerPath)) {
    console.error(`Customer already exists: ${email}`);
    process.exit(1);
  }

  const template = JSON.parse(fs.readFileSync(path.join(__dirname, 'customers', 'TEMPLATE.json'), 'utf8'));
  const customer = {
    ...template,
    id: `cust_${Date.now()}`,
    email,
    signupDate: new Date().toISOString(),
    subscription: {
      ...template.subscription,
      stripeSubscriptionId: stripeSubId
    },
    timeline: [
      {
        timestamp: new Date().toISOString(),
        event: 'subscription_created',
        details: `Customer signed up via Stripe (${stripeSubId})`
      }
    ]
  };

  saveCustomer(email, customer);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Provision DigitalOcean droplet`);
  console.log(`   2. Install Moltbot/Clawdbot`);
  console.log(`   3. Get customer's Telegram username`);
  console.log(`   4. Connect and test`);
  console.log(`   5. Send onboarding message\n`);
}

function listCustomers() {
  const files = fs.readdirSync(CUSTOMERS_DIR).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('No customers yet.');
    return;
  }

  console.log('\n📊 Active Customers:\n');
  files.forEach(file => {
    const customer = JSON.parse(fs.readFileSync(path.join(CUSTOMERS_DIR, file), 'utf8'));
    const setupStatus = customer.setup.handoff.completed ? '✅' : 
                       customer.setup.moltbot.installed ? '🔧' : 
                       customer.setup.droplet.id ? '💻' : '⏳';
    console.log(`  ${setupStatus} ${customer.email.padEnd(30)} ${customer.status.padEnd(15)} ${customer.signupDate.split('T')[0]}`);
  });
  console.log('');
}

function showCustomer(email) {
  const customer = loadCustomer(email);
  console.log('\n' + JSON.stringify(customer, null, 2) + '\n');
}

function updateCustomer(email, field, value) {
  const customer = loadCustomer(email);
  
  // Handle nested fields (e.g., "setup.droplet.id")
  const parts = field.split('.');
  let target = customer;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]];
  }
  
  // Parse value
  let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (value === 'null') parsedValue = null;
  else if (!isNaN(value)) parsedValue = Number(value);
  
  target[parts[parts.length - 1]] = parsedValue;
  
  addTimeline(customer, 'field_updated', `Updated ${field} to ${parsedValue}`);
  saveCustomer(email, customer);
}

function addNote(email, note) {
  const customer = loadCustomer(email);
  customer.notes.push({
    timestamp: new Date().toISOString(),
    note
  });
  addTimeline(customer, 'note_added', note);
  saveCustomer(email, customer);
}

function addTimelineEvent(email, event, details) {
  const customer = loadCustomer(email);
  addTimeline(customer, event, details);
  saveCustomer(email, customer);
}

// CLI Router

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case 'add':
    if (args.length < 2) {
      console.error('Usage: customer-cli.js add <email> <stripeSubId>');
      process.exit(1);
    }
    addCustomer(args[0], args[1]);
    break;

  case 'list':
    listCustomers();
    break;

  case 'show':
    if (args.length < 1) {
      console.error('Usage: customer-cli.js show <email>');
      process.exit(1);
    }
    showCustomer(args[0]);
    break;

  case 'update':
    if (args.length < 3) {
      console.error('Usage: customer-cli.js update <email> <field> <value>');
      process.exit(1);
    }
    updateCustomer(args[0], args[1], args[2]);
    break;

  case 'note':
    if (args.length < 2) {
      console.error('Usage: customer-cli.js note <email> <note>');
      process.exit(1);
    }
    addNote(args[0], args.slice(1).join(' '));
    break;

  case 'timeline':
    if (args.length < 3) {
      console.error('Usage: customer-cli.js timeline <email> <event> <details>');
      process.exit(1);
    }
    addTimelineEvent(args[0], args[1], args.slice(2).join(' '));
    break;

  default:
    console.log(`
StuffPress Customer Tracking CLI

Commands:
  add <email> <stripeSubId>       Add new customer
  list                            List all active customers
  show <email>                    Show customer details
  update <email> <field> <value>  Update a field (e.g., "setup.droplet.id" "123")
  note <email> <note>             Add a note
  timeline <email> <event> <details>  Add timeline event

Examples:
  ./customer-cli.js add user@example.com sub_abc123
  ./customer-cli.js list
  ./customer-cli.js show user@example.com
  ./customer-cli.js update user@example.com setup.droplet.id 123456
  ./customer-cli.js update user@example.com setup.moltbot.installed true
  ./customer-cli.js note user@example.com "Customer requested WhatsApp instead of Telegram"
  ./customer-cli.js timeline user@example.com droplet_created "Created droplet 123456"
    `);
    process.exit(command ? 1 : 0);
}
