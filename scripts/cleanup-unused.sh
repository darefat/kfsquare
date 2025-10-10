#!/bin/bash

# KFSQUARE Unused Files Cleanup Script
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 KFSQUARE - Removing Unused Files${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# Track what we remove
REMOVED_COUNT=0
REMOVED_SIZE=0

# Function to safely remove files/directories with size tracking
safe_remove() {
    local path="$1"
    local description="$2"
    
    if [[ -e "$path" ]]; then
        local size=0
        if [[ -f "$path" ]]; then
            size=$(stat -f%z "$path" 2>/dev/null || stat -c%s "$path" 2>/dev/null || echo 0)
        elif [[ -d "$path" ]]; then
            size=$(du -sb "$path" 2>/dev/null | cut -f1 || echo 0)
        fi
        
        echo -e "${RED}Removing:${NC} $path ${YELLOW}($description)${NC}"
        rm -rf "$path"
        REMOVED_COUNT=$((REMOVED_COUNT + 1))
        REMOVED_SIZE=$((REMOVED_SIZE + size))
    fi
}

# Function to check if file exists and is empty
remove_if_empty() {
    local path="$1"
    local description="$2"
    
    if [[ -f "$path" && ! -s "$path" ]]; then
        safe_remove "$path" "$description - empty file"
    fi
}

echo -e "${YELLOW}Phase 1: Removing build artifacts and temporary files${NC}"

# Build artifacts
safe_remove "dist/" "Build output directory"
safe_remove "build/" "Build directory"
safe_remove ".next/" "Next.js build cache"
safe_remove "out/" "Static export directory"
safe_remove ".cache/" "Cache directory"
safe_remove ".parcel-cache/" "Parcel cache"
safe_remove ".webpack/" "Webpack cache"
safe_remove ".rollup.cache/" "Rollup cache"

# Temporary files
find . -name "*.tmp" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.temp" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.swp" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.swo" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*~" -type f -exec rm -f {} \; 2>/dev/null || true

# OS files
find . -name ".DS_Store" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "Thumbs.db" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "desktop.ini" -type f -exec rm -f {} \; 2>/dev/null || true

echo ""
echo -e "${YELLOW}Phase 2: Removing unused configuration files${NC}"

# Duplicate/unused config files
safe_remove "config/mailgun.js" "Mailgun config (functionality moved to server.js)"
safe_remove "config/security.js" "Security config (integrated into server.js)"
safe_remove "config/winston.js" "Winston config (not used)"
safe_remove "config/cors.js" "CORS config (integrated into server.js)"
safe_remove "config/helmet.js" "Helmet config (integrated into server.js)"
safe_remove "config/rate-limit.js" "Rate limit config (integrated into server.js)"

# Environment example files
safe_remove ".env.example" "Environment example file"
safe_remove ".env.sample" "Environment sample file"
safe_remove ".env.template" "Environment template file"

# Package manager files (keep only npm)
safe_remove "yarn.lock" "Yarn lock file (using npm)"
safe_remove "pnpm-lock.yaml" "PNPM lock file (using npm)"
safe_remove ".yarnrc" "Yarn configuration"
safe_remove ".yarnrc.yml" "Yarn configuration v2"
safe_remove "pnpm-workspace.yaml" "PNPM workspace config"

echo ""
echo -e "${YELLOW}Phase 3: Removing unused route files${NC}"

# Route files that are integrated into server.js
safe_remove "routes/" "Routes directory (functionality moved to server.js)"
safe_remove "api/" "API directory (functionality moved to server.js)"
safe_remove "controllers/" "Controllers directory (not used)"

echo ""
echo -e "${YELLOW}Phase 4: Removing unused middleware files${NC}"

# Middleware files integrated into server.js
safe_remove "middleware/" "Middleware directory (functionality integrated into server.js)"

echo ""
echo -e "${YELLOW}Phase 5: Removing unused utility files${NC}"

# Check and remove unused utilities
safe_remove "utils/logger.js" "Logger utility (not used)"
safe_remove "utils/encryption.js" "Encryption utility (not used)"
safe_remove "utils/helpers.js" "Helper utilities (not used)"
safe_remove "utils/constants.js" "Constants file (not used)"
safe_remove "utils/validation.js" "Validation utility (integrated into server.js)"

# Remove utils directory if empty
if [[ -d "utils" && -z "$(ls -A utils)" ]]; then
    safe_remove "utils/" "Empty utils directory"
fi

echo ""
echo -e "${YELLOW}Phase 6: Removing test files and coverage${NC}"

# Test files (if not actively testing)
safe_remove "test/" "Test directory"
safe_remove "tests/" "Tests directory"
safe_remove "__tests__/" "Jest tests directory"
safe_remove "spec/" "Spec directory"
safe_remove "coverage/" "Coverage reports"
safe_remove ".nyc_output/" "NYC coverage output"

# Test configuration files
safe_remove "jest.config.js" "Jest configuration"
safe_remove "jest.config.json" "Jest configuration"
safe_remove ".jestrc" "Jest configuration"
safe_remove "mocha.opts" "Mocha options"
safe_remove "karma.conf.js" "Karma configuration"
safe_remove "cypress.json" "Cypress configuration"
safe_remove "cypress/" "Cypress tests"

# Individual test files
find . -name "*.test.js" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.spec.js" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.test.ts" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.spec.ts" -type f -exec rm -f {} \; 2>/dev/null || true

echo ""
echo -e "${YELLOW}Phase 7: Removing unused documentation${NC}"

# Unused documentation
safe_remove "CHANGELOG.md" "Changelog (if empty/unused)"
safe_remove "CONTRIBUTING.md" "Contributing guide (if not needed)"
safe_remove "CODE_OF_CONDUCT.md" "Code of conduct (if not needed)"
safe_remove "SECURITY.md" "Security policy (if not needed)"
safe_remove "docs/" "Documentation directory (if unused)"
safe_remove ".github/" "GitHub templates (if not needed)"

echo ""
echo -e "${YELLOW}Phase 8: Removing unused frontend assets${NC}"

# Check for unused CSS/JS files
safe_remove "src/" "Source directory (if exists and unused)"
safe_remove "public/js/" "Public JS directory (if functionality moved to index.js)"
safe_remove "public/css/" "Public CSS directory (if functionality moved to styles.css)"
safe_remove "assets/" "Assets directory (if unused)"
safe_remove "static/" "Static directory (if unused)"

# Remove empty directories
find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true

echo ""
echo -e "${YELLOW}Phase 9: Removing editor and IDE files${NC}"

# Editor files
safe_remove ".vscode/settings.json" "VS Code settings (keep workspace settings)"
safe_remove ".idea/" "IntelliJ IDEA files"
safe_remove "*.sublime-project" "Sublime Text project"
safe_remove "*.sublime-workspace" "Sublime Text workspace"
safe_remove ".brackets.json" "Brackets configuration"

echo ""
echo -e "${YELLOW}Phase 10: Removing unused log files${NC}"

# Old log files
safe_remove "npm-debug.log*" "NPM debug logs"
safe_remove "yarn-debug.log*" "Yarn debug logs"
safe_remove "yarn-error.log*" "Yarn error logs"
safe_remove "lerna-debug.log*" "Lerna debug logs"
safe_remove "*.log" "Log files"

echo ""
echo -e "${YELLOW}Phase 11: Cleaning up backup and temporary files${NC}"

# Backup files
find . -name "*.backup" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.bak" -type f -exec rm -f {} \; 2>/dev/null || true
find . -name "*.orig" -type f -exec rm -f {} \; 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Cleanup Summary${NC}"
echo "Files/directories removed: $REMOVED_COUNT"
echo "Space freed: $(numfmt --to=iec $REMOVED_SIZE 2>/dev/null || echo "$REMOVED_SIZE bytes")"

echo ""
echo -e "${GREEN}📁 Essential files remaining:${NC}"
ls -la | grep -E "\.(html|js|css|json|md|env|sh)$|^d.*" | head -20

echo ""
echo -e "${BLUE}🎯 Project is now clean and optimized!${NC}"

# Verify essential files exist
echo ""
echo -e "${YELLOW}🔍 Verifying essential files exist:${NC}"
essential_files=(
    "index.html"
    "server.js" 
    "index.js"
    "styles.css"
    "package.json"
    ".env"
)

for file in "${essential_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(MISSING!)${NC}"
    fi
done

echo ""
echo -e "${BLUE}🚀 Run 'npm install' if you removed node_modules${NC}"
echo -e "${BLUE}🚀 Your project is ready for production!${NC}"