// PM2 Ecosystem Configuration for KFSQUARE
// This file configures PM2 for production deployment and process management

module.exports = {
  apps: [
    {
      // Application Configuration
      name: 'kfsquare',
      script: './server.js',
      cwd: __dirname,
      
      // Environment Configuration
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        // Avoid hardcoding database URLs here; use a .env file instead
        // MONGODB_URI should be provided via environment variables
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        // Use environment-provided URI, do not fallback to localhost in production
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_HOSTS: process.env.MONGODB_HOSTS,
        MONGODB_DB: process.env.MONGODB_DB,
        SESSION_SECRET: process.env.SESSION_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '900000',
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '100',
        // Public site URL used for logs and CORS origin
        PUBLIC_URL: process.env.PUBLIC_URL || 'https://darefat.github.io/kfsquare'
      },
      
      // Process Configuration
      // If PM2_INSTANCES is set when starting PM2 (e.g. `PM2_INSTANCES=1 pm2 start ...`), use it.
      // Otherwise default to 1 in development and 'max' in other environments.
      instances: process.env.PM2_INSTANCES || (process.env.NODE_ENV === 'development' ? 1 : 'max'),
      exec_mode: 'cluster',                          // Enable clustering
      instance_var: 'INSTANCE_ID',                  // Unique instance identifier
      
      // Resource Management
      max_memory_restart: '1G',                     // Restart if memory exceeds 1GB
      min_uptime: '10s',                           // Minimum uptime before restart
      max_restarts: 10,                            // Maximum restarts per hour
      restart_delay: 4000,                         // Delay between restarts
      
      // Logging Configuration
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,                            // Merge cluster logs
      
      // Monitoring & Health Checks
      watch: false,                                // Don't watch files in production
      ignore_watch: ['node_modules', 'logs', '.git', 'backups'],
      watch_options: {
        followSymlinks: false
      },
      
      // Graceful Shutdown
      kill_timeout: 5000,                         // Time to wait before force kill
      listen_timeout: 8000,                       // Time to wait for app to start
      wait_ready: false,                          // Disable waiting for ready signal
      
      // Advanced Options
      node_args: '--max-old-space-size=1024',     // Node.js memory optimization
      source_map_support: false,                  // Disable source maps in production
      disable_source_map_support: true,
      
      // Process Monitoring
      pmx: true,                                  // Enable Keymetrics monitoring
      automation: false,
      autorestart: true,                          // Auto restart on crash
      
      // Health Check Configuration
      health_check_grace_period: 10000,          // Grace period for health checks
      health_check_fatal_exceptions: true,        // Monitor fatal exceptions
      
      // Custom Environment Variables
      env_vars: {
        'FORCE_COLOR': 0,                         // Disable colors in production logs
        'NODE_TLS_REJECT_UNAUTHORIZED': 0,        // For self-signed certificates
        'UV_THREADPOOL_SIZE': 128                 // Increase UV thread pool
      }
    }
  ],
  
  // Deploy Configuration (Optional)
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy',
      host: process.env.DEPLOY_HOST || 'localhost',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:username/kfsquare.git',
      path: process.env.DEPLOY_PATH || '/var/www/kfsquare',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    
    staging: {
      user: process.env.STAGING_USER || 'deploy',
      host: process.env.STAGING_HOST || 'localhost',
      ref: 'origin/develop',
      repo: process.env.DEPLOY_REPO || 'git@github.com:username/kfsquare.git',
      path: process.env.STAGING_PATH || '/var/www/kfsquare-staging',
      'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env staging'
    }
  }
};

// Production Monitoring Configuration
if (process.env.NODE_ENV === 'production') {
  // Enable additional production monitoring
  module.exports.apps[0].exp_backoff_restart_delay = 100;
  module.exports.apps[0].max_restarts = 15;
  module.exports.apps[0].min_uptime = '30s';
  
  // Production logging optimization
  module.exports.apps[0].combine_logs = true;
  module.exports.apps[0].time = true;
  
  // Production performance tuning
  module.exports.apps[0].node_args = [
    '--max-old-space-size=2048',
    '--optimize-for-size',
    '--gc-interval=100'
  ].join(' ');
}

// Development overrides
if (process.env.NODE_ENV === 'development') {
  module.exports.apps[0].instances = 1;
  module.exports.apps[0].exec_mode = 'fork';
  module.exports.apps[0].watch = true;
  module.exports.apps[0].watch_delay = 1000;
}

console.log(`PM2 Ecosystem loaded for ${process.env.NODE_ENV || 'development'} environment`);
