#!/bin/bash
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
