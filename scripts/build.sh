#!/usr/bin/env bash
set -euo pipefail

# Simple production build script for static site assets
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

# Prefer local node binaries when available
NODE_BIN="$(npm bin 2>/dev/null || echo ./node_modules/.bin)"
CLEANCSS_BIN="$NODE_BIN/cleancss"
TERSER_BIN="$NODE_BIN/terser"

echo "➡️  Preparing production assets..."

# Minify CSS
if [ -x "$CLEANCSS_BIN" ]; then
  "$CLEANCSS_BIN" -O2 -o styles.min.css styles.css
  echo "✅ CSS minified to styles.min.css"
elif command -v cleancss >/dev/null 2>&1; then
  cleancss -O2 -o styles.min.css styles.css
  echo "✅ CSS minified to styles.min.css"
else
  cp styles.css styles.min.css
  echo "ℹ️  clean-css-cli not found, copied styles.css to styles.min.css"
fi

# Minify JS
if [ -x "$TERSER_BIN" ]; then
  "$TERSER_BIN" index.js -c -m -o index.min.js || cp index.js index.min.js
  "$TERSER_BIN" services.js -c -m -o services.min.js || cp services.js services.min.js
  echo "✅ JS minified to *.min.js"
elif command -v terser >/dev/null 2>&1; then
  terser index.js -c -m -o index.min.js || cp index.js index.min.js
  terser services.js -c -m -o services.min.js || cp services.js services.min.js
  echo "✅ JS minified to *.min.js"
else
  cp index.js index.min.js 2>/dev/null || true
  cp services.js services.min.js 2>/dev/null || true
  echo "ℹ️  terser not found, copied JS to *.min.js"
fi

# Inject cache-busting hashes into HTML (simple timestamp)
STAMP=$(date +%s)
sed -i.bak "s/styles.css/styles.min.css?v=${STAMP}/g" index.html services.html about.html 2>/dev/null || true
sed -i.bak "s/index.js/index.min.js?v=${STAMP}/g" index.html 2>/dev/null || true
sed -i.bak "s/services.js/services.min.js?v=${STAMP}/g" services.html 2>/dev/null || true

# Create dist directory
mkdir -p dist
cp -a index.html services.html about.html portfolio.html contact.html styles.min.css index.min.js services.min.js favicon.ico services.json ./dist 2>/dev/null || true
cp -a assets ./dist/assets 2>/dev/null || true

echo "🎉 Build complete. Artifacts in dist/"
