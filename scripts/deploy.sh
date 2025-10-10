#!/bin/bash

# KFSQUARE Production Deployment Script with Environment Variable Validation
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
ENV_FILE="$PROJECT_ROOT/.env.$ENVIRONMENT"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "${YELLOW}$*${NC}"; }
log_error() { log "ERROR" "${RED}$*${NC}"; }
log_success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Print header
print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "   KFSQUARE Deployment Script"
    echo "   Environment: $ENVIRONMENT"
    echo "   $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================="
    echo -e "${NC}"
}

# Validation functions
validate_environment_file() {
    log_info "Validating environment file: $ENV_FILE"
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        log_info "Available environment files:"
        ls -la "$PROJECT_ROOT"/.env* 2>/dev/null || log_warn "No .env files found"
        exit 1
    fi
    
    # Check file permissions
    if [[ "$(stat -f %A "$ENV_FILE" 2>/dev/null || stat -c %a "$ENV_FILE" 2>/dev/null)" != "600" ]]; then
        log_warn "Environment file permissions are not secure. Setting to 600..."
        chmod 600 "$ENV_FILE"
    fi
    
    log_success "Environment file validation passed"
}

# Load and validate environment variables
load_environment() {
    log_info "Loading environment variables from $ENV_FILE"
    
    # Source the environment file
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a
    
    log_success "Environment variables loaded"
}

# MongoDB validation
validate_mongodb() {
    log_info "Validating MongoDB configuration..."
    
    local errors=0
    
    # Required MongoDB variables
    local required_mongo_vars=(
        "MONGODB_URI"
        "MONGODB_DB"
    )
    
    for var in "${required_mongo_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required MongoDB variable missing: $var"
            ((errors++))
        else
            # Mask sensitive info in logs
            if [[ "$var" == "MONGODB_URI" ]]; then
                local masked_uri=$(echo "${!var}" | sed 's/:\/\/[^@]*@/:\/\/***:***@/')
                log_info "$var: $masked_uri"
            else
                log_info "$var: ${!var}"
            fi
        fi
    done
    
    # Validate MongoDB URI format
    if [[ -n "${MONGODB_URI:-}" ]]; then
        if [[ ! "$MONGODB_URI" =~ ^mongodb(\+srv)?:// ]]; then
            log_error "Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://"
            ((errors++))
        fi
        
        # Check for local vs production URI
        if [[ "$ENVIRONMENT" == "production" && "$MONGODB_URI" == *"localhost"* ]]; then
            if [[ "${ALLOW_LOCAL_DB:-false}" != "true" ]]; then
                log_error "Production deployment should not use localhost MongoDB URI"
                log_info "Set ALLOW_LOCAL_DB=true to override this check"
                ((errors++))
            else
                log_warn "Using localhost MongoDB URI in production (ALLOW_LOCAL_DB=true)"
            fi
        fi
    fi
    
    if [[ $errors -gt 0 ]]; then
        log_error "MongoDB validation failed with $errors errors"
        return 1
    fi
    
    log_success "MongoDB configuration validation passed"
}

# Mailgun validation
validate_mailgun() {
    log_info "Validating Mailgun configuration..."
    
    local errors=0
    local warnings=0
    
    # Required Mailgun variables
    local required_mailgun_vars=(
        "MAILGUN_API_KEY"
        "MAILGUN_DOMAIN"
        "RECIPIENT_EMAIL"
    )
    
    for var in "${required_mailgun_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required Mailgun variable missing: $var"
            ((errors++))
        else
            # Mask API key in logs
            if [[ "$var" == "MAILGUN_API_KEY" ]]; then
                log_info "$var: ${!var:0:8}...${!var: -4}"
            else
                log_info "$var: ${!var}"
            fi
        fi
    done
    
    # Validate email format
    if [[ -n "${RECIPIENT_EMAIL:-}" ]]; then
        if [[ ! "$RECIPIENT_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
            log_error "Invalid recipient email format: $RECIPIENT_EMAIL"
            ((errors++))
        fi
    fi
    
    # Validate Mailgun domain
    if [[ -n "${MAILGUN_DOMAIN:-}" ]]; then
        if [[ ! "$MAILGUN_DOMAIN" =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
            log_error "Invalid Mailgun domain format: $MAILGUN_DOMAIN"
            ((errors++))
        fi
    fi
    
    # Check for test/placeholder values
    local test_patterns=(
        "your_mailgun_api_key_here"
        "example.com"
        "test@example.com"
    )
    
    for pattern in "${test_patterns[@]}"; do
        if [[ "${MAILGUN_API_KEY:-}" == *"$pattern"* ]] || 
           [[ "${MAILGUN_DOMAIN:-}" == *"$pattern"* ]] || 
           [[ "${RECIPIENT_EMAIL:-}" == *"$pattern"* ]]; then
            log_warn "Detected placeholder/test value in Mailgun configuration"
            ((warnings++))
        fi
    done
    
    if [[ $errors -gt 0 ]]; then
        log_error "Mailgun validation failed with $errors errors"
        return 1
    fi
    
    if [[ $warnings -gt 0 ]]; then
        log_warn "Mailgun validation completed with $warnings warnings"
    else
        log_success "Mailgun configuration validation passed"
    fi
}

# Security validation
validate_security() {
    log_info "Validating security configuration..."
    
    local errors=0
    local warnings=0
    
    # Required security variables
    local required_security_vars=(
        "SESSION_SECRET"
        "JWT_SECRET"
    )
    
    for var in "${required_security_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required security variable missing: $var"
            ((errors++))
        else
            local secret="${!var}"
            
            # Check secret strength
            if [[ ${#secret} -lt 32 ]]; then
                log_error "$var is too short (minimum 32 characters)"
                ((errors++))
            elif [[ ${#secret} -lt 64 ]]; then
                log_warn "$var should be at least 64 characters for better security"
                ((warnings++))
            fi
            
            # Check for weak/default secrets
            local weak_patterns=(
                "your_secure_session_secret_here"
                "your_secure_jwt_secret_here"
                "secret"
                "password"
                "12345"
            )
            
            for pattern in "${weak_patterns[@]}"; do
                if [[ "$secret" == *"$pattern"* ]]; then
                    log_error "$var contains weak/default pattern: $pattern"
                    ((errors++))
                fi
            done
            
            log_info "$var: ${secret:0:8}...${secret: -4} (${#secret} chars)"
        fi
    done
    
    # Check NODE_ENV
    if [[ "${NODE_ENV:-}" != "$ENVIRONMENT" ]]; then
        log_error "NODE_ENV (${NODE_ENV:-unset}) doesn't match deployment environment ($ENVIRONMENT)"
        ((errors++))
    fi
    
    if [[ $errors -gt 0 ]]; then
        log_error "Security validation failed with $errors errors"
        return 1
    fi
    
    if [[ $warnings -gt 0 ]]; then
        log_warn "Security validation completed with $warnings warnings"
    else
        log_success "Security configuration validation passed"
    fi
}

# Network and connectivity validation
validate_connectivity() {
    log_info "Validating network connectivity..."
    
    # Test MongoDB connection
    if [[ -n "${MONGODB_URI:-}" ]]; then
        log_info "Testing MongoDB connection..."
        if timeout 10 node -e "
            const mongoose = require('mongoose');
            mongoose.connect('$MONGODB_URI', {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 5000
            })
            .then(() => {
                console.log('MongoDB connection successful');
                process.exit(0);
            })
            .catch(err => {
                console.error('MongoDB connection failed:', err.message);
                process.exit(1);
            });
        " > /dev/null 2>&1; then
            log_success "MongoDB connection test passed"
        else
            log_warn "MongoDB connection test failed (this may be expected if MongoDB is not yet running)"
        fi
    fi
    
    # Test Mailgun API connectivity
    if [[ -n "${MAILGUN_API_KEY:-}" && -n "${MAILGUN_DOMAIN:-}" ]]; then
        log_info "Testing Mailgun API connectivity..."
        local mailgun_url="https://api.mailgun.net/v3/${MAILGUN_DOMAIN}"
        
        if timeout 10 curl -s --fail \
            -u "api:${MAILGUN_API_KEY}" \
            "${mailgun_url}/messages" \
            -F from="test@${MAILGUN_DOMAIN}" \
            -F to="test@example.com" \
            -F subject="Connection Test" \
            -F text="Test message" \
            --dry-run > /dev/null 2>&1; then
            log_success "Mailgun API connectivity test passed"
        else
            log_warn "Mailgun API connectivity test failed (check API key and domain)"
        fi
    fi
}

# Performance and resource validation
validate_performance() {
    log_info "Validating performance configuration..."
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_version="16.0.0"
    
    if [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]]; then
        log_error "Node.js version $node_version is below required version $required_version"
        return 1
    fi
    
    log_info "Node.js version: $node_version ✓"
    
    # Check available memory
    local available_memory
    if command -v free >/dev/null 2>&1; then
        available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    elif command -v vm_stat >/dev/null 2>&1; then
        # macOS
        available_memory=$(vm_stat | awk '/free/ {print int($3) * 4 / 1024}')
    fi
    
    if [[ -n "$available_memory" ]]; then
        log_info "Available memory: ${available_memory}MB"
        if [[ "$available_memory" -lt 512 ]]; then
            log_warn "Low available memory: ${available_memory}MB (recommended: 1GB+)"
        fi
    fi
    
    # Check disk space
    local available_disk=$(df "$PROJECT_ROOT" | awk 'NR==2 {print int($4/1024)}')
    log_info "Available disk space: ${available_disk}MB"
    
    if [[ "$available_disk" -lt 1024 ]]; then
        log_warn "Low disk space: ${available_disk}MB (recommended: 2GB+)"
    fi
    
    log_success "Performance validation completed"
}

# Backup current deployment
create_backup() {
    log_info "Creating deployment backup..."
    
    local backup_name="kfsquare-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup important files
    local backup_files=(
        ".env"
        ".env.production"
        "package.json"
        "package-lock.json"
        "server.js"
        "config/"
        "models/"
        "routes/"
    )
    
    for file in "${backup_files[@]}"; do
        if [[ -e "$PROJECT_ROOT/$file" ]]; then
            cp -r "$PROJECT_ROOT/$file" "$backup_path/" 2>/dev/null || true
        fi
    done
    
    # Create backup manifest
    cat > "$backup_path/manifest.json" << EOF
{
    "backup_name": "$backup_name",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "node_version": "$(node --version)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    log_success "Backup created: $backup_path"
}

# Install dependencies
install_dependencies() {
    log_info "Installing production dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Clean install
    if [[ -f "package-lock.json" ]]; then
        npm ci --only=production
    else
        npm install --only=production
    fi
    
    log_success "Dependencies installed successfully"
}

# Run health checks
run_health_checks() {
    log_info "Running post-deployment health checks..."
    
    # Check if server can start
    timeout 30 node -e "
        require('dotenv').config({ path: '$ENV_FILE' });
        const app = require('./server.js');
        console.log('Server started successfully');
        process.exit(0);
    " > /dev/null 2>&1
    
    if [[ $? -eq 0 ]]; then
        log_success "Server startup test passed"
    else
        log_error "Server startup test failed"
        return 1
    fi
}

# Main deployment function
deploy() {
    print_header
    
    log_info "Starting deployment validation for environment: $ENVIRONMENT"
    
    # Run all validations
    validate_environment_file
    load_environment
    validate_mongodb
    validate_mailgun
    validate_security
    validate_connectivity
    validate_performance
    
    # Create backup
    create_backup
    
    # Install dependencies
    install_dependencies
    
    # Run health checks
    run_health_checks
    
    log_success "🎉 Deployment validation completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Log file: $LOG_FILE"
    log_info "To start the application: npm run start:$ENVIRONMENT"
    
    echo ""
    echo -e "${GREEN}Deployment Summary:${NC}"
    echo -e "${GREEN}✓ Environment variables validated${NC}"
    echo -e "${GREEN}✓ MongoDB configuration verified${NC}"
    echo -e "${GREEN}✓ Mailgun integration configured${NC}"
    echo -e "${GREEN}✓ Security settings validated${NC}"
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo -e "${GREEN}✓ Health checks passed${NC}"
    echo ""
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Deployment failed with exit code: $exit_code"
    log_info "Check the log file for details: $LOG_FILE"
    exit $exit_code
}

# Set up error handling
trap handle_error ERR

# Help function
show_help() {
    echo "KFSQUARE Deployment Script"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  production    Deploy to production environment"
    echo "  staging       Deploy to staging environment"
    echo "  development   Deploy to development environment"
    echo ""
    echo "Examples:"
    echo "  $0 production"
    echo "  $0 staging"
    echo ""
    echo "Environment files required:"
    echo "  .env.production"
    echo "  .env.staging"
    echo "  .env.development"
    echo ""
}

# Main execution
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    show_help
    exit 0
fi

# Validate environment parameter
case "$ENVIRONMENT" in
    production|staging|development)
        deploy
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        show_help
        exit 1
        ;;
esac