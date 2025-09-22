#!/bin/bash

# KFSQUARE Security Check Script
# Validates that no sensitive files are tracked by git

echo "🔍 KFSQUARE Security Check - Scanning for sensitive files..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for sensitive files in git index
echo "📋 Checking git-tracked files..."

sensitive_patterns=(
    "\.env$"
    "\.env\."
    "secrets/"
    "keys/"
    "certificates/"
    "backups/"
    "uploads/"
    "\.key$"
    "\.pem$"
    "\.crt$"
    "production\.json$"
    "secrets\.json$"
)

found_sensitive=false

for pattern in "${sensitive_patterns[@]}"; do
    files=$(git ls-files | grep -E "$pattern" | grep -v "example" | grep -v "README")
    if [ ! -z "$files" ]; then
        echo -e "${RED}❌ Found sensitive files matching pattern: $pattern${NC}"
        echo "$files"
        found_sensitive=true
    fi
done

# Check for sensitive content in tracked files
echo ""
echo "🔍 Scanning for sensitive content patterns..."

sensitive_content=(
    "password\s*=\s*['\"][^'\"_][a-zA-Z0-9!@#\$%\^&\*]{8,}['\"]"
    "secret\s*=\s*['\"][^'\"_][a-zA-Z0-9!@#\$%\^&\*]{8,}['\"]"
    "api_key\s*=\s*['\"][^'\"_][a-zA-Z0-9]{16,}['\"]"
    "token\s*=\s*['\"][^'\"_][a-zA-Z0-9]{16,}['\"]"
    "DATABASE_PASSWORD\s*=\s*[^_\$][a-zA-Z0-9!@#\$%\^&\*]{6,}"
    "JWT_SECRET\s*=\s*[^_\$][a-zA-Z0-9!@#\$%\^&\*]{16,}"
    "SESSION_SECRET\s*=\s*[^_\$][a-zA-Z0-9!@#\$%\^&\*]{16,}"
)

for pattern in "${sensitive_content[@]}"; do
    files=$(git grep -l -E "$pattern" 2>/dev/null | grep -v "example" | grep -v "SECURITY.md" | grep -v "security-check.sh" | grep -v "node_modules")
    if [ ! -z "$files" ]; then
        echo -e "${YELLOW}⚠️  Found potential sensitive content pattern: $pattern${NC}"
        echo "$files"
        echo "   Please verify these files don't contain real secrets"
        found_sensitive=true
    fi
done

# Check .env files
echo ""
echo "📁 Checking environment files..."

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Found .env (correctly ignored)${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found - copy from .env.example${NC}"
fi

if [ -f ".env.compose" ]; then
    echo -e "${GREEN}✅ Found .env.compose (correctly ignored)${NC}"
else
    echo -e "${YELLOW}⚠️  No .env.compose file found - copy from .env.compose.example${NC}"
fi

# Check if example files exist
echo ""
echo "📋 Checking example files..."

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example exists${NC}"
else
    echo -e "${RED}❌ .env.example missing${NC}"
    found_sensitive=true
fi

if [ -f ".env.compose.example" ]; then
    echo -e "${GREEN}✅ .env.compose.example exists${NC}"
else
    echo -e "${RED}❌ .env.compose.example missing${NC}"
    found_sensitive=true
fi

# Final result
echo ""
echo "=================================================="
if [ "$found_sensitive" = false ]; then
    echo -e "${GREEN}🔒 SECURITY CHECK PASSED - No sensitive files detected${NC}"
    exit 0
else
    echo -e "${RED}🚨 SECURITY CHECK FAILED - Sensitive files or content detected${NC}"
    echo "Please review and fix the issues above before committing."
    exit 1
fi
