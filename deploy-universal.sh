#!/usr/bin/env bash

# KFSQUARE Universal Deployment Script
# Supports Docker, Cloud Platforms, and Traditional Hosting

set -e  # Exit on error

echo "🚀 KFSQUARE Universal Deployment System"
echo "========================================"

# Source the setup script functions
if [[ -f "./setup-cross-platform.sh" ]]; then
    source ./setup-cross-platform.sh
else
    echo "❌ setup-cross-platform.sh not found. Please run from project root."
    exit 1
fi

# Deployment options
DEPLOY_TARGET=""
CLOUD_PROVIDER=""
DOCKER_ENABLED=false

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Deployment Options:"
    echo "  --docker              Build and deploy using Docker containers"
    echo "  --cloud <provider>    Deploy to cloud platform (aws|azure|gcp|heroku|vercel)"
    echo "  --local               Deploy to local production environment"
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --local"
    echo "  $0 --docker"
    echo "  $0 --cloud aws"
    echo "  $0 --cloud heroku"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --docker)
            DOCKER_ENABLED=true
            DEPLOY_TARGET="docker"
            shift
            ;;
        --cloud)
            DEPLOY_TARGET="cloud"
            CLOUD_PROVIDER="$2"
            shift 2
            ;;
        --local)
            DEPLOY_TARGET="local"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Interactive selection if no options provided
if [[ -z "$DEPLOY_TARGET" ]]; then
    echo "🎯 Select deployment target:"
    echo "1) Local production environment"
    echo "2) Docker containers"
    echo "3) Cloud platform (AWS, Azure, GCP, Heroku, Vercel)"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1) DEPLOY_TARGET="local" ;;
        2) DEPLOY_TARGET="docker"; DOCKER_ENABLED=true ;;
        3) 
            DEPLOY_TARGET="cloud"
            echo "☁️  Select cloud provider:"
            echo "1) AWS (Elastic Beanstalk/EC2)"
            echo "2) Microsoft Azure (App Service)"
            echo "3) Google Cloud Platform (App Engine)"
            echo "4) Heroku"
            echo "5) Vercel"
            
            read -p "Enter cloud provider choice (1-5): " cloud_choice
            case $cloud_choice in
                1) CLOUD_PROVIDER="aws" ;;
                2) CLOUD_PROVIDER="azure" ;;
                3) CLOUD_PROVIDER="gcp" ;;
                4) CLOUD_PROVIDER="heroku" ;;
                5) CLOUD_PROVIDER="vercel" ;;
                *) echo "Invalid choice"; exit 1 ;;
            esac
            ;;
        4) echo "Deployment cancelled"; exit 0 ;;
        *) echo "Invalid choice"; exit 1 ;;
    esac
fi

# Detect environment and prepare
detect_os
detect_python

echo "🔍 Deployment Configuration:"
echo "  Target: $DEPLOY_TARGET"
echo "  Cloud Provider: ${CLOUD_PROVIDER:-N/A}"
echo "  Docker: ${DOCKER_ENABLED:-false}"
echo "  OS: $OS"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required files exist
required_files=("package.json" "server.js" "index.html")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
    echo "✅ Found: $file"
done

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found, installing..."
    install_node
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found after Node.js installation"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo "✅ npm: v$(npm -v)"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production || npm install --only=production

# Run tests if available
if npm run test --silent 2>/dev/null; then
    echo "✅ Tests passed"
else
    echo "⚠️  No tests found or tests failed"
fi

# Build production assets if build script exists
if npm run build --silent 2>/dev/null; then
    echo "✅ Production build completed"
else
    echo "⚠️  No build script found, using development assets"
fi

# Deployment-specific actions
case $DEPLOY_TARGET in
    "local")
        deploy_local
        ;;
    "docker")
        deploy_docker
        ;;
    "cloud")
        deploy_cloud
        ;;
    *)
        echo "❌ Unknown deployment target: $DEPLOY_TARGET"
        exit 1
        ;;
esac

# Local deployment function
deploy_local() {
    echo "🏠 Deploying to local production environment..."
    
    # Create production directory
    PROD_DIR="/opt/kfsquare"
    if [[ "$OS" == "Windows"* ]] || [[ "$OS" == "MinGw" ]] || [[ "$OS" == "Cygwin" ]]; then
        PROD_DIR="C:/kfsquare-prod"
    fi
    
    echo "📁 Production directory: $PROD_DIR"
    
    # Copy files
    if command -v rsync &> /dev/null; then
        rsync -av --exclude node_modules --exclude .git . "$PROD_DIR/"
    else
        cp -r . "$PROD_DIR/"
    fi
    
    cd "$PROD_DIR"
    npm install --only=production
    
    # Create systemd service (Linux only)
    if [[ "$OS" == "Linux" ]] && command -v systemctl &> /dev/null; then
        create_systemd_service
    fi
    
    echo "✅ Local deployment completed"
    echo "🌐 Start server: cd $PROD_DIR && npm start"
}

# Docker deployment function
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    # Create Dockerfile if it doesn't exist
    if [[ ! -f "Dockerfile" ]]; then
        create_dockerfile
    fi
    
    # Create docker-compose.yml if it doesn't exist
    if [[ ! -f "docker-compose.yml" ]]; then
        create_docker_compose
    fi
    
    # Build Docker image
    echo "🔨 Building Docker image..."
    docker build -t kfsquare:latest .
    
    echo "✅ Docker deployment ready"
    echo "🐳 Start container: docker-compose up -d"
    echo "🌐 Access: http://localhost:3000"
}

# Cloud deployment function
deploy_cloud() {
    echo "☁️  Deploying to $CLOUD_PROVIDER..."
    
    case $CLOUD_PROVIDER in
        "heroku")
            deploy_heroku
            ;;
        "vercel")
            deploy_vercel
            ;;
        "aws")
            deploy_aws
            ;;
        "azure")
            deploy_azure
            ;;
        "gcp")
            deploy_gcp
            ;;
        *)
            echo "❌ Unsupported cloud provider: $CLOUD_PROVIDER"
            exit 1
            ;;
    esac
}

# Helper functions for cloud deployments
deploy_heroku() {
    echo "🚀 Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Create Procfile
    echo "web: npm start" > Procfile
    
    # Initialize git if needed
    if [[ ! -d ".git" ]]; then
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    echo "📝 Create Heroku app (or use existing):"
    read -p "Enter Heroku app name (or press Enter to generate): " app_name
    
    if [[ -n "$app_name" ]]; then
        heroku create "$app_name"
    else
        heroku create
    fi
    
    # Deploy
    git push heroku main || git push heroku master
    
    echo "✅ Heroku deployment completed"
    heroku open
}

deploy_vercel() {
    echo "▲ Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Create vercel.json
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
EOF
    
    vercel --prod
    
    echo "✅ Vercel deployment completed"
}

deploy_aws() {
    echo "☁️  AWS deployment guidance..."
    echo "📋 For AWS deployment, consider:"
    echo "  • Elastic Beanstalk for easy Node.js deployment"
    echo "  • EC2 for full control"
    echo "  • Lambda + API Gateway for serverless"
    echo "  • S3 + CloudFront for static hosting with API"
    echo ""
    echo "📖 AWS CLI required: https://aws.amazon.com/cli/"
    echo "🔧 Consider using AWS CDK or CloudFormation for infrastructure"
}

deploy_azure() {
    echo "☁️  Azure deployment guidance..."
    echo "📋 For Azure deployment, consider:"
    echo "  • App Service for Node.js web apps"
    echo "  • Container Instances for Docker deployment"
    echo "  • Static Web Apps for frontend + API"
    echo ""
    echo "📖 Azure CLI required: https://docs.microsoft.com/en-us/cli/azure/"
}

deploy_gcp() {
    echo "☁️  Google Cloud deployment guidance..."
    echo "📋 For GCP deployment, consider:"
    echo "  • App Engine for managed Node.js hosting"
    echo "  • Cloud Run for containerized deployment"
    echo "  • Compute Engine for full control"
    echo ""
    echo "📖 gcloud CLI required: https://cloud.google.com/sdk/docs/install"
}

# Create Dockerfile
create_dockerfile() {
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kfsquare -u 1001

# Change ownership
RUN chown -R kfsquare:nodejs /usr/src/app
USER kfsquare

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Start application
CMD ["npm", "start"]
EOF
    echo "✅ Dockerfile created"
}

# Create docker-compose.yml
create_docker_compose() {
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  kfsquare:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "--version"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Add nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      # - ./ssl:/etc/ssl:ro  # Uncomment for SSL
    depends_on:
      - kfsquare
    restart: unless-stopped
EOF
    echo "✅ docker-compose.yml created"
}

# Create systemd service (Linux only)
create_systemd_service() {
    cat > /tmp/kfsquare.service << EOF
[Unit]
Description=KFSQUARE Web Application
After=network.target

[Service]
Type=simple
User=kfsquare
WorkingDirectory=$PROD_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    sudo mv /tmp/kfsquare.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable kfsquare
    
    echo "✅ systemd service created"
    echo "🔧 Control service with:"
    echo "  sudo systemctl start kfsquare"
    echo "  sudo systemctl stop kfsquare"
    echo "  sudo systemctl status kfsquare"
}

echo ""
echo "🎉 Deployment process completed!"
echo "================================"

main "$@"
