#!/usr/bin/env node

/**
 * KFSQUARE Production Initialization Script
 * Sets up the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

// Logging functions
const log = (message) => console.log(`${colors.blue}[INIT]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
const error = (message) => {
    console.error(`${colors.red}❌ ${message}${colors.reset}`);
    process.exit(1);
};

// Generate secure random secrets
const generateSecret = (length = 64) => {
    return crypto.randomBytes(length).toString('hex');
};

// Create production .env file
const createProductionEnv = () => {
    log('Creating production environment configuration...');
    
    const envTemplate = `# KFSQUARE Production Environment Configuration
# Generated on ${new Date().toISOString()}

# Application Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
APP_NAME=KFSQUARE
APP_VERSION=1.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kfsquare
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kfsquare?retryWrites=true&w=majority

# Redis Configuration (Optional - for session storage)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# Security Configuration
SESSION_SECRET=${generateSecret(64)}
JWT_SECRET=${generateSecret(64)}
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=true
RATE_LIMIT_SKIP_FAILED_REQUESTS=false

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_FILES=30d
LOG_MAX_SIZE=100m
LOG_COMPRESS=true

# Security Headers
TRUST_PROXY=true
CORS_ORIGIN=https://yourdomain.com
CSRF_SECRET=${generateSecret(32)}

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@yourdomain.com

# Third-party Services (Optional)
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Monitoring & Analytics (Optional)
GOOGLE_ANALYTICS_ID=
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=
NEW_RELIC_APP_NAME=KFSQUARE

# Feature Flags
FEATURE_CHAT_ENABLED=true
FEATURE_FILE_UPLOAD=true
FEATURE_NOTIFICATIONS=true
FEATURE_RATE_LIMITING=true
FEATURE_SECURITY_LOGGING=true

# Development/Testing (Disable in production)
DEBUG=false
MOCK_DATABASE=false
BYPASS_AUTH=false
DISABLE_RATE_LIMITING=false

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=
BACKUP_S3_REGION=
BACKUP_S3_ACCESS_KEY=
BACKUP_S3_SECRET_KEY=

# SSL/TLS Configuration
SSL_ENABLED=false
SSL_CERT_PATH=
SSL_KEY_PATH=
SSL_FORCE_REDIRECT=false

# Performance Configuration
CLUSTER_MODE=true
MAX_WORKERS=0
KEEP_ALIVE_TIMEOUT=5000
HEADERS_TIMEOUT=10000

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
HEALTH_CHECK_INTERVAL=30000
`;

    // Write .env.production file
    fs.writeFileSync('.env.production', envTemplate);
    success('Created .env.production template');
    
    // Copy to .env if it doesn't exist
    if (!fs.existsSync('.env')) {
        fs.copyFileSync('.env.production', '.env');
        success('Created .env from production template');
        warning('Please update .env with your actual values before starting the application');
    } else {
        warning('.env already exists. Check .env.production for new configuration options');
    }
};

// Create necessary directories
const createDirectories = () => {
    log('Creating necessary directories...');
    
    const directories = [
        'logs',
        'uploads',
        'backups',
        'temp',
        'config',
        'docker',
        'scripts',
        'public/uploads'
    ];
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            success(`Created directory: ${dir}`);
        }
    });
};

// Create Docker configuration files
const createDockerConfig = () => {
    log('Creating Docker configuration files...');
    
    // Ensure docker directory exists
    const dockerDir = path.join(__dirname, '..', 'docker');
    if (!fs.existsSync(dockerDir)) {
        fs.mkdirSync(dockerDir, { recursive: true });
    }
    
    // Redis configuration
    const redisConfig = `# Redis Configuration for KFSQUARE
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 60
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /data
`;
    
    fs.writeFileSync(path.join(dockerDir, 'redis.conf'), redisConfig);
    success('Created Redis configuration');
    
    // Nginx configuration
    const nginxConfig = `events {
    worker_connections 1024;
}

http {
    upstream kfsquare_app {
        server kfsquare-app:3000;
    }
    
    server {
        listen 80;
        server_name _;
        
        location / {
            proxy_pass http://kfsquare_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Security headers
            add_header X-Frame-Options DENY;
            add_header X-Content-Type-Options nosniff;
            add_header X-XSS-Protection "1; mode=block";
            add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        }
        
        location /health {
            proxy_pass http://kfsquare_app/health;
            access_log off;
        }
        
        location /static {
            alias /app/public;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
`;
    
    fs.writeFileSync(path.join(dockerDir, 'nginx.conf'), nginxConfig);
    success('Created Nginx configuration');
};

// Create monitoring configuration
const createMonitoringConfig = () => {
    log('Creating monitoring configuration...');
    
    // Ensure docker directory exists
    const dockerDir = path.join(__dirname, '..', 'docker');
    const scriptsDir = path.join(__dirname);
    
    if (!fs.existsSync(dockerDir)) {
        fs.mkdirSync(dockerDir, { recursive: true });
    }
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Prometheus configuration
    const prometheusConfig = `global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'kfsquare'
    static_configs:
      - targets: ['kfsquare-app:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s
`;
    
    fs.writeFileSync(path.join(dockerDir, 'prometheus.yml'), prometheusConfig);
    success('Created Prometheus configuration');
    
    // Create a basic health check script
    const healthCheckScript = `#!/bin/bash
# Health check script for KFSQUARE

# Check application health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
    exit 0
else
    echo "❌ Application health check failed"
    exit 1
fi
`;
    
    fs.writeFileSync(path.join(scriptsDir, 'health-check.sh'), healthCheckScript);
    fs.chmodSync(path.join(scriptsDir, 'health-check.sh'), '755');
    success('Created health check script');
};

// Create systemd service file
const createSystemdService = () => {
    log('Creating systemd service file...');
    
    const serviceContent = `[Unit]
Description=KFSQUARE Customer Support Platform
Documentation=https://github.com/yourusername/kfsquare
After=network.target

[Service]
Type=forking
User=kfsquare
WorkingDirectory=/opt/kfsquare
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always
RestartSec=10
KillMode=mixed
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
`;
    
    fs.writeFileSync('kfsquare.service', serviceContent);
    success('Created systemd service file');
    warning('Copy kfsquare.service to /etc/systemd/system/ to use with systemd');
};

// Create startup scripts
const createStartupScripts = () => {
    log('Creating startup scripts...');
    
    const scriptsDir = path.join(__dirname);
    
    // Production startup script
    const startScript = `#!/bin/bash
# KFSQUARE Production Startup Script

set -e

echo "🚀 Starting KFSQUARE Production Server..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v ^# | xargs)
fi

# Create logs directory
mkdir -p logs

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version must be 16+. Current: $(node --version)"
    exit 1
fi

# Start with PM2 if available, otherwise use Node.js directly
if command -v pm2 &> /dev/null; then
    echo "📦 Starting with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
else
    echo "📦 Starting with Node.js..."
    NODE_ENV=production node server.js
fi
`;
    
    fs.writeFileSync(path.join(scriptsDir, 'start.sh'), startScript);
    fs.chmodSync(path.join(scriptsDir, 'start.sh'), '755');
    success('Created startup script');
    
    // Development startup script
    const devScript = `#!/bin/bash
# KFSQUARE Development Startup Script

set -e

echo "🛠️ Starting KFSQUARE Development Server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
NODE_ENV=development node server.js
`;
    
    fs.writeFileSync(path.join(scriptsDir, 'dev.sh'), devScript);
    fs.chmodSync(path.join(scriptsDir, 'dev.sh'), '755');
    success('Created development startup script');
};

// Create backup script
const createBackupScript = () => {
    log('Creating backup script...');
    
    const scriptsDir = path.join(__dirname);
    
    const backupScript = `#!/bin/bash
# KFSQUARE Database Backup Script

set -e

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="kfsquare_backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🗄️ Creating backup: $BACKUP_NAME"

# MongoDB backup
if [ -n "$MONGODB_URI" ]; then
    mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ MongoDB backup completed"
else
    echo "⚠️ MONGODB_URI not set, skipping database backup"
fi

# Compress backup
if [ -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
    rm -rf "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ Backup compressed: $BACKUP_NAME.tar.gz"
fi

# Clean old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup process completed"
`;
    
    fs.writeFileSync(path.join(scriptsDir, 'backup.sh'), backupScript);
    fs.chmodSync(path.join(scriptsDir, 'backup.sh'), '755');
    success('Created backup script');
};

// Main initialization function
const initialize = () => {
    console.log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                     KFSQUARE PRODUCTION INIT                ║
║                    Customer Support Platform                 ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    try {
        createDirectories();
        createProductionEnv();
        createDockerConfig();
        createMonitoringConfig();
        createSystemdService();
        createStartupScripts();
        createBackupScript();
        
        console.log(`${colors.bright}${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                   ✅ INITIALIZATION COMPLETE                ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
        
        console.log(`${colors.blue}
Next steps:
${colors.reset}1. Update .env with your actual configuration values
2. Set up your MongoDB database
3. Run deployment: npm run deploy
4. Check health: npm run health

${colors.blue}Production deployment options:${colors.reset}
• PM2: npm run pm2:start
• Docker: npm run docker:build && npm run docker:run
• Docker Compose: npm run docker:compose

${colors.blue}Monitoring:${colors.reset}
• Logs: npm run logs
• Health: npm run health
• PM2 Monitor: npm run pm2:monitor
`);
        
    } catch (err) {
        error(`Initialization failed: ${err.message}`);
    }
};

// Run initialization
initialize();
