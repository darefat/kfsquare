# KFSQUARE Cross-Platform Deployment Guide

This guide covers deployment on Windows, macOS, and Linux systems, as well as cloud platforms and containerized environments.

## 🌐 Platform Support

- ✅ **Windows** (Windows 10/11, Windows Server)
- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Linux** (Ubuntu, CentOS, RHEL, Fedora, Arch, openSUSE)
- ✅ **Docker** (Multi-architecture: AMD64, ARM64)
- ✅ **Cloud Platforms** (AWS, Azure, GCP, Heroku, Vercel)

## 🚀 Quick Start (Any Platform)

### Option 1: Automated Setup
```bash
# Clone repository
git clone <your-repo-url>
cd kfsquare

# Run cross-platform setup
./setup-cross-platform.sh    # Linux/macOS
# OR
bash setup-cross-platform.sh  # Windows Git Bash/WSL
```

### Option 2: Manual Setup

#### Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org))
- **Git** ([Download](https://git-scm.com))

#### Installation Steps
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start development
npm run dev

# 4. Open browser
# http://localhost:3000
```

## 💻 Platform-Specific Instructions

### Windows

#### Prerequisites
- **Node.js**: Download from [nodejs.org](https://nodejs.org)
- **Git**: Download from [git-scm.com](https://git-scm.com)
- **Terminal**: Git Bash, PowerShell, or WSL2 recommended

#### Setup
```cmd
# Using Command Prompt
git clone <repo-url>
cd kfsquare
npm install
copy .env.example .env
npm run dev

# Using PowerShell
git clone <repo-url>
cd kfsquare
npm install
Copy-Item .env.example .env
npm run dev

# Using WSL2 (Recommended)
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
```

#### Production Deployment
```cmd
# Run deployment script
deploy-cross-platform.sh

# Start production server
start-production.bat
```

### macOS

#### Prerequisites (Choose one)
```bash
# Option 1: Direct download
# Visit https://nodejs.org and download installer

# Option 2: Using Homebrew
brew install node

# Option 3: Using MacPorts
sudo port install nodejs18

# Option 4: Using Nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Setup
```bash
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
```

#### Production Deployment
```bash
./deploy-cross-platform.sh
./start-production.sh
```

### Linux

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup project
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
```

#### CentOS/RHEL/Fedora
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs npm

# Setup project
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
```

#### Arch Linux
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Setup project
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
```

## 🐳 Docker Deployment

### Local Docker
```bash
# Build image
docker build -t kfsquare .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name kfsquare-app \
  kfsquare
```

### Docker Compose
```bash
# Start with compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Multi-Architecture Build
```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t kfsquare:latest \
  --push .
```

## ☁️ Cloud Platform Deployment

### AWS EC2
```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# Deploy application
git clone <repo-url>
cd kfsquare
./setup-cross-platform.sh
./deploy-cross-platform.sh
```

### Azure App Service
```json
// package.json - Add engines
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

### Google Cloud Platform
```yaml
# app.yaml
runtime: nodejs18
env: standard
automatic_scaling:
  min_instances: 1
  max_instances: 10
```

### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
heroku create kfsquare-app
git push heroku main
```

### Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 🔧 Environment Configuration

### Required Variables
```env
NODE_ENV=production
PORT=3000
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.kfsquare.com
RECIPIENT_EMAIL=contact@kfsquare.com
```

### Optional Variables
```env
# Rate limiting
GENERAL_RATE_LIMIT=100
EMAIL_RATE_LIMIT=5

# CORS
ALLOWED_ORIGINS=https://kfsquare.com,https://www.kfsquare.com

# Logging
LOG_LEVEL=info
```

## 🚦 Health Monitoring

### Health Check Endpoints
```bash
# Server health
curl http://localhost:3000/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-09-19T10:30:00.000Z",
  "uptime": 3600
}
```

### Process Monitoring
```bash
# Using PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name kfsquare
pm2 save
pm2 startup

# Using systemd (Linux)
sudo systemctl enable kfsquare
sudo systemctl start kfsquare
```

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Linux (ufw)
sudo ufw allow 3000/tcp
sudo ufw enable

# Windows Firewall
netsh advfirewall firewall add rule name="KFSQUARE" dir=in action=allow protocol=TCP localport=3000
```

### SSL/TLS Setup
```bash
# Using Let's Encrypt (Linux)
sudo certbot --nginx -d kfsquare.com

# Using Cloudflare (Any platform)
# Configure DNS and enable proxy
```

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000          # macOS/Linux
netstat -ano | find "3000"  # Windows

# Kill process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows
```

#### Permission Denied
```bash
# Fix permissions (Linux/macOS)
chmod +x setup-cross-platform.sh
chmod +x deploy-cross-platform.sh

# Run as administrator (Windows)
# Right-click terminal -> "Run as administrator"
```

#### Module Not Found
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance Optimization

### Production Optimizations
- ✅ GZIP compression enabled
- ✅ Static file caching
- ✅ Security headers
- ✅ Rate limiting
- ✅ Error handling
- ✅ Health monitoring

### Monitoring Tools
- **PM2**: Process management
- **New Relic**: Application monitoring
- **Sentry**: Error tracking
- **Datadog**: Infrastructure monitoring

## 🆘 Support

For platform-specific issues:
- **Windows**: Check Windows Event Viewer
- **macOS**: Check Console.app
- **Linux**: Check systemd logs (`journalctl -u kfsquare`)
- **Docker**: Check container logs (`docker logs kfsquare-app`)

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [Docker Documentation](https://docs.docker.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

## Contact Form: Local Testing & Production Deployment

This section covers how to run and test the contact form locally, and the exact steps to deploy it to production.

### Architecture

The contact form (`contact.html` → `js/contact.js`) submits JSON to `POST /api/contacts` on the Express server (`server.js`). The server validates the input, saves the record to MongoDB via Mongoose (`models/Contact.js`), and sends two emails via Mailgun:
- A notification to `customersupport@kfsquare.com`
- A confirmation reply to the person who submitted the form

---

### Local Testing

#### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally (e.g. `brew install mongodb-community` on macOS)

#### Step 1 — Start local MongoDB
```bash
# Create a data directory and start MongoDB in the background
mkdir -p /tmp/kfsquare-mongodb-test
mongod --dbpath /tmp/kfsquare-mongodb-test --port 27017 &

# Verify it's running
mongosh --port 27017 --eval "db.runCommand({ping:1})"
# Expected: { ok: 1 }
```

#### Step 2 — Set up local environment
```bash
# Back up any existing production .env first
cp .env .env.production.bak

# Copy the local dev config into .env
cp .env.local .env
```

The `.env.local` file sets:
- `MONGODB_URI=mongodb://localhost:27017/kfsquare_dev` — local MongoDB, no auth required
- `NODE_ENV=development` — enables verbose logging
- Mailgun keys left blank — emails are skipped locally (logged to console instead)
- Relaxed rate limits (1000 req/hr window, 50 per contact endpoint)

#### Step 3 — Install dependencies
```bash
npm install
```

#### Step 4 — Seed the local database with test contacts
```bash
npm run seed:local
```
This inserts 5 realistic contacts (Jane Smith, Robert Johnson, Maria Garcia, David Lee, Sarah Williams) across different service interests and pipeline stages. Safe to run multiple times — it clears and re-seeds each time.

#### Step 5 — Start the server
```bash
npm run dev:local
# Server listening on http://localhost:3000
# Database: connected to mongodb://localhost:27017/kfsquare_dev
# Email: not configured (Mailgun keys blank)
```

#### Step 6 — Test the API endpoint directly
```bash
curl -s "http://localhost:3000/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "410-555-1234",
    "company": "Test Corp",
    "serviceInterest": "data-engineering",
    "budget": "50k-100k",
    "message": "This is a test submission from local development environment.",
    "source": "website"
  }'
```
Expected response:
```json
{
  "success": true,
  "message": "Thank you Test User! Your message has been sent successfully. We'll respond within 24 hours.",
  "data": { "id": "...", "emailSent": false, "timestamp": "..." }
}
```

#### Step 7 — Verify the record saved to MongoDB
```bash
mongosh mongodb://localhost:27017/kfsquare_dev \
  --eval "db.contacts.find({email:'test@example.com'}).pretty()"
```

#### Step 8 — Test the form in a browser
Open `http://localhost:3000/contact.html`, fill out every field, and click **Send Message**.  
The `#form-status` div should display the success message. Check the terminal for the `Contact saved to MongoDB` log line.

#### Step 9 — Check the health endpoint
```bash
curl -s http://localhost:3000/api/health
# Expected: {"status":"healthy","database":"connected","mailgun":"not configured"}
```

---

### Production Deployment

#### Step 1 — Restore production environment config
```bash
# Restore .env from the backup made during local testing
cp .env.production.bak .env
```

Edit `.env` and confirm these values are set correctly:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | YES | MongoDB Atlas SRV string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/kfsquare?retryWrites=true&w=majority` |
| `MAILGUN_API_KEY` | YES | Mailgun private API key |
| `MAILGUN_DOMAIN` | YES | Verified Mailgun sending domain |
| `NODE_ENV` | YES | Set to `production` |
| `ALLOWED_ORIGINS` | YES | `https://kfsquare.com,https://www.kfsquare.com` |
| `SESSION_SECRET` | YES | Random 64-char string |
| `PORT` | optional | Defaults to `3000` |

#### Step 2 — Install production dependencies
```bash
npm install --omit=dev
```

#### Step 3 — Start the server with PM2 (recommended)
```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the server under PM2 process management
npm run pm2:start

# Verify it's running
pm2 status
pm2 logs kfsquare --lines 20
```

PM2 automatically restarts the server on crash and on system reboot (after `pm2 startup`).

#### Step 4 — Verify the health endpoint on the live server
```bash
curl https://kfsquare.com/api/health
# Expected: {"status":"healthy","database":"connected","mailgun":"configured"}
```
`mailgun` must show `"configured"` — if it shows `"not configured"` the Mailgun keys are missing from `.env`.

#### Step 5 — Submit a real test contact from the live form
Go to `https://kfsquare.com/contact.html`, fill the form, and submit. Within seconds:
- A notification email arrives at `customersupport@kfsquare.com`
- A confirmation email arrives at the address entered in the form
- The record appears in MongoDB Atlas under the `kfsquare` database, `contacts` collection

#### Step 6 — Set up PM2 to survive reboots
```bash
pm2 startup          # Follow the printed command to register the startup script
pm2 save             # Persist current process list
```

#### Rollback
If the production deployment fails, restore the server to the previous state:
```bash
# Stop PM2
pm2 stop kfsquare

# Revert code if needed (assuming git is in use)
git checkout HEAD~1

# Restart
pm2 start ecosystem.config.js
```

---

### Environment File Summary

| File | Purpose |
|---|---|
| `.env` | Active config loaded by the server at runtime |
| `.env.local` | Local development config (local MongoDB, no Mailgun) |
| `.env.production.bak` | Backup of production config — restore this before deploying |
| `.env.example` | Template with all required keys and no real values |

> **Never commit `.env`, `.env.local`, or `.env.production.bak` to version control.**  
> Confirm `.env*` is in `.gitignore` before pushing.

---

**KFSQUARE** - Platform-Agnostic Data Analytics Solutions
