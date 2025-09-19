#!/bin/bash

# KFSQUARE Production Deployment Script
# This script helps deploy the KFSQUARE website to production

set -e  # Exit on error

echo "🚀 KFSQUARE Production Deployment"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Verify critical dependencies
echo "🔍 Verifying dependencies..."
node -e "
const requiredModules = ['express', 'helmet', 'compression', 'express-rate-limit', '@sendgrid/mail'];
requiredModules.forEach(module => {
    try {
        require(module);
        console.log('✅', module);
    } catch (err) {
        console.log('❌', module, '- Missing!');
        process.exit(1);
    }
});
"

# Check environment variables
echo "🔧 Checking environment variables..."
node -e "
const required = ['NODE_ENV', 'SENDGRID_API_KEY', 'RECIPIENT_EMAIL'];
const missing = required.filter(env => !process.env[env]);
if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
}
console.log('✅ Environment variables configured');
"

# Validate HTML, CSS, and JS files
echo "🔍 Validating static files..."
if [ ! -f index.html ]; then
    echo "❌ index.html not found!"
    exit 1
fi

if [ ! -f styles.css ]; then
    echo "❌ styles.css not found!"
    exit 1
fi

if [ ! -f index.js ]; then
    echo "❌ index.js not found!"
    exit 1
fi

echo "✅ Static files validated"

# Test server startup
echo "🧪 Testing server startup..."
timeout 10 node -e "
const app = require('./server.js');
console.log('✅ Server starts successfully');
process.exit(0);
" || {
    echo "❌ Server failed to start!"
    exit 1
}

# Create production start script
cat > start-production.sh << 'EOF'
#!/bin/bash
echo "Starting KFSQUARE in production mode..."
NODE_ENV=production npm start
EOF

chmod +x start-production.sh

echo ""
echo "🎉 Deployment preparation complete!"
echo "=================================="
echo ""
echo "📋 Next steps:"
echo "1. Verify your .env configuration"
echo "2. Test locally: npm run dev"
echo "3. Deploy to your server"
echo "4. Start production: ./start-production.sh"
echo ""
echo "🔗 Your site will be available at: https://kfsquare.com"
echo ""
echo "📊 Server features enabled:"
echo "   ✅ Security headers (Helmet)"
echo "   ✅ GZIP compression"
echo "   ✅ Rate limiting"
echo "   ✅ Input validation"
echo "   ✅ Email contact form"
echo "   ✅ Static file caching"
echo "   ✅ CORS protection"
echo "   ✅ Error handling"
echo "   ✅ Health check endpoint"
echo ""
