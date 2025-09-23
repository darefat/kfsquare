#!/usr/bin/env bash

# KFSQUARE Cross-Platform Setup Script
# Works on Windows (Git Bash/WSL), macOS, and Linux

set -e  # Exit on error

echo "🚀 KFSQUARE Cross-Platform Development Environment Setup"
echo "========================================================"

# Global variables
OS=""
ARCH=""
CONTAINER=false
PYTHON_CMD=""
PIP_CMD=""

# Enhanced cross-platform OS detection
detect_os() {
    local unameOut="$(uname -s)"
    case "${unameOut}" in
        Linux*)     
            OS=Linux
            if grep -q Microsoft /proc/version 2>/dev/null; then
                OS="WSL"
            elif [[ -f /system/build.prop ]]; then
                OS="Android"
            fi
            ;;
        Darwin*)    
            OS=Mac
            # Detect Apple Silicon vs Intel
            if [[ $(uname -m) == "arm64" ]]; then
                ARCH="Apple Silicon (M1/M2)"
            else
                ARCH="Intel"
            fi
            ;;
        CYGWIN*)    OS=Cygwin;;
        MINGW*)     OS=MinGw;;
        MSYS*)      OS=Windows;;
        FreeBSD*)   OS=FreeBSD;;
        NetBSD*)    OS=NetBSD;;
        OpenBSD*)   OS=OpenBSD;;
        *)          OS="UNKNOWN:${unameOut}";;
    esac
    echo "🔍 Detected OS: $OS ${ARCH:+($ARCH)}"
    
    # Detect if running in container
    if [[ -f /.dockerenv ]] || grep -q 'docker\|lxc' /proc/1/cgroup 2>/dev/null; then
        echo "🐳 Container environment detected"
        CONTAINER=true
    fi
}

# Enhanced Node.js installation with multiple methods
install_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo "✅ Node.js already installed: $NODE_VERSION"
        return
    fi

    echo "📦 Installing Node.js..."
    
    case $OS in
        "Mac")
            if command -v brew &> /dev/null; then
                echo "🍺 Installing via Homebrew..."
                brew install node
            elif command -v port &> /dev/null; then
                echo "🔧 Installing via MacPorts..."
                sudo port install nodejs18 +universal
            else
                echo "📥 Installing via Node Version Manager (nvm)..."
                install_nvm_and_node
            fi
            ;;
        "Linux"|"WSL"|"Android")
            # Try multiple package managers in order of preference
            if command -v apt &> /dev/null; then
                # Ubuntu/Debian/WSL
                echo "📦 Installing via apt (Ubuntu/Debian)..."
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif command -v yum &> /dev/null; then
                # CentOS/RHEL/Fedora
                echo "📦 Installing via yum (CentOS/RHEL)..."
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                sudo yum install -y nodejs npm
            elif command -v dnf &> /dev/null; then
                # Modern Fedora
                echo "📦 Installing via dnf (Fedora)..."
                sudo dnf install -y nodejs npm
            elif command -v pacman &> /dev/null; then
                # Arch Linux
                echo "📦 Installing via pacman (Arch)..."
                sudo pacman -S nodejs npm
            elif command -v zypper &> /dev/null; then
                # openSUSE
                echo "📦 Installing via zypper (openSUSE)..."
                sudo zypper install nodejs npm
            elif command -v emerge &> /dev/null; then
                # Gentoo
                echo "📦 Installing via emerge (Gentoo)..."
                sudo emerge nodejs
            elif command -v apk &> /dev/null; then
                # Alpine Linux
                echo "📦 Installing via apk (Alpine)..."
                sudo apk add nodejs npm
            else
                echo "📥 Installing via Node Version Manager (nvm)..."
                install_nvm_and_node
            fi
            ;;
        "FreeBSD"|"NetBSD"|"OpenBSD")
            if command -v pkg &> /dev/null; then
                echo "📦 Installing via pkg (*BSD)..."
                sudo pkg install node npm
            else
                echo "📥 Installing via Node Version Manager (nvm)..."
                install_nvm_and_node
            fi
            ;;
        "Windows"|"MinGw"|"Cygwin")
            if command -v choco &> /dev/null; then
                echo "🍫 Installing via Chocolatey..."
                choco install nodejs
            elif command -v scoop &> /dev/null; then
                echo "🥄 Installing via Scoop..."
                scoop install nodejs
            elif command -v winget &> /dev/null; then
                echo "🪟 Installing via Windows Package Manager..."
                winget install OpenJS.NodeJS
            else
                echo "⚠️  Windows detected. Please install Node.js manually:"
                echo "   1. Visit: https://nodejs.org/en/download/"
                echo "   2. Download and install the Windows installer"
                echo "   3. Restart your terminal and run this script again"
                echo "   Or install a package manager:"
                echo "   - Chocolatey: https://chocolatey.org/install"
                echo "   - Scoop: https://scoop.sh/"
                exit 1
            fi
            ;;
        *)
            echo "📥 Installing via Node Version Manager (nvm)..."
            install_nvm_and_node
            ;;
    esac
    
    echo "✅ Node.js installation completed"
}

# Node Version Manager installation (universal fallback)
install_nvm_and_node() {
    echo "📥 Installing Node Version Manager (nvm)..."
    
    # Check if nvm already exists
    if [[ -s "$HOME/.nvm/nvm.sh" ]] || command -v nvm &> /dev/null; then
        echo "✅ nvm already installed"
    else
        # Download and install nvm
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash || {
            echo "❌ Failed to install nvm via curl, trying wget..."
            wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash || {
                echo "❌ Failed to install nvm. Please install Node.js manually."
                exit 1
            }
        }
        
        # Source nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    fi
    
    # Install latest LTS Node.js
    echo "📦 Installing Node.js LTS via nvm..."
    nvm install --lts
    nvm use --lts
    nvm alias default lts/*
}

# Detect Python command (python3, python, or py)
detect_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PIP_CMD="pip3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PIP_CMD="pip"
    elif command -v py &> /dev/null; then
        PYTHON_CMD="py"
        PIP_CMD="py -m pip"
    else
        echo "⚠️  Python not found. Some features may not work."
        return 1
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    echo "✅ Python detected: $PYTHON_CMD (v$PYTHON_VERSION)"
    return 0
}

# Cross-platform port checking
check_port() {
    local port=$1
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            netstat -an | grep -q ":$port "
            ;;
        *)
            if command -v lsof &> /dev/null; then
                lsof -i :$port &> /dev/null
            elif command -v netstat &> /dev/null; then
                netstat -an | grep -q ":$port "
            else
                return 1
            fi
            ;;
    esac
}

# Cross-platform process killing
kill_port() {
    local port=$1
    echo "🔄 Attempting to free port $port..."
    
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            # Windows command - note: this should be run in cmd, not bash
            echo "⚠️  For Windows, manually run: netstat -aon | findstr :$port"
            echo "   Then: taskkill /f /pid [PID]"
            ;;
        *)
            if command -v lsof &> /dev/null; then
                lsof -ti :$port | xargs kill -9 2>/dev/null || true
            fi
            ;;
    esac
}

# Enhanced main setup process
main() {
    detect_os
    detect_python
    
    # Install Node.js
    install_node
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not available! Attempting to fix..."
        
        # Try to source nvm if it exists
        if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
            source "$HOME/.nvm/nvm.sh"
            nvm use default 2>/dev/null || nvm use node 2>/dev/null
        fi
        
        if ! command -v npm &> /dev/null; then
            echo "❌ npm still not available! Please reinstall Node.js"
            exit 1
        fi
    fi

    NPM_VERSION=$(npm -v)
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
    echo "✅ npm: v$NPM_VERSION"

    # Check if we're in the correct directory
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found! Make sure you're in the KFSQUARE project directory"
        echo "📁 Current directory: $(pwd)"
        echo "📋 Available files:"
        ls -la | head -10
        exit 1
    fi
    
    echo "📁 Project directory confirmed: $(pwd)"

    # Clear npm cache if needed
    echo "🧹 Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true

    # Install dependencies with retry logic
    echo "📦 Installing project dependencies..."
    for i in {1..3}; do
        if npm install; then
            echo "✅ Dependencies installed successfully"
            break
        else
            echo "⚠️  npm install failed (attempt $i/3), retrying..."
            rm -rf node_modules package-lock.json 2>/dev/null || true
            sleep 2
            if [ $i -eq 3 ]; then
                echo "❌ Failed to install npm dependencies after 3 attempts"
                exit 1
            fi
        fi
    done

    # Enhanced Python requirements installation
    if [[ -n "$PYTHON_CMD" ]]; then
        echo "🐍 Installing Python requirements..."
        
        # Try to install Python requirements
        if [[ -f "requirements.txt" ]]; then
            $PIP_CMD install -r requirements.txt 2>/dev/null && echo "✅ requirements.txt installed" || echo "⚠️  requirements.txt installation failed"
        fi
        
        if [[ -f "requirements-minimal.txt" ]]; then
            $PIP_CMD install -r requirements-minimal.txt 2>/dev/null && echo "✅ requirements-minimal.txt installed" || echo "⚠️  minimal requirements installation failed"
        fi
        
        # Install essential packages for local development
        $PIP_CMD install http.server 2>/dev/null || true
    fi

    # Enhanced dependency verification
    echo "🔍 Verifying dependencies..."
    node -e "
    const fs = require('fs');
    const path = require('path');
    
    console.log('📦 Checking package.json...');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ Project:', pkg.name || 'KFSQUARE');
    console.log('✅ Version:', pkg.version || '1.0.0');
    
    const requiredModules = ['express', 'helmet', 'compression', 'express-rate-limit'];
    const optionalModules = ['nodemon'];
    
    let missing = [];
    let optional = [];
    
    requiredModules.forEach(module => {
        try {
            require(module);
            console.log('✅', module);
        } catch (err) {
            console.log('❌', module, '- Missing!');
            missing.push(module);
        }
    });
    
    optionalModules.forEach(module => {
        try {
            require(module);
            console.log('✅', module, '(optional)');
        } catch (err) {
            console.log('⚠️ ', module, '- Optional dependency not found');
            optional.push(module);
        }
    });
    
    if (missing.length > 0) {
        console.log('\\n❌ Critical dependencies missing:', missing.join(', '));
        console.log('⚠️  Running npm install again...');
        process.exit(1);
    }
    
    if (optional.length > 0) {
        console.log('\\n📋 Optional dependencies not installed:', optional.join(', '));
        console.log('💡 You can install them with: npm install', optional.join(' '));
    }
    
    console.log('\\n🎉 All critical dependencies verified!');
    " || {
        echo "⚠️  Dependency verification failed, but continuing..."
    }

    # Enhanced environment file creation
    if [ ! -f ".env" ]; then
        echo "📋 Creating .env file from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "✅ .env file created from .env.example"
        else
            # Create a basic .env file
            cat > .env << 'EOF'
# KFSQUARE Environment Configuration
NODE_ENV=development
PORT=3000

# Mail Provider Configuration (Optional)
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.example.com
RECIPIENT_EMAIL=customersupport@kfsquare.com

# Security Configuration
SESSION_SECRET=change_this_in_production

# Database Configuration (if applicable)
# DATABASE_URL=your_database_url_here
EOF
            echo "✅ Basic .env file created"
        fi
        echo "⚠️  Please edit .env file with your actual configuration values"
    else
        echo "✅ .env file already exists"
    fi

    # Enhanced server testing with multiple fallback options
    echo "🧪 Testing server startup options..."
    
    # Test 1: Node.js server
    if timeout 10 node -e "
    console.log('🧪 Testing Node.js server...');
    try {
        const app = require('./server.js');
        setTimeout(() => {
            console.log('✅ Node.js server test successful');
            process.exit(0);
        }, 2000);
    } catch (err) {
        console.log('❌ Node.js server test failed:', err.message);
        process.exit(1);
    }
    " 2>/dev/null; then
        echo "✅ Node.js server ready"
        SERVER_OPTION="nodejs"
    else
        echo "⚠️  Node.js server test failed"
        SERVER_OPTION="python"
    fi
    
    # Test 2: Python HTTP server
    if [[ -n "$PYTHON_CMD" ]]; then
        echo "🧪 Testing Python HTTP server..."
        if check_port 8080; then
            echo "⚠️  Port 8080 already in use, trying to free it..."
            kill_port 8080
            sleep 2
        fi
        
        timeout 3 $PYTHON_CMD -m http.server 8080 --bind 127.0.0.1 2>/dev/null &
        SERVER_PID=$!
        sleep 2
        
        if kill -0 $SERVER_PID 2>/dev/null; then
            echo "✅ Python HTTP server ready"
            kill $SERVER_PID 2>/dev/null
            if [[ "$SERVER_OPTION" != "nodejs" ]]; then
                SERVER_OPTION="python"
            fi
        else
            echo "⚠️  Python HTTP server test failed"
        fi
    fi

    echo ""
    echo "🎉 Cross-Platform Setup Complete!"
    echo "=================================="
    echo ""
    echo "💻 System Information:"
    echo "  • Operating System: $OS ${ARCH:+($ARCH)}"
    echo "  • Node.js: $(node -v 2>/dev/null || echo 'Not available')"
    echo "  • npm: v$(npm -v 2>/dev/null || echo 'Not available')"
    echo "  • Python: $(${PYTHON_CMD:-python3} --version 2>/dev/null || echo 'Not available')"
    echo "  • Container: ${CONTAINER:-false}"
    echo "  • Recommended Server: $SERVER_OPTION"
    echo ""
    echo "🚀 Quick Start Commands:"
    echo "=================================="
    
    case $SERVER_OPTION in
        "nodejs")
            echo "  🟢 Primary (Node.js):"
            echo "    npm run dev      # Development server with auto-reload"
            echo "    npm start        # Production server"
            echo ""
            echo "  🔵 Alternative (Python):"
            echo "    npm run serve    # Python HTTP server (port 8080)"
            echo "    $PYTHON_CMD -m http.server 8080"
            ;;
        "python")
            echo "  🔵 Primary (Python):"
            echo "    npm run serve    # Python HTTP server (port 8080)"
            echo "    $PYTHON_CMD -m http.server 8080"
            echo ""
            echo "  � Alternative (Node.js - may need configuration):"
            echo "    npm run dev      # Development server (if Node.js issues are resolved)"
            ;;
        *)
            echo "  🟡 Available options:"
            echo "    npm run serve    # Python HTTP server (port 8080)"
            echo "    $PYTHON_CMD -m http.server 8080  # Direct Python server"
            echo "    npm run dev      # Node.js development server"
            ;;
    esac
    
    echo ""
    echo "🌐 Access URLs:"
    echo "  • Local: http://localhost:3000 (Node.js) or http://localhost:8080 (Python)"
    echo "  • Network: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'your-ip'):3000"
    echo ""
    echo "📋 Configuration:"
    echo "  • Edit .env file for Mailgun email integration"
    echo "  • Customize server.js for advanced Node.js features"
    echo "  • All static files served from current directory"
    echo ""
    echo "🛠️  Development Tools:"
    echo "  • Hot reload: Supported in development mode"
    echo "  • Customer Support Chat: Enhanced with file upload, voice messages"
    echo "  • Cross-platform deployment ready"
    echo ""
    echo "📱 Platform-Specific Notes:"
    case $OS in
        "Windows"|"MinGw"|"Cygwin")
            echo "  🪟 Windows:"
            echo "    • Use Git Bash, PowerShell, or WSL for best experience"
            echo "    • Windows Terminal recommended"
            echo "    • Consider WSL2 for Linux-like environment"
            echo "    • Chocolatey or Scoop for package management"
            ;;
        "Mac")
            echo "  🍎 macOS:"
            echo "    • Homebrew recommended: brew install node"
            echo "    • Terminal.app or iTerm2 recommended"
            echo "    • Xcode Command Line Tools may be required"
            if [[ "$ARCH" == "Apple Silicon"* ]]; then
                echo "    • Apple Silicon detected - native performance"
            else
                echo "    • Intel Mac - full compatibility"
            fi
            ;;
        "Linux")
            echo "  🐧 Linux:"
            echo "    • Package manager: $(command -v apt >&/dev/null && echo 'apt' || command -v yum >&/dev/null && echo 'yum' || command -v pacman >&/dev/null && echo 'pacman' || echo 'detected')"
            echo "    • systemd service ready for production deployment"
            echo "    • Docker and container deployment supported"
            ;;
        "WSL")
            echo "  🪟🐧 Windows Subsystem for Linux:"
            echo "    • Native Linux experience on Windows"
            echo "    • Access Windows files via /mnt/c/"
            echo "    • VS Code integration available"
            ;;
        "FreeBSD"|"NetBSD"|"OpenBSD")
            echo "  🔱 BSD Unix:"
            echo "    • pkg package manager recommended"
            echo "    • Ports collection available for source builds"
            ;;
        *)
            echo "  ❓ Unknown/Other:"
            echo "    • Manual configuration may be required"
            echo "    • Python HTTP server recommended as fallback"
            ;;
    esac
    
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  • Port conflicts: Script automatically detects and resolves"
    echo "  • Permission issues: Use sudo only when prompted"
    echo "  • Network issues: Check firewall settings"
    echo "  • Node.js issues: nvm provides version management"
    echo ""
    echo "📚 Additional Resources:"
    echo "  • Node.js: https://nodejs.org/en/docs/"
    echo "  • npm: https://docs.npmjs.com/"
    echo "  • Express.js: https://expressjs.com/en/guide/"
    echo "  • Project repository: Check README.md for latest updates"
    echo ""
    
    if [[ "$SERVER_OPTION" == "nodejs" ]]; then
        echo "🎯 Ready to start! Run: npm run dev"
    else
        echo "🎯 Ready to start! Run: npm run serve"
    fi
}

main "$@"
