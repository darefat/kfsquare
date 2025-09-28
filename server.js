require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
// Mailgun email client
const Mailgun = require('mailgun.js');
const formData = require('form-data');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');
const fs = require('fs');

// MongoDB Integration
const database = require('./config/database');
const DataSeeder = require('./utils/seeder');

// API Routes
const teamRoutes = require('./routes/team');
const servicesRoutes = require('./routes/services');
const contactsRoutes = require('./routes/contacts');
const chatRoutes = require('./routes/chat');

// Models
const Contact = require('./models/Contact');

// Platform detection for cross-platform compatibility
const platform = os.platform();
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';
const isMac = platform === 'darwin';

console.log(`🌐 Platform detected: ${platform} (${isWindows ? 'Windows' : isLinux ? 'Linux' : isMac ? 'macOS' : 'Other'})`);

const app = express();
const port = process.env.PORT || 3000;
// Mailgun env vars (support *_FILE)
const mailgunApiKey = readSecret('MAILGUN_API_KEY', 'MAILGUN_API_KEY_FILE');
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const mailgunBaseUrl = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net';
const recipientEmail = process.env.RECIPIENT_EMAIL;
const corsOrigin = process.env.CORS_ORIGIN;
const isProduction = process.env.NODE_ENV === 'production';
// Prefer explicit public URL in production (e.g., GitHub Pages or site domain)
const publicUrl = process.env.PUBLIC_URL || '';
let publicOrigin = null;
try { if (publicUrl) { publicOrigin = new URL(publicUrl).origin; } } catch (_) {}

// Helper to parse comma-separated env vars
function parseCsv(value) {
  return (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// Helper to read secret from env or file (e.g., *_FILE)
function readSecret(envKey, fileEnvKey) {
  const value = process.env[envKey];
  const filePath = process.env[fileEnvKey];
  if (value) return value;
  if (filePath) {
    try { return fs.readFileSync(filePath, 'utf8').trim(); } catch (e) {
      console.warn(`⚠️  Could not read secret file for ${envKey}:`, e.message);
    }
  }
  return '';
}

// Allow configuring multiple origins via ALLOWED_ORIGINS (comma-separated)
const allowedOrigins = parseCsv(process.env.ALLOWED_ORIGINS);
// Optional: add CDN domains to CSP via CDN_DOMAINS (comma-separated)
const cdnDomains = parseCsv(process.env.CDN_DOMAINS);

// Resolve static root (dist in production, project root in dev)
const staticRoot = isProduction ? path.join(__dirname, 'dist') : path.join(__dirname);

// Production Security Middleware with dynamic CSP
const cspDirectives = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https:"]
};

// Always allow common CDN used in this project if present
const defaultCdnAllowlist = [
  'https://cdnjs.cloudflare.com' // Font Awesome/other libs via cdnjs
];

// Merge CDN domains into CSP
[...defaultCdnAllowlist, ...cdnDomains].forEach(domain => {
  if (!domain) return;
  // Add to multiple sources to keep it simple; refine if needed
  ['styleSrc', 'fontSrc', 'scriptSrc', 'imgSrc', 'connectSrc'].forEach(key => {
    if (!cspDirectives[key].includes(domain)) {
      cspDirectives[key].push(domain);
    }
  });
});

let mailgunClient = null;
if (!mailgunApiKey || !mailgunDomain) {
  console.warn('⚠️  Mailgun API key and/or domain is missing. Email functionality will be disabled.');
  console.log('   Set MAILGUN_API_KEY and MAILGUN_DOMAIN in your environment or .env file');
} else {
  try {
    const mg = new Mailgun(formData);
    mailgunClient = mg.client({ username: 'api', key: mailgunApiKey, url: mailgunBaseUrl });
    console.log('✅ Mailgun configured successfully');
  } catch (e) {
    console.warn('⚠️  Failed to initialize Mailgun:', e.message);
  }
}

app.use(helmet({
  contentSecurityPolicy: { directives: cspDirectives },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression for better performance
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for email endpoint
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 email submissions per hour
  message: 'Too many email submissions from this IP, please try again later.',
});

// CORS Configuration (env-driven)
const resolvedCorsOrigins = (() => {
  if (allowedOrigins.length) return allowedOrigins;
  if (corsOrigin) return [corsOrigin];
  if (isProduction && publicOrigin) return [publicOrigin];
  return isProduction ? ['https://kfsquare.com'] : [];
})();

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin or non-browser requests
    if (!origin) return callback(null, true);
    // Allow everything in dev
    if (!isProduction) return callback(null, true);
    // Check against allowlist
    if (resolvedCorsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
  credentials: true
}));

// Body parser with size limits
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Static file serving with caching (dist in production)
app.use(express.static(staticRoot, {
  maxAge: isProduction ? '1y' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, p) => {
    if (p.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
    }
    if (p.includes('.min.') || p.match(/\.(?:css|js)$/)) {
      // Long cache, immutable for minified assets
      const value = p.includes('.min.')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=31536000';
      res.setHeader('Cache-Control', value);
    }
  }
}));

// API Routes
app.use('/api/team', teamRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/chat', chatRoutes);

// Database initialization
async function initializeDatabase() {
  try {
    await database.connect();
    
    // Check if database needs seeding
    const seeder = new DataSeeder();
    const stats = await seeder.getStats();
    
    if (!stats || (stats.teamMembers === 0 && stats.services === 0)) {
      console.log('🌱 Database appears to be empty, seeding with initial data...');
      await seeder.seedDatabase();
      await seeder.getStats();
    } else {
      console.log('📊 Database already contains data');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Input validation middleware with enhanced security
const validate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Invalid email address'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .escape()
    .withMessage('Message must be between 10 and 1000 characters')
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: database.isConnected ? 'connected' : 'disconnected'
  });
});

// API health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connectivity
    const dbStatus = database.isConnected;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: dbStatus ? 'connected' : 'disconnected',
        email: mailgunClient ? 'configured' : 'not-configured'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint (serve from dist in production)
app.get('/', (req, res) => {
  res.sendFile(path.join(staticRoot, 'index.html'));
});

// Enhanced contact form endpoint with database storage
app.post('/send-email', emailLimiter, validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => err.msg)
    });
  }

  const { name, email, message } = req.body;

  // Honeypot check (if implemented in frontend)
  if (req.body.website) {
    return res.status(400).json({ success: false, message: 'Spam detected' });
  }

  try {
    // Save contact to database if connected
    let contact = null;
    if (database.isConnected) {
      const contactData = {
        name,
        email,
        message,
        phone: req.body.phone || '',
        company: req.body.company || '',
        serviceInterest: req.body.serviceInterest || 'other',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        source: 'website'
      };
      
      contact = new Contact(contactData);
      await contact.save();
      console.log(`💾 Contact saved to database: ${contact._id}`);
    }

    // Send email via Mailgun if configured
    if (mailgunClient) {
      const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #01326d;">New Contact Form Submission</h2>
            <div style="background: #f9fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #01326d;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="color: #666; font-size: 12px;">
              Submitted on ${new Date().toLocaleString()}
              ${contact ? `<br>Database ID: ${contact._id}` : ''}
            </p>
          </div>`;

      await mailgunClient.messages.create(mailgunDomain, {
        from: 'KFSQUARE <noreply@kfsquare.com>',
        to: [recipientEmail || 'customersupport@kfsquare.com'],
        'h:Reply-To': email,
        subject: 'Contact Form Submission from KFSQUARE Website',
        text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        html: htmlBody
      });
      console.log(`📧 Email sent successfully via Mailgun from ${email}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      data: contact ? { id: contact._id } : null
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error.response) {
      console.error("Mailgun Response:", error.response.body);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error processing contact form. Please try again later.' 
    });
  }
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid JSON payload' 
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      success: false, 
      message: 'Payload too large' 
    });
  }

  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown with platform-aware signal handling
const server = app.listen(port, async () => {
  console.log(`🚀 KFSQUARE Server running on ${publicUrl || `http://localhost:${port}`}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Mailgun configured: ${!!mailgunClient}`);
  console.log(`💻 Platform: ${platform}`);
  console.log(`🏠 Serving static from: ${staticRoot}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // Initialize database connection
  await initializeDatabase();
  
  console.log('✅ Server initialization complete');

  // Notify PM2 that the app is ready (for wait_ready)
  if (typeof process.send === 'function') {
    try { process.send('ready'); } catch (_) {}
  }
});

// Platform-aware graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    // Close database connection
    try {
      await database.disconnect();
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
    }
    
    console.log('✅ Server closed successfully');
    console.log('👋 Process terminated');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle different signals based on platform
if (isWindows) {
  // Windows doesn't support SIGTERM/SIGINT the same way
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
} else {
  // Unix-like systems (Linux, macOS)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;