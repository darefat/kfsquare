/**
 * scripts/seed-local.js
 * ─────────────────────
 * Seeds the local MongoDB with realistic test data for development.
 *
 * USAGE:
 *   node scripts/seed-local.js
 *
 * REQUIRES:
 *   - MongoDB running on localhost:27017
 *   - .env.local copied to .env  (or MONGODB_URI env var set)
 *
 * PRODUCTION NOTE:
 *   Do NOT run this against the production database.
 *   For production seeding use:  npm run seed  (reads MONGODB_URI from .env)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kfsquare_dev';

// ── Inline Contact schema (matches models/Contact.js) ─────────────────────────
const contactSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, lowercase: true },
  phone:           { type: String, trim: true },
  company:         { type: String, trim: true },
  serviceInterest: {
    type: String,
    enum: ['data-engineering', 'predictive-analytics', 'process-automation',
           'business-intelligence', 'data-governance', 'strategic-consulting', 'other'],
    default: 'other'
  },
  budget: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-500k', '500k+', 'not-specified'],
    default: 'not-specified'
  },
  message:   { type: String, required: true },
  source:    { type: String, default: 'website' },
  status:    { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'converted', 'closed'], default: 'new' },
  priority:  { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  emailSent: { type: Boolean, default: false },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// ── Test records ───────────────────────────────────────────────────────────────
const testContacts = [
  {
    name:            'Jane Smith',
    email:           'jane.smith@techcorp.com',
    phone:           '202-555-0101',
    company:         'TechCorp Inc.',
    serviceInterest: 'data-engineering',
    budget:          '50k-100k',
    message:         'We need to migrate our legacy ETL pipelines to a modern cloud-based solution. Looking for a partner to help us architect and implement this.',
    source:          'website',
    status:          'new',
    priority:        'high',
    emailSent:       false
  },
  {
    name:            'Robert Johnson',
    email:           'rjohnson@healthgroup.org',
    phone:           '410-555-0202',
    company:         'HealthGroup Partners',
    serviceInterest: 'predictive-analytics',
    budget:          '100k-500k',
    message:         'We want to build a patient outcome prediction model using our historical claims data. Urgently needed for our Q3 board presentation.',
    source:          'website',
    status:          'qualified',
    priority:        'urgent',
    emailSent:       true
  },
  {
    name:            'Maria Garcia',
    email:           'mgarcia@retailco.com',
    phone:           '',
    company:         'RetailCo',
    serviceInterest: 'business-intelligence',
    budget:          '10k-50k',
    message:         'Looking for a Power BI dashboard solution for our regional sales teams. We have data in Snowflake and need real-time reporting.',
    source:          'website',
    status:          'contacted',
    priority:        'medium',
    emailSent:       true
  },
  {
    name:            'David Lee',
    email:           'david.lee@govagency.gov',
    phone:           '703-555-0303',
    company:         'US Federal Agency (SBIR)',
    serviceInterest: 'process-automation',
    budget:          '100k-500k',
    message:         'Interested in workflow automation for document processing and knowledge management across our agency. Need a DVBE-certified vendor.',
    source:          'referral',
    status:          'proposal',
    priority:        'high',
    emailSent:       true
  },
  {
    name:            'Sarah Williams',
    email:           'swilliams@startup.io',
    phone:           '415-555-0404',
    company:         'DataStartup.io',
    serviceInterest: 'strategic-consulting',
    budget:          'under-10k',
    message:         'Early-stage startup looking for strategic guidance on our data architecture before we scale. Would love a free consultation to start.',
    source:          'website',
    status:          'new',
    priority:        'low',
    emailSent:       false
  }
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    // Never print a connection URI; it may contain database credentials.
    console.log('Connecting to configured MongoDB instance...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected.');

    // Clear existing test contacts
    const deleted = await Contact.deleteMany({ source: { $in: ['website', 'referral'] } });
    console.log(`Cleared ${deleted.deletedCount} existing contacts.`);

    // Insert test records
    const inserted = await Contact.insertMany(testContacts);
    console.log(`\nInserted ${inserted.length} test contacts:\n`);

    inserted.forEach(function (c) {
      console.log(`  [${c.status.toUpperCase().padEnd(10)}] ${c.name.padEnd(20)} <${c.email}>`);
    });

    // Summary
    const total = await Contact.countDocuments();
    console.log(`\nTotal contacts in DB: ${total}`);
    console.log('\nDone. To view data:\n  mongosh mongodb://localhost:27017/kfsquare_dev');
    console.log('  > db.contacts.find().pretty()');

  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
