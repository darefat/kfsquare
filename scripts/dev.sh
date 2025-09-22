#!/bin/bash
# KFSQUARE Development Startup Script

set -e

echo "🛠️ Starting KFSQUARE Development Server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development server
NODE_ENV=development node server.js
