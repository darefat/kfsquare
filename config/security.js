const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const validator = require('validator');
const logger = require('./logger');

/**
 * Production Security Middleware Configuration
 */
class SecurityConfig {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kfsquare';
  }

  /**
   * Enhanced rate limiting with MongoDB store for production
   */
  getRateLimiters() {
    const store = this.isProduction ? 
      new MongoStore({
        uri: this.mongoUri,
        collectionName: 'rate_limits',
        expireTimeMs: 15 * 60 * 1000 // 15 minutes
      }) : undefined;

    return {
      // General API rate limiting
      general: rateLimit({
        store,
        windowMs: parseInt(process.env.GENERAL_RATE_WINDOW || '15') * 60 * 1000,
        max: parseInt(process.env.GENERAL_RATE_LIMIT || '100'),
        message: {
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: parseInt(process.env.GENERAL_RATE_WINDOW || '15') * 60
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          logger.security.rateLimit(req.ip, 'general');
          res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: parseInt(process.env.GENERAL_RATE_WINDOW || '15') * 60
          });
        }
      }),

      // Strict rate limiting for authentication endpoints
      auth: rateLimit({
        store,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
          error: 'Too many authentication attempts, please try again later.',
          retryAfter: 15 * 60
        },
        skipSuccessfulRequests: true,
        handler: (req, res) => {
          logger.security.rateLimit(req.ip, 'authentication');
          res.status(429).json({
            error: 'Authentication rate limit exceeded',
            message: 'Too many login attempts, please try again in 15 minutes.',
            retryAfter: 15 * 60
          });
        }
      }),

      // Email sending rate limiting
      email: rateLimit({
        store,
        windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW || '60') * 60 * 1000,
        max: parseInt(process.env.EMAIL_RATE_LIMIT_MAX || '5'),
        message: {
          error: 'Too many emails sent, please try again later.',
          retryAfter: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW || '60') * 60
        },
        handler: (req, res) => {
          logger.security.rateLimit(req.ip, 'email');
          res.status(429).json({
            error: 'Email rate limit exceeded',
            message: 'Too many emails sent from this IP, please try again later.',
            retryAfter: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW || '60') * 60
          });
        }
      }),

      // Chat API rate limiting
      chat: rateLimit({
        store,
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // 30 messages per minute
        message: {
          error: 'Too many chat messages, please slow down.',
          retryAfter: 60
        },
        handler: (req, res) => {
          logger.security.rateLimit(req.ip, 'chat');
          res.status(429).json({
            error: 'Chat rate limit exceeded',
            message: 'Too many messages sent, please wait a moment before sending more.',
            retryAfter: 60
          });
        }
      })
    };
  }

  /**
   * Input validation middleware
   */
  getValidationMiddleware() {
    return {
      // Validate email format
      validateEmail: (req, res, next) => {
        const { email } = req.body;
        if (email && !validator.isEmail(email)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }
        next();
      },

      // Validate and sanitize contact form data
      validateContactForm: (req, res, next) => {
        const { name, email, message, phone, company } = req.body;

        // Required fields validation
        if (!name || !email || !message) {
          return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required'
          });
        }

        // Sanitize inputs
        req.body.name = validator.escape(name.trim()).substring(0, 100);
        req.body.email = validator.normalizeEmail(email) || email;
        req.body.message = validator.escape(message.trim()).substring(0, 2000);
        
        if (phone) {
          req.body.phone = validator.escape(phone.trim()).substring(0, 20);
        }
        
        if (company) {
          req.body.company = validator.escape(company.trim()).substring(0, 100);
        }

        // Email validation
        if (!validator.isEmail(req.body.email)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }

        // Name length validation
        if (req.body.name.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'Name must be at least 2 characters long'
          });
        }

        // Message length validation
        if (req.body.message.length < 10) {
          return res.status(400).json({
            success: false,
            error: 'Message must be at least 10 characters long'
          });
        }

        next();
      },

      // Validate chat message
      validateChatMessage: (req, res, next) => {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Message is required and must be a string'
          });
        }

        // Sanitize and validate message
        const sanitizedMessage = validator.escape(message.trim());
        
        if (sanitizedMessage.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Message cannot be empty'
          });
        }

        if (sanitizedMessage.length > 1000) {
          return res.status(400).json({
            success: false,
            error: 'Message too long (maximum 1000 characters)'
          });
        }

        req.body.message = sanitizedMessage;
        next();
      },

      // Validate support ticket data
      validateSupportTicket: (req, res, next) => {
        const { subject, description, priority, category } = req.body;

        if (!subject || !description) {
          return res.status(400).json({
            success: false,
            error: 'Subject and description are required'
          });
        }

        // Sanitize inputs
        req.body.subject = validator.escape(subject.trim()).substring(0, 200);
        req.body.description = validator.escape(description.trim()).substring(0, 5000);

        // Validate priority
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (priority && !validPriorities.includes(priority)) {
          req.body.priority = 'medium';
        }

        // Validate category
        const validCategories = ['technical', 'billing', 'services', 'account', 'consultation'];
        if (category && !validCategories.includes(category)) {
          req.body.category = 'technical';
        }

        next();
      }
    };
  }

  /**
   * Security headers middleware
   */
  getSecurityHeaders() {
    return (req, res, next) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Referrer policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Feature policy
      res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=()');
      
      // Content Security Policy
      if (this.isProduction) {
        const csp = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          // Updated to Mailgun API endpoints
          "connect-src 'self' https://api.mailgun.net https://api.eu.mailgun.net",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ');
        
        res.setHeader('Content-Security-Policy', csp);
      }

      next();
    };
  }

  /**
   * IP whitelist/blacklist middleware
   */
  getIPFilter() {
    const blacklistedIPs = process.env.BLACKLISTED_IPS ? 
      process.env.BLACKLISTED_IPS.split(',').map(ip => ip.trim()) : [];

    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      if (blacklistedIPs.includes(clientIP)) {
        logger.security.suspiciousActivity({
          type: 'blacklisted_ip_access',
          ip: clientIP,
          url: req.url,
          userAgent: req.get('User-Agent')
        });

        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been blocked'
        });
      }

      next();
    };
  }

  /**
   * Suspicious activity detection
   */
  getSuspiciousActivityDetector() {
    const suspiciousPatterns = [
      /\.\.\/|\.\.\\/, // Directory traversal
      /<script|javascript:|vbscript:/i, // XSS attempts
      /union.*select|drop.*table|insert.*into/i, // SQL injection
      /proc\/|etc\/passwd|boot\.ini/i, // System file access
      /%00|%2e%2e|%252e/i // Null bytes and encoded traversal
    ];

    return (req, res, next) => {
      const suspicious = [];
      const checkString = `${req.url} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`;

      suspiciousPatterns.forEach((pattern, index) => {
        if (pattern.test(checkString)) {
          suspicious.push(`Pattern ${index + 1}`);
        }
      });

      if (suspicious.length > 0) {
        logger.security.suspiciousActivity({
          type: 'malicious_request_pattern',
          ip: req.ip,
          url: req.url,
          userAgent: req.get('User-Agent'),
          patterns: suspicious,
          payload: { query: req.query, body: req.body }
        });

        return res.status(400).json({
          error: 'Bad request',
          message: 'Request contains suspicious patterns'
        });
      }

      next();
    };
  }

  /**
   * File upload security
   */
  getFileUploadSecurity() {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 
      'image/jpeg,image/png,image/gif,application/pdf,text/plain')
      .split(',').map(type => type.trim());

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

    return {
      fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          logger.security.suspiciousActivity({
            type: 'invalid_file_upload',
            ip: req.ip,
            filename: file.originalname,
            mimetype: file.mimetype
          });
          cb(new Error('File type not allowed'), false);
        }
      },
      limits: {
        fileSize: maxSize,
        files: 5 // Maximum 5 files per request
      }
    };
  }
}

module.exports = new SecurityConfig();
