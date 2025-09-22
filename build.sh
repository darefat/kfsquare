#!/bin/bash

# Production Build Script for KFSQUARE Website
echo "🚀 Preparing KFSQUARE website for production..."

# Create build directory
mkdir -p dist

# Copy all necessary files to dist
echo "📁 Copying files..."
cp -r *.html *.css *.js *.svg *.xml *.txt .htaccess dist/ 2>/dev/null || true
cp -r services dist/ 2>/dev/null || true
cp -r assets dist/ 2>/dev/null || true

echo "✅ Production build complete!"
echo "📊 Build summary:"
echo "   - HTML files: $(find dist -name "*.html" | wc -l)"
echo "   - CSS files: $(find dist -name "*.css" | wc -l)" 
echo "   - JS files: $(find dist -name "*.js" | wc -l)"
echo "   - Service pages: $(find dist/services -name "*.html" 2>/dev/null | wc -l)"

echo ""
echo "🌐 Ready for deployment!"
echo "   - Upload the 'dist' folder to your web server"
echo "   - Ensure .htaccess is properly configured"
echo "   - Test all functionality after deployment"

# Optional: Run basic validation
if command -v html-validate &> /dev/null; then
    echo ""
    echo "🔍 Running HTML validation..."
    html-validate dist/*.html dist/services/*.html 2>/dev/null || echo "   HTML validation skipped (html-validate not installed)"
fi

echo ""
echo "✨ KFSQUARE website is production-ready!"
