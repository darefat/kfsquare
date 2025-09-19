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
SENDGRID_API_KEY=your_api_key
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

**KFSQUARE** - Platform-Agnostic Data Analytics Solutions 🌐
