#!/bin/bash

# KFSQUARE Cleanup Script - Remove unused files
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🧹 KFSQUARE Cleanup - Removing unused files..."
echo "Project root: $PROJECT_ROOT"

# Function to safely remove files/directories
safe_remove() {
    local path="$1"
    if [[ -e "$path" ]]; then
        echo "Removing: $path"
        rm -rf "$path"
    else
        echo "Not found (skipping): $path"
    fi
}

# 1. Remove unused configuration files
echo "📁 Cleaning configuration files..."
safe_remove "config/mailgun.js"
safe_remove "config/security.js"
safe_remove "config/winston.js"
safe_remove ".env.example"

# 2. Remove unused route files
echo "🛣️  Cleaning route files..."
safe_remove "routes/contacts.js"
safe_remove "routes/health.js"
safe_remove "routes/api.js"

# 3. Remove unused middleware
echo "🔧 Cleaning middleware files..."
safe_remove "middleware/auth.js"
safe_remove "middleware/validation.js"
safe_remove "middleware/cors.js"

# 4. Remove unused utilities
echo "🛠️  Cleaning utility files..."
safe_remove "utils/logger.js"
safe_remove "utils/encryption.js"
safe_remove "utils/helpers.js"
safe_remove "utils/constants.js"

# 5. Remove test files if not needed
echo "🧪 Cleaning test files..."
safe_remove "test/"
safe_remove "tests/"
safe_remove "__tests__/"
safe_remove "*.test.js"
safe_remove "*.spec.js"
safe_remove "jest.config.js"

# 6. Remove build artifacts
echo "🏗️  Cleaning build artifacts..."
safe_remove "dist/"
safe_remove "build/"
safe_remove ".next/"
safe_remove "out/"
safe_remove ".cache/"

# 7. Remove unused documentation
echo "📚 Cleaning documentation..."
safe_remove "CHANGELOG.md"
safe_remove "CONTRIBUTING.md"
safe_remove "docs/old/"
safe_remove "docs/*.backup"

# 8. Remove unused package files
echo "📦 Cleaning package files..."
safe_remove "yarn.lock"
safe_remove "pnpm-lock.yaml"
safe_remove ".yarnrc"
safe_remove ".npmrc"

# 9. Remove temporary files
echo "🗑️  Cleaning temporary files..."
safe_remove "*.log"
safe_remove "*.tmp"
safe_remove ".DS_Store"
safe_remove "Thumbs.db"
safe_remove "*.swp"
safe_remove "*.swo"
safe_remove "*~"

# 10. Remove node_modules if requested
if [[ "${1:-}" == "--deep" ]]; then
    echo "🔥 Deep clean: Removing node_modules..."
    safe_remove "node_modules/"
    echo "Run 'npm install' to reinstall dependencies"
fi

# 11. Clean npm cache
echo "🧽 Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "Core files remaining:"
echo "  📄 index.html"
echo "  📄 server.js"
echo "  📄 index.js"
echo "  📄 styles.css"
echo "  📄 package.json"
echo "  📄 .env"
echo "  📄 .env.production"
echo "  📁 scripts/"
echo "  📁 utils/"
echo "  📁 config/"
echo "  📁 models/"
echo ""
echo "🎯 Your project is now clean and optimized!"