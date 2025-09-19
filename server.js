require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');

// Platform detection for cross-platform compatibility
const platform = os.platform();
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';
const isMac = platform === 'darwin';

console.log(`🌐 Platform detected: ${platform} (${isWindows ? 'Windows' : isLinux ? 'Linux' : isMac ? 'macOS' : 'Other'})`);

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.SENDGRID_API_KEY;
const recipientEmail = process.env.RECIPIENT_EMAIL;
const corsOrigin = process.env.CORS_ORIGIN;
const isProduction = process.env.NODE_ENV === 'production';

if (!apiKey) {
  console.warn("⚠️  SendGrid API key is missing. Email functionality will be disabled.");
  console.log("   Set SENDGRID_API_KEY in your environment or .env file");
} else {
  sgMail.setApiKey(apiKey);
  console.log("✅ SendGrid configured successfully");
}

// Production Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
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

// CORS Configuration
app.use(cors({
  origin: corsOrigin || (isProduction ? 'https://kfsquare.com' : true),
  optionsSuccessStatus: 200,
  credentials: true
}));

// Body parser with size limits
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Static file serving with caching
app.use(express.static('.', {
  maxAge: isProduction ? '1y' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
    }
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for CSS/JS
    }
  }
}));

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
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Contact form endpoint with enhanced security
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

  const msg = {
    to: recipientEmail || 'contact@kfsquare.com',
    from: 'noreply@kfsquare.com',
    replyTo: email,
    subject: 'Contact Form Submission from KFSQUARE Website',
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    html: `
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
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully from ${email}`);
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error("SendGrid Error:", error);
    if (error.response) {
      console.error("SendGrid Response:", error.response.body);
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error sending email. Please try again later.' 
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
const server = app.listen(port, () => {
  console.log(`🚀 KFSQUARE Server running on http://localhost:${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 SendGrid configured: ${!!process.env.SENDGRID_API_KEY}`);
  console.log(`💻 Platform: ${platform}`);
  console.log(`🏠 Working directory: ${process.cwd()}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Platform-aware graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
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