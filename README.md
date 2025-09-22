# KFSQUARE - Data Analytics & Predictive Modeling

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](https://kfsquare.com)
[![Cross Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/kfsquare/kfsquare)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://docker.com/)
[![Security](https://img.shields.io/badge/security-helmet%20enabled-brightgreen.svg)](https://helmetjs.github.io/)

## Overview

KFSQUARE is a data engineering and analytics company leveraging cutting-edge Large Language Models (LLM) to deliver predictive analysis and transformative insights for businesses. This modern, responsive, **platform-agnostic** website showcases our services and provides an interactive platform for client engagement across Windows, macOS, and Linux systems.

## 🌐 Cross-Platform Support

### Supported Platforms
- ✅ **Windows** (10/11, Server 2016/2019/2022)
- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Linux** (Ubuntu, CentOS, RHEL, Fedora, Arch, openSUSE)
- ✅ **Docker** (Multi-architecture: AMD64, ARM64)
- ✅ **Cloud Platforms** (AWS, Azure, GCP, Heroku, Vercel)

### Browser Compatibility
- ✅ **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest)
- ✅ **Legacy Support**: Internet Explorer 8+ (graceful degradation)
- ✅ **Mobile**: iOS Safari, Android Chrome (responsive design)

## 🚀 Quick Start (Any Platform)

### Prerequisites
- **Node.js 18+**: [Download here](https://nodejs.org)
- **Python 3.7+**: [Download here](https://python.org) (for fallback server)
- **Git**: [Download here](https://git-scm.com)

### Automated Setup (Recommended)
```bash
# Clone repository
git clone <your-repo-url>
cd kfsquare

# Option 1: Cross-platform shell script
./setup-cross-platform.sh      # Linux/macOS
bash setup-cross-platform.sh   # Windows Git Bash/WSL

# Option 2: Python setup utility (any platform)
python setup.py --setup        # Full automated setup
python3 setup.py --setup       # Linux/macOS alternative
```

### Manual Setup
```bash
# 1. Install Node.js 18+ from https://nodejs.org
# 2. Clone and setup
git clone <your-repo-url>
cd kfsquare

# 3. Install Python requirements (optional, for utilities)
pip install -r requirements-minimal.txt
# OR for full development environment
pip install -r requirements.txt

# 4. Install Node.js dependencies
npm install

# 5. Configure environment
cp .env.example .env
# Edit .env with your SendGrid API key

# 6. Start development
npm run dev
# OR fallback Python server
python -m http.server 8080
```

## 📦 Platform-Specific Scripts

### Windows
```cmd
# Command Prompt
npm run dev
start-production.bat

# PowerShell
npm run dev
.\start-production.bat

# Git Bash (Recommended)
npm run dev
./start-production.sh
```

### macOS/Linux
```bash
npm run dev
./start-production.sh
```

### Cross-Platform Commands
```bash
# Setup and deployment
npm run setup     # Run setup script
npm run deploy    # Run deployment script
python setup.py --setup    # Python setup utility
python setup.py --health   # Check server health

# Development servers
npm run dev       # Node.js development server
npm run serve     # Python fallback server (any platform)
npm run serve:win # Python server (Windows specific)

# Utilities
npm run health    # Check server health
python setup.py --start    # Start development server (any platform)
```

## 📦 Dependencies

### Node.js Dependencies (Required)
```json
{
  "express": "^5.1.0",           // Web framework
  "helmet": "^8.0.0",            // Security middleware  
  "compression": "^1.7.4",       // GZIP compression
  "express-rate-limit": "^7.4.1", // Rate limiting
  "@sendgrid/mail": "^8.1.5",    // Email service
  "cross-env": "^7.0.3"          // Cross-platform env vars
}
```

### Python Dependencies (Optional)
```bash
# Install minimal requirements
pip install -r requirements-minimal.txt

# OR install full development environment
pip install -r requirements.txt
```

**Minimal Python Requirements:**
- `requests>=2.31.0` - HTTP requests and health checks
- `python-dotenv>=1.0.0` - Environment variable management
- `colorama>=0.4.6` - Cross-platform colored output

**Full Python Requirements:** (for development)
- Testing: `pytest`, `black`, `flake8`, `mypy`
- Documentation: `mkdocs`, `mkdocs-material`
- Security: `bandit`, `safety`
- Monitoring: `psutil`, `watchdog`

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
RECIPIENT_EMAIL=contact@kfsquare.com

# Security Configuration
GENERAL_RATE_LIMIT=100
EMAIL_RATE_LIMIT=5
ALLOWED_ORIGINS=https://kfsquare.com,https://www.kfsquare.com
```

## 🔧 Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server
- `npm run build`: Prepare for production (no build needed)
- `npm test`: Run tests (not implemented)
- `./deploy.sh`: Full production deployment preparation

## 📊 API Endpoints

### Health Check
```
GET /health
```
Returns server status and uptime information.

### Contact Form
```
POST /send-email
```
Accepts contact form submissions with validation and rate limiting.

**Request Body:**
```json
{
  "name": "Your Name",
  "email": "your.email@example.com",
  "message": "Your message here"
}
```

## 🛡️ Security Features

- **Content Security Policy (CSP)**
- **HTTP Strict Transport Security (HSTS)**
- **X-Frame-Options protection**
- **Input validation and sanitization**
- **Rate limiting (100 requests/15min general, 5 emails/hour)**
- **CORS protection**
- **Error handling without information leakage**

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Legacy Support**: Internet Explorer 8+ (with graceful degradation)
- **Mobile**: iOS Safari, Android Chrome (responsive design)

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet**: Enhanced experience for tablet users
- **Desktop**: Full-featured desktop experience
- **High DPI**: Retina and high-resolution display support

## 🚀 Production Checklist

- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Security headers enabled
- ✅ Rate limiting configured
- ✅ SSL/HTTPS ready
- ✅ Static file caching
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Graceful shutdown
- ✅ Production logging

## 📞 Support

For technical support or questions:
- **Email**: contact@kfsquare.com
- **Website**: [https://kfsquare.com](https://kfsquare.com)
- **Chat**: Available on the website

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**KFSQUARE** - Transforming Data into Insights 🚀

# KFSQUARE Site - Production Readiness

## Quick Start
- Development: `npm run dev` then open http://localhost:3000
- Static preview: `npm run build && npm run preview` then open http://localhost:8080

## Environment
Copy `.env` and set values:
- `SENDGRID_API_KEY`, `RECIPIENT_EMAIL`
- `ALLOWED_ORIGINS` (comma or space separated)
- Optional: `LOG_LEVEL`, `SENTRY_DSN`

## Build & Deploy
1. Build static assets
   - `npm run build`
2. Preview build
   - `npm run preview`
3. Production server (Express)
   - `npm start`

## Security
- Helmet CSP tightened for Google Fonts and CDNJS
- CORS controlled via `ALLOWED_ORIGINS`
- Rate limits configurable via env vars

## Notes
- If you want consistent minification, install terser and clean-css globally, or add as devDependencies.
- Ensure your reverse proxy serves `dist/` or keep Express static serving with caching as configured.