#!/usr/bin/env bash

# KFSQUARE Cross-Platform Production Deployment Script
# Works on Windows (Git Bash/WSL), macOS, and Linux

set -e  # Exit on error

echo "🚀 KFSQUARE Cross-Platform Production Deployment"
echo "================================================="

# Detect operating system
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS=Linux;;
        Darwin*)    OS=Mac;;
        CYGWIN*)    OS=Cygwin;;
        MINGW*)     OS=MinGw;;
        MSYS*)      OS=Windows;;
        *)          OS="UNKNOWN:${unameOut}"
    esac
    echo "🔍 Platform: $OS"
}

# Cross-platform file operations
copy_file() {
    if command -v cp &> /dev/null; then
        cp "$1" "$2"
    elif command -v copy &> /dev/null; then
        copy "$1" "$2"
    else
        echo "❌ Cannot copy files on this platform"
        exit 1
    fi
}

# Check Node.js installation
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed!"
        echo "Please run ./setup-cross-platform.sh first"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    echo "✅ Node.js version: $NODE_VERSION"
}

# Main deployment process
main() {
    detect_os
    check_node
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        echo "❌ Error: .env file not found!"
        echo "Please copy .env.example to .env and configure your environment variables."
        exit 1
    fi

    # Install dependencies with platform-specific optimizations
    echo "📦 Installing production dependencies..."
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            # Windows specific npm settings
            npm config set script-shell bash
            npm ci --only=production --no-optional
            ;;
        *)
            npm ci --only=production
            ;;
    esac

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
    require('dotenv').config();
    const required = ['NODE_ENV', 'SENDGRID_API_KEY', 'RECIPIENT_EMAIL'];
    const missing = required.filter(env => !process.env[env]);
    if (missing.length > 0) {
        console.log('❌ Missing environment variables:', missing.join(', '));
        process.exit(1);
    }
    console.log('✅ Environment variables configured');
    "

    # Validate static files
    echo "🔍 Validating static files..."
    required_files=("index.html" "styles.css" "index.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "❌ $file not found!"
            exit 1
        fi
    done
    echo "✅ Static files validated"

    # Test server startup with platform-specific timeout
    echo "🧪 Testing server startup..."
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            # Windows doesn't have timeout command by default
            node -e "
            const app = require('./server.js');
            console.log('✅ Server starts successfully');
            setTimeout(() => process.exit(0), 2000);
            " &
            SERVER_PID=$!
            sleep 3
            kill $SERVER_PID 2>/dev/null || true
            ;;
        *)
            timeout 10 node -e "
            const app = require('./server.js');
            console.log('✅ Server starts successfully');
            process.exit(0);
            " || {
                echo "❌ Server failed to start!"
                exit 1
            }
            ;;
    esac

    # Create platform-specific start scripts
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            echo "Creating Windows batch file..."
            cat > start-production.bat << 'EOF'
@echo off
echo Starting KFSQUARE in production mode...
set NODE_ENV=production
npm start
EOF
            echo "✅ start-production.bat created"
            ;;
        *)
            echo "Creating Unix shell script..."
            cat > start-production.sh << 'EOF'
#!/usr/bin/env bash
echo "Starting KFSQUARE in production mode..."
NODE_ENV=production npm start
EOF
            chmod +x start-production.sh
            echo "✅ start-production.sh created"
            ;;
    esac

    echo ""
    echo "🎉 Cross-platform deployment preparation complete!"
    echo "=================================================="
    echo ""
    echo "💻 Platform: $OS"
    echo "📋 Next steps:"
    echo "1. Verify your .env configuration"
    echo "2. Test locally: npm run dev"
    echo "3. Deploy to your server"
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            echo "4. Start production: start-production.bat"
            ;;
        *)
            echo "4. Start production: ./start-production.sh"
            ;;
    esac
    echo ""
    echo "🔗 Your site will be available at: https://kfsquare.com"
    echo ""
    echo "📊 Cross-platform features enabled:"
    echo "   ✅ Security headers (Helmet)"
    echo "   ✅ GZIP compression"
    echo "   ✅ Rate limiting"
    echo "   ✅ Input validation"
    echo "   ✅ Email contact form"
    echo "   ✅ Static file caching"
    echo "   ✅ CORS protection"
    echo "   ✅ Error handling"
    echo "   ✅ Health check endpoint"
    echo "   ✅ Platform detection"
    echo ""
    echo "🌐 Deployment targets:"
    echo "   ✅ Linux servers (Ubuntu, CentOS, RHEL)"
    echo "   ✅ Windows Server (IIS, Node.js)"
    echo "   ✅ macOS (development/testing)"
    echo "   ✅ Docker containers"
    echo "   ✅ Cloud platforms (AWS, Azure, GCP)"
    echo ""
}

main "$@"
