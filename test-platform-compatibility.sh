#!/usr/bin/env bash

# KFSQUARE Platform Compatibility Test Suite
# Tests all platform-agnostic features and deployment methods

set -e

echo "🧪 KFSQUARE Platform Compatibility Test Suite"
echo "=============================================="

# Test Results Array
declare -a TEST_RESULTS=()

# Colors for output (if supported)
if command -v tput &> /dev/null && tput colors &> /dev/null && [[ $(tput colors) -ge 8 ]]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    RED="" GREEN="" YELLOW="" BLUE="" BOLD="" RESET=""
fi

# Test result tracking
pass_test() {
    echo "${GREEN}✅ PASS${RESET}: $1"
    TEST_RESULTS+=("PASS: $1")
}

fail_test() {
    echo "${RED}❌ FAIL${RESET}: $1"
    TEST_RESULTS+=("FAIL: $1")
}

warn_test() {
    echo "${YELLOW}⚠️  WARN${RESET}: $1"
    TEST_RESULTS+=("WARN: $1")
}

info_test() {
    echo "${BLUE}ℹ️  INFO${RESET}: $1"
}

# Source setup script for functions
if [[ -f "./setup-cross-platform.sh" ]]; then
    source ./setup-cross-platform.sh
    info_test "Setup script functions loaded"
else
    fail_test "setup-cross-platform.sh not found"
    exit 1
fi

# Test 1: Platform Detection
test_platform_detection() {
    echo ""
    echo "${BOLD}Test 1: Platform Detection${RESET}"
    echo "----------------------------------------"
    
    detect_os
    if [[ -n "$OS" ]]; then
        pass_test "Operating system detected: $OS"
    else
        fail_test "Failed to detect operating system"
    fi
    
    if detect_python; then
        pass_test "Python detected: $PYTHON_CMD"
    else
        warn_test "Python not found - some features may be limited"
    fi
}

# Test 2: Required Files
test_required_files() {
    echo ""
    echo "${BOLD}Test 2: Required Files${RESET}"
    echo "----------------------------------------"
    
    local required_files=(
        "package.json"
        "server.js" 
        "index.html"
        "index.js"
        "styles.css"
        "setup-cross-platform.sh"
        "deploy-universal.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            pass_test "Required file exists: $file"
        else
            fail_test "Missing required file: $file"
        fi
    done
}

# Test 3: Configuration Files
test_config_files() {
    echo ""
    echo "${BOLD}Test 3: Configuration Files${RESET}"
    echo "----------------------------------------"
    
    # Test package.json structure
    if command -v node &> /dev/null; then
        if node -e "const pkg = require('./package.json'); console.log('Package name:', pkg.name)" 2>/dev/null; then
            pass_test "package.json is valid JSON"
        else
            fail_test "package.json is invalid or unreadable"
        fi
    else
        warn_test "Node.js not available - cannot validate package.json"
    fi
    
    # Test Docker files
    if [[ -f "Dockerfile" ]]; then
        pass_test "Dockerfile exists"
        if grep -q "FROM.*node" Dockerfile; then
            pass_test "Dockerfile uses Node.js base image"
        else
            warn_test "Dockerfile may not be Node.js compatible"
        fi
    else
        warn_test "Dockerfile not found - Docker deployment not available"
    fi
    
    # Test environment files
    if [[ -f ".env.example" ]]; then
        pass_test ".env.example template exists"
    else
        warn_test ".env.example not found - manual environment setup required"
    fi
}

# Test 4: Dependencies
test_dependencies() {
    echo ""
    echo "${BOLD}Test 4: Dependencies${RESET}"
    echo "----------------------------------------"
    
    # Node.js dependencies
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        pass_test "Node.js and npm available"
        
        # Test critical dependencies
        local critical_deps=("express" "helmet" "compression")
        for dep in "${critical_deps[@]}"; do
            if node -e "require('$dep')" 2>/dev/null; then
                pass_test "Critical dependency available: $dep"
            else
                warn_test "Critical dependency missing: $dep"
            fi
        done
    else
        warn_test "Node.js/npm not available - limited functionality"
    fi
    
    # Python dependencies
    if [[ -n "$PYTHON_CMD" ]]; then
        pass_test "Python HTTP server available"
    else
        fail_test "No Python interpreter found - fallback server unavailable"
    fi
}

# Test 5: Server Functionality
test_server_functionality() {
    echo ""
    echo "${BOLD}Test 5: Server Functionality${RESET}"
    echo "----------------------------------------"
    
    # Test Python HTTP server
    if [[ -n "$PYTHON_CMD" ]]; then
        info_test "Testing Python HTTP server startup..."
        if timeout 5 $PYTHON_CMD -m http.server 8081 --bind 127.0.0.1 >/dev/null 2>&1 &
        then
            local server_pid=$!
            sleep 2
            if kill -0 $server_pid 2>/dev/null; then
                pass_test "Python HTTP server can start"
                kill $server_pid 2>/dev/null || true
            else
                fail_test "Python HTTP server failed to start"
            fi
        else
            fail_test "Python HTTP server startup test failed"
        fi
    fi
    
    # Test Node.js server (if available)
    if command -v node &> /dev/null && [[ -f "server.js" ]]; then
        info_test "Testing Node.js server syntax..."
        if node -c server.js 2>/dev/null; then
            pass_test "Node.js server syntax is valid"
        else
            fail_test "Node.js server has syntax errors"
        fi
    fi
}

# Test 6: Frontend Assets
test_frontend_assets() {
    echo ""
    echo "${BOLD}Test 6: Frontend Assets${RESET}"
    echo "----------------------------------------"
    
    # Test HTML structure
    if [[ -f "index.html" ]]; then
        if grep -q "<!DOCTYPE html>" index.html; then
            pass_test "HTML5 DOCTYPE declaration found"
        else
            warn_test "HTML5 DOCTYPE not found"
        fi
        
        if grep -q "chat-widget" index.html; then
            pass_test "Customer support chat widget found in HTML"
        else
            fail_test "Customer support chat widget missing"
        fi
    fi
    
    # Test CSS
    if [[ -f "styles.css" ]]; then
        if grep -q "chat-widget" styles.css; then
            pass_test "Chat widget styles found in CSS"
        else
            fail_test "Chat widget styles missing"
        fi
        
        if grep -q "@media" styles.css; then
            pass_test "Responsive design media queries found"
        else
            warn_test "No responsive design detected"
        fi
    fi
    
    # Test JavaScript
    if [[ -f "index.js" ]]; then
        if grep -q "initChatAssistant" index.js; then
            pass_test "Chat assistant functionality found in JS"
        else
            fail_test "Chat assistant functionality missing"
        fi
    fi
}

# Test 7: Cross-Platform Scripts
test_cross_platform_scripts() {
    echo ""
    echo "${BOLD}Test 7: Cross-Platform Scripts${RESET}"
    echo "----------------------------------------"
    
    # Test setup script
    if [[ -x "./setup-cross-platform.sh" ]]; then
        pass_test "Setup script is executable"
    else
        warn_test "Setup script may need chmod +x"
    fi
    
    # Test deployment script
    if [[ -x "./deploy-universal.sh" ]]; then
        pass_test "Deployment script is executable"
    else
        warn_test "Deployment script may need chmod +x"
    fi
    
    # Test npm scripts
    if command -v npm &> /dev/null; then
        local scripts=("start" "dev" "serve")
        for script in "${scripts[@]}"; do
            if npm run $script --dry-run &>/dev/null; then
                pass_test "npm script available: $script"
            else
                warn_test "npm script may have issues: $script"
            fi
        done
    fi
}

# Test 8: Security Features
test_security_features() {
    echo ""
    echo "${BOLD}Test 8: Security Features${RESET}"
    echo "----------------------------------------"
    
    # Check for security middleware in server.js
    if [[ -f "server.js" ]]; then
        if grep -q "helmet" server.js; then
            pass_test "Helmet security middleware configured"
        else
            warn_test "Helmet security middleware not found"
        fi
        
        if grep -q "rate.*limit" server.js; then
            pass_test "Rate limiting configured"
        else
            warn_test "Rate limiting not configured"
        fi
        
        if grep -q "cors" server.js; then
            pass_test "CORS configuration found"
        else
            warn_test "CORS configuration not found"
        fi
    fi
}

# Test 9: Performance Features
test_performance_features() {
    echo ""
    echo "${BOLD}Test 9: Performance Features${RESET}"
    echo "----------------------------------------"
    
    if [[ -f "server.js" ]]; then
        if grep -q "compression" server.js; then
            pass_test "Response compression enabled"
        else
            warn_test "Response compression not configured"
        fi
    fi
    
    # Check for performance optimizations in CSS
    if [[ -f "styles.css" ]]; then
        if grep -q "transform.*translate3d" styles.css; then
            pass_test "Hardware acceleration CSS found"
        else
            info_test "No explicit hardware acceleration detected"
        fi
    fi
}

# Test 10: Accessibility Features
test_accessibility() {
    echo ""
    echo "${BOLD}Test 10: Accessibility Features${RESET}"
    echo "----------------------------------------"
    
    if [[ -f "index.html" ]]; then
        if grep -q 'alt=' index.html; then
            pass_test "Alt text attributes found for images"
        else
            warn_test "No alt text attributes found"
        fi
        
        if grep -q 'aria-' index.html; then
            pass_test "ARIA attributes found for accessibility"
        else
            warn_test "ARIA attributes not found"
        fi
    fi
    
    if [[ -f "styles.css" ]]; then
        if grep -q "prefers-reduced-motion" styles.css; then
            pass_test "Reduced motion preferences supported"
        else
            warn_test "Reduced motion preferences not implemented"
        fi
    fi
}

# Run all tests
run_all_tests() {
    echo "${BOLD}Starting comprehensive platform compatibility tests...${RESET}"
    echo ""
    
    test_platform_detection
    test_required_files
    test_config_files
    test_dependencies
    test_server_functionality
    test_frontend_assets
    test_cross_platform_scripts
    test_security_features
    test_performance_features
    test_accessibility
}

# Display final results
show_results() {
    echo ""
    echo "${BOLD}🎯 Test Results Summary${RESET}"
    echo "=============================================="
    
    local total_tests=${#TEST_RESULTS[@]}
    local passed_tests=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "PASS:" || echo "0")
    local failed_tests=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "FAIL:" || echo "0")
    local warned_tests=$(printf '%s\n' "${TEST_RESULTS[@]}" | grep -c "WARN:" || echo "0")
    
    echo "Total Tests: $total_tests"
    echo "${GREEN}Passed: $passed_tests${RESET}"
    echo "${RED}Failed: $failed_tests${RESET}"
    echo "${YELLOW}Warnings: $warned_tests${RESET}"
    echo ""
    
    if [[ $failed_tests -eq 0 ]]; then
        echo "${GREEN}${BOLD}🎉 All critical tests passed!${RESET}"
        echo "Your KFSQUARE application is platform-agnostic and ready for deployment."
    elif [[ $failed_tests -lt 3 ]]; then
        echo "${YELLOW}${BOLD}⚠️  Minor issues detected${RESET}"
        echo "Your application should work but may have limited functionality on some platforms."
    else
        echo "${RED}${BOLD}❌ Critical issues found${RESET}"
        echo "Please address the failed tests before deploying."
    fi
    
    if [[ $warned_tests -gt 0 ]]; then
        echo ""
        echo "${YELLOW}Warnings indicate optional features that could improve your application.${RESET}"
    fi
    
    echo ""
    echo "${BOLD}Platform Compatibility Score: $(( (passed_tests * 100) / total_tests ))%${RESET}"
}

# Main execution
main() {
    run_all_tests
    show_results
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
