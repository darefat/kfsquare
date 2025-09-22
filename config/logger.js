const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),

  // Error log file
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    format: logFormat
  }),

  // Combined log file
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    format: logFormat
  }),

  // Access log for HTTP requests
  new DailyRotateFile({
    filename: path.join(logsDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, message }) => {
        return `${timestamp} ${message}`;
      })
    )
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'kfsquare-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
      contentLength: res.get('Content-Length') || '0'
    };

    const logMessage = `${req.method} ${req.url} ${res.statusCode} ${duration}ms - ${req.ip}`;
    
    if (res.statusCode >= 400) {
      logger.error(logMessage, logData);
    } else {
      logger.http(logMessage, logData);
    }
  });

  next();
};

// Security event logging
logger.security = {
  loginAttempt: (email, success, ip) => {
    logger.warn('Login attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  rateLimit: (ip, endpoint) => {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },

  suspiciousActivity: (details) => {
    logger.error('Suspicious activity detected', {
      event: 'suspicious_activity',
      ...details,
      timestamp: new Date().toISOString()
    });
  }
};

// Database event logging
logger.db = {
  connection: (status, details) => {
    if (status === 'connected') {
      logger.info('Database connected', { event: 'db_connected', ...details });
    } else {
      logger.error('Database connection failed', { event: 'db_connection_failed', ...details });
    }
  },

  query: (operation, collection, duration, success) => {
    const logData = {
      event: 'db_query',
      operation,
      collection,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString()
    };

    if (success) {
      logger.debug('Database query executed', logData);
    } else {
      logger.error('Database query failed', logData);
    }
  }
};

// Performance monitoring
logger.performance = {
  slowQuery: (query, duration) => {
    logger.warn('Slow query detected', {
      event: 'slow_query',
      query,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  },

  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      event: 'memory_usage',
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      timestamp: new Date().toISOString()
    });
  }
};

// Startup and shutdown logging
logger.startup = (details) => {
  logger.info('Application starting', {
    event: 'app_startup',
    ...details,
    timestamp: new Date().toISOString()
  });
};

logger.shutdown = (reason) => {
  logger.info('Application shutting down', {
    event: 'app_shutdown',
    reason,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
