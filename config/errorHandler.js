const logger = require('./logger');

/**
 * Production Error Handling Middleware
 */
class ErrorHandler {
  /**
   * Handle 404 errors
   */
  static handle404(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    
    logger.warn('404 Error - Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
        timestamp: new Date().toISOString()
      });
    }

    // For non-API routes, serve the main page (SPA behavior)
    return res.status(404).sendFile('index.html', { 
      root: req.app.get('views') || 'public' 
    });
  }

  /**
   * Global error handler
   */
  static handleErrors(err, req, res, next) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Default to 500 server error
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = {};

    // Handle specific error types
    if (err.name === 'ValidationError') {
      status = 400;
      message = 'Validation Error';
      details = this.handleValidationError(err);
    } else if (err.name === 'CastError') {
      status = 400;
      message = 'Invalid ID format';
      details = { field: err.path, value: err.value };
    } else if (err.code === 11000) {
      status = 409;
      message = 'Duplicate field error';
      details = this.handleDuplicateError(err);
    } else if (err.name === 'JsonWebTokenError') {
      status = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      status = 401;
      message = 'Token expired';
    } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      status = 500;
      message = 'Database error';
      details = { code: err.code };
    }

    // Log the error
    const errorLog = {
      error: err.message,
      stack: err.stack,
      status,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    };

    if (status >= 500) {
      logger.error('Server Error', errorLog);
    } else if (status >= 400) {
      logger.warn('Client Error', errorLog);
    }

    // Prepare response
    const response = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      ...(Object.keys(details).length > 0 && { details })
    };

    // Add debug info in development
    if (isDevelopment) {
      response.stack = err.stack;
      response.debug = {
        originalError: err.message,
        method: req.method,
        url: req.originalUrl
      };
    }

    // Add request ID if available
    if (req.requestId) {
      response.requestId = req.requestId;
    }

    // Send error response
    res.status(status).json(response);
  }

  /**
   * Handle Mongoose validation errors
   */
  static handleValidationError(err) {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    return { validationErrors: errors };
  }

  /**
   * Handle MongoDB duplicate key errors
   */
  static handleDuplicateError(err) {
    const field = Object.keys(err.keyValue)[0];
    const value = Object.values(err.keyValue)[0];
    return {
      field,
      value,
      message: `${field} '${value}' already exists`
    };
  }

  /**
   * Async error wrapper to catch errors in async routes
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtException() {
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception - Shutting down...', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      
      // Graceful shutdown
      process.exit(1);
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  static handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason.message || reason,
        stack: reason.stack,
        promise,
        timestamp: new Date().toISOString()
      });
      
      // Graceful shutdown
      process.exit(1);
    });
  }

  /**
   * Graceful shutdown handler
   */
  static handleGracefulShutdown(server, database) {
    const shutdown = (signal) => {
      logger.shutdown(`Received ${signal}, shutting down gracefully`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        if (database && database.disconnect) {
          database.disconnect().then(() => {
            logger.info('Database connection closed');
            process.exit(0);
          }).catch((err) => {
            logger.error('Error closing database connection', { error: err.message });
            process.exit(1);
          });
        } else {
          process.exit(0);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Request ID middleware for tracking
   */
  static addRequestId() {
    return (req, res, next) => {
      req.requestId = require('crypto')
        .randomBytes(16)
        .toString('hex');
      
      res.setHeader('X-Request-ID', req.requestId);
      next();
    };
  }

  /**
   * Health check endpoint
   */
  static healthCheck() {
    return async (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        };

        // Check database connection if available
        if (req.app.locals.database) {
          try {
            await req.app.locals.database.ping();
            health.database = 'connected';
          } catch (err) {
            health.database = 'disconnected';
            health.status = 'degraded';
          }
        }

        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);

      } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    };
  }

  /**
   * API response formatter
   */
  static formatResponse() {
    return (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        // Format successful responses
        if (data && typeof data === 'object' && !data.success && !data.error) {
          const formattedResponse = {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
          };

          if (req.requestId) {
            formattedResponse.requestId = req.requestId;
          }

          return originalJson.call(this, formattedResponse);
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }
}

module.exports = ErrorHandler;
