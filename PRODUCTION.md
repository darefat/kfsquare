# KFSQUARE Production Deployment Guide

## 🚀 Production Setup

KFSQUARE is now production-ready with comprehensive logging, security, monitoring, and deployment capabilities.

### Quick Start

1. **Initialize Production Environment**
   ```bash
   node scripts/init-production.js
   ```

2. **Configure Environment**
   - Inject production values through your hosting provider's secret manager.
   - For local testing only, copy `.env.example` to the ignored `.env` file.

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Deploy**
   ```bash
   # Option 1: PM2 (Recommended)
   npm run pm2:start
   
   # Option 2: Docker
   npm run docker:build && npm run docker:run
   
   # Option 3: Docker Compose
   npm run docker:compose
   ```

## 📋 Prerequisites

- **Node.js** 16+ 
- **MongoDB** 4.4+
- **Redis** 6+ (optional, for enhanced session storage)
- **PM2** (for process management)
- **Docker** (for containerized deployment)

## 🛠️ Production Features

### Security
- ✅ Rate limiting with MongoDB storage
- ✅ Input validation and sanitization
- ✅ Security headers (CSRF, XSS, HSTS, etc.)
- ✅ Session management with secure cookies
- ✅ Request logging and monitoring
- ✅ Suspicious activity detection

### Logging
- ✅ Winston-based logging system
- ✅ Daily rotating log files
- ✅ Multiple log levels and transports
- ✅ Security event logging
- ✅ Performance monitoring
- ✅ Database connection logging

### Monitoring & Health
- ✅ Health check endpoint (`/health`)
- ✅ Application metrics
- ✅ Database connectivity monitoring
- ✅ Graceful shutdown handling
- ✅ Process monitoring with PM2
- ✅ Error tracking and reporting

### Performance
- ✅ Production-optimized configurations
- ✅ Cluster mode support with PM2
- ✅ Memory management and limits
- ✅ Connection pooling
- ✅ Static file caching
- ✅ Compression middleware

## 🔧 Configuration

### Environment Variables

Key production environment variables (see `.env.example` for variable names only):

```bash
# Application
NODE_ENV=production
PORT=3000
APP_NAME=KFSQUARE

# Database
MONGODB_URI=mongodb://localhost:27017/kfsquare
REDIS_URL=redis://localhost:6379

# Security
SESSION_SECRET=<set-in-secret-manager>
JWT_SECRET=<set-in-secret-manager>
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_FILES=30d
LOG_MAX_SIZE=100m
```

## 🚢 Deployment Options

### 1. PM2 Deployment (Recommended)

```bash
# Start with PM2
npm run pm2:start

# Monitor
npm run pm2:monitor

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

**PM2 Features:**
- Cluster mode with auto-scaling
- Auto-restart on crashes
- Memory monitoring and limits
- Log management
- Health monitoring
- Zero-downtime deployments

### 2. Docker Deployment

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

**Docker Features:**
- Multi-stage optimized builds
- Security-first container design
- Health checks
- Non-root user execution
- Persistent volumes for logs/data

### 3. Systemd Service

```bash
# Copy service file
sudo cp kfsquare.service /etc/systemd/system/

# Enable and start
sudo systemctl enable kfsquare
sudo systemctl start kfsquare

# Check status
sudo systemctl status kfsquare
```

## 📊 Monitoring

### Application Monitoring

- **Health Endpoint**: `GET /health`
- **Metrics**: Application performance metrics
- **Logs**: Structured JSON logs with rotation
- **Process Monitoring**: PM2 dashboard

### Available Scripts

```bash
# Health check
npm run health

# View logs
npm run logs
npm run logs:error

# Backup database
npm run backup:db

# Security audit
npm run security:check
npm run security:fix
```

### Log Files

```
logs/
├── combined-YYYY-MM-DD.log    # All logs
├── error-YYYY-MM-DD.log       # Error logs only
├── security-YYYY-MM-DD.log    # Security events
├── database-YYYY-MM-DD.log    # Database operations
└── performance-YYYY-MM-DD.log # Performance metrics
```

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Logs**
   ```bash
   npm run logs
   tail -f logs/error-$(date +%Y-%m-%d).log
   ```

2. **Database Backups**
   ```bash
   npm run backup:db
   # Automated with cron: 0 2 * * *
   ```

3. **Security Updates**
   ```bash
   npm audit
   npm run security:fix
   ```

4. **Performance Monitoring**
   ```bash
   npm run pm2:monitor
   ```

### Database Management

```bash
# Backup
npm run backup:db

# Restore
npm run restore:db

# Seed production data
npm run seed
```

## 🚨 Troubleshooting

### Common Issues

1. **Server Won't Start**
   ```bash
   # Check logs
   npm run logs:error
   
   # Verify configuration
   node -e "require('./config/logger'); console.log('Config OK')"
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   mongosh $MONGODB_URI --eval "db.runCommand('ping')"
   ```

3. **Memory Issues**
   ```bash
   # Monitor PM2 processes
   npm run pm2:monitor
   
   # Restart if needed
   npm run pm2:restart
   ```

4. **Rate Limiting Issues**
   ```bash
   # Check Redis connection (if using Redis store)
   redis-cli ping
   ```

### Performance Tuning

1. **PM2 Configuration**
   - Adjust `instances` in `ecosystem.config.js`
   - Monitor memory usage and set appropriate limits

2. **Database Optimization**
   - Ensure proper indexes on frequently queried fields
   - Monitor connection pool settings

3. **Logging Configuration**
   - Adjust log levels for production (`LOG_LEVEL=warn`)
   - Configure log rotation settings

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Setup** (Nginx example)
   ```nginx
   upstream kfsquare_backend {
       server 127.0.0.1:3000;
       server 127.0.0.1:3001;
       server 127.0.0.1:3002;
   }
   ```

2. **Database Scaling**
   - MongoDB replica sets
   - Redis clustering for session storage

3. **Docker Swarm/Kubernetes**
   - Container orchestration for auto-scaling
   - Service mesh integration

### Vertical Scaling

1. **Increase PM2 instances**
   ```bash
   pm2 scale kfsquare +2
   ```

2. **Memory optimization**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=2048"
   ```

## 🔒 Security Checklist

- [ ] Environment variables properly configured
- [ ] MongoDB authentication enabled
- [ ] Redis password set (if using Redis)
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Input validation enabled
- [ ] Session security configured
- [ ] File upload restrictions set
- [ ] CORS properly configured
- [ ] Audit logs enabled

## 📞 Support

For production support:

1. **Check logs first**: `npm run logs:error`
2. **Health endpoint**: `curl http://localhost:3000/health`
3. **PM2 status**: `npm run pm2:monitor`
4. **System resources**: `htop`, `df -h`, `free -m`

---

## 🎯 Production Readiness Summary

✅ **Security**: Complete security middleware with rate limiting, validation, and monitoring  
✅ **Logging**: Comprehensive logging system with rotation and structured output  
✅ **Monitoring**: Health checks, metrics, and error tracking  
✅ **Deployment**: Multiple deployment options (PM2, Docker, systemd)  
✅ **Performance**: Optimized for production with clustering and caching  
✅ **Maintenance**: Backup, monitoring, and maintenance scripts  
✅ **Documentation**: Complete deployment and operational documentation  

Your KFSQUARE application is now production-ready! 🚀
