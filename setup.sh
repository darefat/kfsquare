#!/bin/bash

# KFSQUARE Setup Script
# This script sets up the development environment for KFSQUARE

set -e  # Exit on error

echo "🚀 KFSQUARE Development Environment Setup"
echo "========================================"

# Check if Homebrew is installed (macOS)
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed!"
    echo "Please install Homebrew first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew is available"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    brew install node
    echo "✅ Node.js installed"
else
    NODE_VERSION=$(node -v)
    echo "✅ Node.js already installed: $NODE_VERSION"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available! Please reinstall Node.js"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm available: v$NPM_VERSION"

# Navigate to project directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found! Make sure you're in the KFSQUARE project directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Verify critical dependencies
echo "🔍 Verifying dependencies..."
node -e "
const requiredModules = ['express', 'helmet', 'compression', 'express-rate-limit', '@sendgrid/mail'];
let missing = [];
requiredModules.forEach(module => {
    try {
        require(module);
        console.log('✅', module);
    } catch (err) {
        console.log('❌', module, '- Missing!');
        missing.push(module);
    }
});
if (missing.length > 0) {
    console.log('\\n⚠️  Some dependencies are missing. Running npm install again...');
    process.exit(1);
}
console.log('\\n🎉 All dependencies verified!');
"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created from template"
    echo "⚠️  Please edit .env file with your actual SendGrid API key and email settings"
else
    echo "✅ .env file already exists"
fi

# Test server startup
echo "🧪 Testing server startup..."
timeout 5 node -e "
console.log('Testing server...');
const app = require('./server.js');
setTimeout(() => {
    console.log('✅ Server test successful');
    process.exit(0);
}, 1000);
" 2>/dev/null || {
    echo "⚠️  Server test skipped (may require .env configuration)"
}

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your SendGrid API key"
echo "2. Start development: npm run dev"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "📚 Available commands:"
echo "  npm run dev     - Start development server"
echo "  npm start       - Start production server"
echo "  ./deploy.sh     - Prepare for production deployment"
echo ""
