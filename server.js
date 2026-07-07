// ---------------------------------------------------------------------------
// PRODUCTION NOTE: All configuration is loaded from the .env file at startup.
//   - Development: copy .env.local → .env  (local MongoDB, no Mailgun)
//   - Production:  restore .env.production.bak → .env  (Atlas URI + Mailgun keys)
// See DEPLOYMENT.md → "Contact Form: Local Testing & Production Deployment"
// for the full step-by-step guide.
//
// SECURITY: Never hardcode secrets in source code.
//   Set all keys via environment variables on your hosting platform:
//     Render   → https://dashboard.render.com  → Environment
//     Heroku   → heroku config:set KEY=value
//     AWS      → Secrets Manager or ECS task env
//     VPS/PM2  → set in .env on the server, never commit .env to git
// ---------------------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');

// ---------------------------------------------------------------------------
// Startup environment validation
// Logs which required vars are missing — never logs the actual values.
// ---------------------------------------------------------------------------
// MongoDB is OPTIONAL: if MONGODB_URI is absent the server still runs and the
// contact form still sends email — submissions just aren't persisted.
const REQUIRED_PROD_VARS = ['SESSION_SECRET'];
if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_PROD_VARS.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Set them on your hosting platform — do NOT hardcode them in source code.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set — running WITHOUT a database.');
    console.warn('   Contact form email will still send; submissions will not be saved.');
  }
  // Warn if Mailgun is unconfigured (non-fatal — contacts still save to MongoDB)
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('⚠️  MAILGUN_API_KEY or MAILGUN_DOMAIN not set — email notifications disabled.');
    console.warn('   Set these in your hosting platform environment, not in source code.');
  }
}

const app = express();

// Trust the hosting platform's reverse proxy (Render, Heroku, nginx, etc.) so
// req.ip and express-rate-limit read the real client IP from X-Forwarded-For.
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000; // Set PORT in your hosting platform env to override

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration.
// The production site origins are ALWAYS allowed so the contact form on
// kfsquare.com works even if ALLOWED_ORIGINS/NODE_ENV env vars are missing.
// Extra origins can be added via the ALLOWED_ORIGINS env var (comma-separated).
const DEFAULT_ORIGINS = [
  'https://kfsquare.com',
  'https://www.kfsquare.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser clients (no Origin) and any whitelisted origin.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.GENERAL_RATE_LIMIT || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.EMAIL_RATE_LIMIT || 5,
  message: {
    error: 'Too many contact form submissions from this IP, please try again later.'
  }
});

app.use(generalLimiter);
app.use(express.static(path.join(__dirname)));

// MongoDB connection with retry logic
// PRODUCTION NOTE: Set MONGODB_URI in .env to your MongoDB Atlas SRV connection string:
//   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/kfsquare?retryWrites=true&w=majority
// For local testing: MONGODB_URI=mongodb://localhost:27017/kfsquare_dev
const connectDB = async () => {
  // MongoDB is optional — skip entirely if no connection string is configured.
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not set — skipping database. Email still works.');
    return false;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️ Continuing without database — contact email still works.');
    return false;
  }
};

// Contact model.
// IMPORTANT: use the single shared model from models/Contact.js. Defining a
// second mongoose.model('Contact', ...) here caused an OverwriteModelError crash
// because routes/contacts.js also loads the shared model.
const Contact = require('./models/Contact');

// Mailgun setup
// PRODUCTION NOTE: Set these in .env to enable outbound email:
//   MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   MAILGUN_DOMAIN=mg.kfsquare.com   (must be a verified sending domain in Mailgun)
//   MAILGUN_BASE_URL=https://api.mailgun.net  (use https://api.eu.mailgun.net for EU region)
//   RECIPIENT_EMAIL=customersupport@kfsquare.com  (defaults to this if not set)
// If these keys are absent, contact records still save to MongoDB — only email is skipped.
let mailgunClient = null;
const recipientEmail = process.env.RECIPIENT_EMAIL || 'customersupport@kfsquare.com';

if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  const mailgun = new Mailgun(formData);
  mailgunClient = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
  });
  console.log('✅ Mailgun client initialized');
} else {
  console.warn('⚠️ Mailgun not configured - emails will not be sent');
}

// Database connection status
let database = { isConnected: false };

// Enhanced contact form endpoint
app.post('/api/contacts', emailLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).escape().withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('message').trim().isLength({ min: 10, max: 2000 }).escape().withMessage('Message must be between 10-2000 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).escape(),
  body('company').optional().trim().isLength({ max: 100 }).escape(),
  body('serviceInterest').optional().isIn(['data-engineering', 'predictive-analytics', 'llm-integration', 'business-intelligence', 'data-governance', 'strategic-consulting', 'other']),
  body('website').isEmpty().withMessage('Invalid submission detected') // Honeypot
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
      errors: errors.array()
    });
  }

  const { name, email, message, phone, company, serviceInterest } = req.body;

  // Human-readable service labels — declared here so BOTH the notification
  // email and the user confirmation email can use it (previously scoped inside
  // the notification block, causing 'serviceLabels is not defined').
  const serviceLabels = {
    'data-engineering':     'Data Engineering',
    'predictive-analytics': 'Predictive Analytics',
    'llm-integration':      'AI & LLM Integration',
    'business-intelligence':'Business Intelligence',
    'data-governance':      'Data Governance',
    'strategic-consulting': 'Strategic Consulting',
    'other':                'Other Services'
  };

  try {
    // 1. Save contact to MongoDB
    let contact = null;
    if (database.isConnected) {
      const contactData = {
        name,
        email,
        message,
        phone: phone || '',
        company: company || '',
        serviceInterest: serviceInterest || 'other',
        source: 'website',
        status: 'new',
        priority: serviceInterest === 'consulting' || serviceInterest === 'ai-ml' ? 'high' : 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };
      
      contact = new Contact(contactData);
      await contact.save();
      console.log(`💾 Contact saved to MongoDB: ${contact._id}`);
    }

    // 2. Send email via Mailgun
    let emailSent = false;
    if (mailgunClient && process.env.MAILGUN_DOMAIN) {
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">
                <span style="color: #ffc107;">KF</span>SQUARE
              </h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New Contact Form Submission</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #1e3c72; margin-top: 0; font-size: 24px;">Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #333; width: 30%;">Name:</td>
                  <td style="padding: 12px 0; color: #666;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #333;">Email:</td>
                  <td style="padding: 12px 0; color: #666;"><a href="mailto:${email}" style="color: #1e3c72; text-decoration: none;">${email}</a></td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #333;">Phone:</td>
                  <td style="padding: 12px 0; color: #666;"><a href="tel:${phone}" style="color: #1e3c72; text-decoration: none;">${phone}</a></td>
                </tr>` : ''}
                ${company ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #333;">Company:</td>
                  <td style="padding: 12px 0; color: #666;">${company}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #333;">Service Interest:</td>
                  <td style="padding: 12px 0; color: #666;">
                    <span style="background: #1e3c72; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px;">
                      ${serviceLabels[serviceInterest] || 'Other'}
                    </span>
                  </td>
                </tr>
              </table>
              
              <h3 style="color: #1e3c72; margin-top: 30px; font-size: 20px;">Message</h3>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1e3c72; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              <!-- Quick Actions -->
              <div style="margin-top: 30px; text-align: center;">
                <a href="mailto:${email}?subject=Re: Your inquiry to KFSQUARE" 
                   style="display: inline-block; background: #1e3c72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">
                   Reply to ${name}
                </a>
                ${phone ? `
                <a href="tel:${phone}" 
                   style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">
                   Call ${name}
                </a>` : ''}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #e9ecef; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0; line-height: 1.5;">
                📅 Submitted: ${new Date().toLocaleString('en-US', { 
                  timeZone: 'America/New_York',
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}<br>
                🆔 Contact ID: ${contact ? contact._id : 'N/A'}<br>
                🌐 IP Address: ${req.ip || 'Unknown'}<br>
                📱 User Agent: ${req.get('User-Agent') || 'Unknown'}
              </p>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="margin: 0; font-size: 11px; color: #999;">
                  This email was sent from the KFSQUARE contact form on kfsquare.com
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>`;

      const textBody = `
KFSQUARE - New Contact Form Submission

CONTACT DETAILS:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}${company ? `Company: ${company}\n` : ''}Service Interest: ${serviceLabels[serviceInterest] || 'Other'}

MESSAGE:
${message}

SUBMISSION DETAILS:
Submitted: ${new Date().toLocaleString()}
Contact ID: ${contact ? contact._id : 'N/A'}
IP Address: ${req.ip || 'Unknown'}
User Agent: ${req.get('User-Agent') || 'Unknown'}

---
Reply directly to this email to respond to ${name}.
      `;

      await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `KFSQUARE Contact Form <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: [recipientEmail],
        'h:Reply-To': email,
        subject: `🚀 New Contact: ${name} - ${serviceLabels[serviceInterest] || 'General Inquiry'}`,
        text: textBody,
        html: htmlBody,
        'o:tag': ['contact-form', serviceInterest || 'other'],
        'o:tracking': true,
        'o:tracking-clicks': true,
        'o:tracking-opens': true
      });
      
      emailSent = true;
      console.log(`📧 Email sent successfully to ${recipientEmail} from ${email}`);
      
      // Update contact record with email status
      if (contact) {
        contact.emailSent = true;
        contact.emailSentAt = new Date();
        await contact.save();
      }
    }

    // 3. Send confirmation email to user
    if (mailgunClient && emailSent) {
      try {
        const confirmationHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;"><span style="color: #ffc107;">KF</span>SQUARE</h1>
                <p style="color: white; margin: 10px 0 0 0;">Thank you for contacting us!</p>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #1e3c72; margin-top: 0;">Hi ${name},</h2>
                <p>Thank you for reaching out to KFSQUARE regarding <strong>${serviceLabels[serviceInterest] || 'our services'}</strong>.</p>
                <p>We've received your message and our team will review your inquiry carefully. You can expect a personalized response from our experts within <strong>24 hours</strong>.</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3c72;">
                  <h4 style="margin-top: 0; color: #1e3c72;">What happens next?</h4>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Our team will review your specific requirements</li>
                    <li>We'll prepare a customized solution proposal</li>
                    <li>You'll receive a detailed response within 24 hours</li>
                    <li>We'll schedule a consultation call if needed</li>
                  </ul>
                </div>
                <p>In the meantime, feel free to explore our <a href="https://kfsquare.com/services.html" style="color: #1e3c72;">services</a> or <a href="https://kfsquare.com/portfolio.html" style="color: #1e3c72;">portfolio</a> to learn more about our capabilities.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <p style="margin: 0; color: #666;">Questions? Contact us anytime:</p>
                  <p style="margin: 5px 0;">📧 <a href="mailto:customersupport@kfsquare.com" style="color: #1e3c72;">customersupport@kfsquare.com</a></p>
                  <p style="margin: 5px 0;">📞 <a href="tel:+14109347470" style="color: #1e3c72;">410-934-7470</a></p>
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                <p style="margin: 0;">Best regards,<br>The KFSQUARE Team</p>
                <p style="margin: 10px 0 0 0; font-size: 12px;">
                  Small Business & Veteran Owned |
                </p>
              </div>
            </div>
          </body>
          </html>`;

        await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, {
          from: `KFSQUARE Team <customersupport@${process.env.MAILGUN_DOMAIN}>`,
          to: [email],
          subject: `✅ We received your message, ${name}!`,
          html: confirmationHtml,
          text: `Hi ${name},\n\nThank you for contacting KFSQUARE! We've received your inquiry about ${serviceLabels[serviceInterest] || 'our services'} and will respond within 24 hours.\n\nBest regards,\nThe KFSQUARE Team\n\nQuestions? Email us at customersupport@kfsquare.com or call 410-934-7470`,
          'o:tag': ['confirmation', 'contact-form']
        });
        
        console.log(`📧 Confirmation email sent to ${email}`);
      } catch (confirmError) {
        console.error('Confirmation email error:', confirmError);
        // Don't fail the request if confirmation email fails
      }
    }

    // 4. Return success response
    res.status(200).json({ 
      success: true, 
      message: `Thank you ${name}! Your message has been sent successfully. We'll respond within 24 hours.`,
      data: {
        id: contact ? contact._id : null,
        emailSent,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    
    // Log detailed error for debugging
    if (error.response && error.response.body) {
      console.error("Mailgun Response Error:", error.response.body);
    }
    
    // Expose error detail when DEBUG_ERRORS=true (temporary diagnostics) or in dev.
    const showDetail = process.env.NODE_ENV === 'development' || process.env.DEBUG_ERRORS === 'true';
    res.status(500).json({ 
      success: false, 
      message: 'We apologize, but there was an error processing your request. Please try again or contact us directly at customersupport@kfsquare.com or 410-934-7470.',
      error: showDetail ? error.message : undefined,
      mailgun: showDetail && error.response && error.response.body ? error.response.body : undefined,
      status: showDetail ? error.status : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: database.isConnected ? 'connected' : 'disconnected',
    mailgun: mailgunClient ? 'configured' : 'not configured'
  });
});

// ---------------------------------------------------------------------------
// Admin: list contacts stored in MongoDB
// Usage:  GET /api/admin/contacts?status=new&limit=50&page=1
// This endpoint is intentionally unauthenticated for local dev.
// In production, protect it with an API key or move behind an admin login.
// ---------------------------------------------------------------------------
app.get('/api/admin/contacts', async (req, res) => {
  if (!database.isConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }

  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const contacts = await Contact
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const count = await Contact.countDocuments(filter);

    res.json({ success: true, count, page: parseInt(page), contacts });
  } catch (err) {
    console.error('Admin contacts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve contacts' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*.html', (req, res) => {
  const filename = req.path.substring(1);

  // Resolve the full absolute path and prevent path traversal attacks
  const fullPath = path.resolve(__dirname, filename);
  if (!fullPath.startsWith(__dirname + path.sep) && fullPath !== __dirname) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.sendFile(fullPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ─── ROUTES ─────────────────────────────────────────────────────────────────
// Modular route handlers for better organization
// ────────────────────────────────────────────────────────────────────────────
const contactsRouter = require('./routes/contacts');
const chatRouter     = require('./routes/chat');
const adminRouter    = require('./routes/admin');

// API routes
app.use('/api/contacts', contactsRouter);
app.use('/api/chat',     chatRouter);
app.use('/api/admin',    adminRouter);

// ─── Admin HTML dashboard (Basic Auth protected) ──────────────────────────────
app.get('/admin', (req, res) => {
    if (process.env.NODE_ENV === 'production' && process.env.ADMIN_ENABLED !== 'true') {
        return res.status(403).json({ error: 'Admin panel disabled in production.' });
    }
    const authHeader = req.headers['authorization'] || '';
    const base64     = authHeader.startsWith('Basic ') ? authHeader.slice(6) : '';
    const decoded    = Buffer.from(base64, 'base64').toString('utf8');
    const colonIdx   = decoded.indexOf(':');
    const user       = decoded.slice(0, colonIdx);
    const pass       = decoded.slice(colonIdx + 1);

    if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
        return res.sendFile(path.join(__dirname, 'admin.html'));
    }
    res.set('WWW-Authenticate', 'Basic realm="KFSQUARE Admin"');
    res.status(401).send('Credentials required — enter admin username and password.');
});

// Initialize database and start server
const startServer = async () => {
  // Connect to database
  database.isConnected = await connectDB();
  
  if (!database.isConnected) {
    console.warn('⚠️ Starting server without database connection - contacts will not be saved');
  }
  
  // Start server (skip listen in test mode so Jest can import the app cleanly)
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Email configured: ${mailgunClient ? '✅' : '❌'}`);
      console.log(`💾 Database connected: ${database.isConnected ? '✅' : '❌'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
};

startServer();

module.exports = app;