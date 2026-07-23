# KFSQUARE Production Setup

## Overview

This document summarizes the production infrastructure added to the KFSQUARE application, covering security, logging, monitoring, and deployment configuration.

## Security

- Rate limiting with configurable thresholds
- Input validation and sanitization middleware
- Security headers: CSRF, XSS, HSTS, Content Security Policy
- Secure session handling with configurable storage
- Suspicious activity detection and alerting
- JWT and bcrypt integration for user management

## Logging & Monitoring

- Winston logger with multiple transports
- Daily rotating log files with compression and retention
- Log types: combined, error, security, database, and performance
- Structured JSON logging for parsing and analysis
- Health check endpoint
- Graceful shutdown with proper cleanup and logging

## Deployment

- PM2 process management with clustering and auto-restart
- Docker multi-stage builds
- Docker Compose service orchestration
- Environment variable templates
- Automated database backup and recovery scripts
- Continuous health check monitoring

## File Structure

```
kfsquare/
├── config/
│   ├── logger.js           # Winston logging configuration
│   ├── security.js         # Security middleware
│   └── errorHandler.js     # Production error handling
├── scripts/
│   ├── init-production.js  # Production initialization
│   ├── status-check.js     # Production readiness checker
│   ├── health-check.sh     # Health monitoring
│   ├── start.sh            # Production startup
│   ├── dev.sh              # Development startup
│   └── backup.sh           # Database backup
├── docker/
│   ├── nginx.conf          # Nginx reverse proxy config
│   ├── redis.conf          # Redis configuration
│   └── prometheus.yml      # Monitoring configuration
├── logs/                   # Application logs (auto-created)
├── uploads/                # File upload directory
├── backups/                # Database backups
├── .env.example            # Variable names and safe placeholders
├── ecosystem.config.js     # PM2 process configuration
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Service orchestration
├── kfsquare.service        # Systemd service file
└── PRODUCTION.md           # Deployment guide
```

## npm Scripts

| Script | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm run pm2:start` | Start with PM2 |
| `npm run pm2:monitor` | PM2 monitoring dashboard |
| `npm run pm2:logs` | View PM2 logs |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |
| `npm run docker:compose` | Start with Docker Compose |
| `npm run health` | Application health check |
| `npm run backup:db` | Database backup |
| `npm run security:check` | Security audit |

## Feature Summary

| Category | Features |
|---|---|
| Security | Rate limiting, input validation, security headers, CSRF, XSS, session security |
| Logging | Winston, log rotation, multiple log levels, structured logging, error tracking |
| Monitoring | Health checks, performance metrics, database monitoring, process monitoring |
| Deployment | PM2, Docker, Docker Compose, systemd service, environment management |
| Performance | Clustering, memory management, caching, connection pooling, compression |
| Maintenance | Backup systems, log rotation, health monitoring, graceful shutdown |

## Deployment

### Basic Production Start

```bash
# 1. Initialize production environment
node scripts/init-production.js

# 2. Configure environment
# Inject secrets through the hosting provider. For local testing only:
cp .env.example .env
# Keep .env ignored and never commit it.

# 3. Start server
npm start

# 4. Verify health
curl http://localhost:3000/health
```

### PM2

```bash
npm run pm2:start
npm run pm2:monitor
npm run pm2:logs
```

### Docker

```bash
npm run docker:build
npm run docker:run
```

### Docker Compose

```bash
npm run docker:compose
```

## Required Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | 64-character random secret |
| `JWT_SECRET` | 64-character random secret |
| `PORT` | Application port (default: 3000) |

## Optional Configuration

- Redis for session storage
- Email settings for notifications
- SSL certificates for HTTPS
- Monitoring service credentials

