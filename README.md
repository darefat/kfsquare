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
        ```

4.  **Run the server:**

    ```bash
    node server.js
    ```

5.  **Open `index.html` in your browser.**  It's recommended to use a development server (e.g., `serve`) to avoid CORS issues.

## Key Files

*   **`index.html`:** The main HTML file containing the website structure and content.
*   **`styles.css`:**  CSS file for styling the website.
*   **`script.js`:** JavaScript file for handling form submission and client-side logic.
*   **`server.js`:** Node.js server file for handling form submissions and sending emails via SendGrid.
*   **.env:** File for storing sensitive information like API keys and email addresses.

## Email Sending

The website includes a contact form that sends emails using SendGrid.  The server-side code handles the email sending process.

**Important:**

*   Make sure you have a SendGrid account and have created an API key with the necessary permissions.
*   Verify the "no-reply" email address with SendGrid to prevent emails from being marked as spam.

## CORS Configuration

The server uses CORS to allow requests from the frontend.  Make sure the `CORS_ORIGIN` environment variable is set to the correct URL of your frontend.

## Input Validation

The server uses `express-validator` to validate the form data on the server-side.

## Error Handling

The server includes error handling and logging to help identify and resolve issues.

## Production Deployment

When deploying to production:

*   Set the environment variables directly in your hosting environment.
*   Ensure that the CORS origin is set to the correct URL of your production frontend.
*   Consider using a process manager like PM2 to keep the server running.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

© 2025 KFSQUARE. All rights reserved.