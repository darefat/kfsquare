# 🔐 Security & Sensitive Files Documentation

## Overview
This document outlines the sensitive files and data that are protected in the KFSQUARE project and explains why they should never be committed to version control.

## 🚨 Protected Files & Directories

### Environment Variables & Configuration
- **`.env*`** - All environment files containing secrets
- **`.env.compose`** - Docker Compose production environment
- **`.env.secrets`** - Dedicated secrets file
- **`config/production.json`** - Production configuration
- **`config/secrets.json`** - Application secrets

**Why Protected**: Contains API keys, database passwords, JWT secrets, and other sensitive configuration data.

### Security & Cryptographic Materials
- **`secrets/`** - Directory for sensitive data
- **`certificates/`**, **`ssl/`**, **`tls/`** - SSL/TLS certificates
- **`keys/`**, **`*.key`**, **`*.pem`**, **`*.crt`** - Private keys and certificates
- **`jwt-keys/`** - JWT signing keys
- **`auth-tokens/`** - Authentication tokens

**Why Protected**: Contains cryptographic keys and certificates that could compromise security if exposed.

### Database & Backups
- **`backups/`** - Database backups
- **`database/`**, **`data/`** - Database files
- **`mongo-data/`**, **`redis-data/`** - Docker volume data
- **`*.sql`**, **`*.dump`**, **`*.backup`** - Database dump files

**Why Protected**: May contain user data, passwords, and sensitive business information.

### User Data & Uploads
- **`uploads/`**, **`user-uploads/`**, **`media/`** - User-generated content
- **`tmp-uploads/`** - Temporary upload files

**Why Protected**: Contains user-uploaded files that may include personal or confidential information.

### Logs & Monitoring
- **`logs/`** - Application log files
- **`analytics/`**, **`metrics/`**, **`monitoring/`** - Monitoring data
- **`*.log`** - Individual log files

**Why Protected**: Logs may contain sensitive information, user IPs, and system internals.

### Session & Authentication
- **`sessions/`** - Session storage files

**Why Protected**: Contains active user sessions and authentication state.

## ✅ Safe Example Files
These files are **safe** to commit and provide templates:
- **`.env.example`** - Environment template (no real secrets)
- **`.env.compose.example`** - Docker Compose template (no real secrets)

## 🛡️ Security Best Practices

### 1. Environment Variables
```bash
# Never commit assigned secret values.
# In templates, use explicit deployment placeholders:
DATABASE_PASSWORD=<set-in-secret-manager>
JWT_SECRET=<set-in-secret-manager>
```

### 2. Docker Compose
```yaml
# Reference a runtime-injected value; do not assign it in this file.
environment:
  - MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
```

### 3. Configuration Files
```json
// config/production.example.json (safe to commit)
{
  "apiKey": "<set-in-secret-manager>",
  "databaseUrl": "<set-in-secret-manager>"
}
```

## 🔍 How to Check for Leaks

### Before Committing
```bash
# Check what files are about to be committed
git status
git diff --cached

# Look for sensitive patterns
grep -r "password\|secret\|key" --exclude-dir=node_modules .
```

### Scan Repository History
```bash
# Check for accidentally committed secrets
git log --patch | grep -i "password\|secret\|key"
```

## 🚨 If Secrets Are Accidentally Committed

### 1. Immediate Actions
```bash
# Remove from staging
git reset HEAD <file>

# If already committed but not pushed
git reset --soft HEAD~1
```

### 2. If Already Pushed
1. **Rotate all exposed secrets immediately**
2. **Force push to remove from history** (if safe):
   ```bash
   git filter-branch --tree-filter 'rm -f sensitive-file' HEAD
   git push --force-with-lease
   ```
3. **Notify team members** to pull latest changes

## 📋 Setup Checklist

- [ ] Copy `.env.example` to `.env` and fill with real values
- [ ] Copy `.env.compose.example` to `.env.compose` for Docker
- [ ] Ensure sensitive directories exist but are empty in repo
- [ ] Run `git status` to verify no sensitive files are tracked
- [ ] Set up pre-commit hooks to scan for secrets
- [ ] Document all environment variables in example files

## 🔗 Related Security Tools

### Pre-commit Hooks
```bash
# Install git-secrets to prevent accidental commits
git secrets --register-aws
git secrets --install
git secrets --scan
```

### Environment Validation
```bash
# Validate required environment variables
node scripts/validate-env.js
```

## 📞 Security Contact

If you discover any security vulnerabilities or accidentally committed sensitive data:
1. **Do not create a public issue**
2. Contact the development team immediately
3. Follow the incident response procedure

---

**Last Updated**: September 22, 2025  
**Status**: 🔒 All sensitive files properly protected
