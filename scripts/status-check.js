#!/usr/bin/env node

/**
 * KFSQUARE Production Status Checker
 * Verifies that all production components are properly configured and working
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = (message) => console.log(`${colors.blue}[CHECK]${colors.reset} ${message}`);
const success = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const warning = (message) => console.log(`${colors.yellow}⚠️ ${message}${colors.reset}`);
const error = (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`);

let issues = [];
let warnings = [];

// Check file exists
const checkFile = (filePath, name) => {
    if (fs.existsSync(filePath)) {
        success(`${name} exists`);
        return true;
    } else {
        error(`${name} missing: ${filePath}`);
        issues.push(`Missing ${name}`);
        return false;
    }
};

// Check directory exists
const checkDirectory = (dirPath, name) => {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        success(`${name} directory exists`);
        return true;
    } else {
        error(`${name} directory missing: ${dirPath}`);
        issues.push(`Missing ${name} directory`);
        return false;
    }
};

// Check command exists
const checkCommand = (command, name) => {
    try {
        execSync(`command -v ${command}`, { stdio: 'ignore' });
        success(`${name} is installed`);
        return true;
    } catch {
        warning(`${name} not found (optional)`);
        warnings.push(`${name} not installed`);
        return false;
    }
};

// Check Node.js version
const checkNodeVersion = () => {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion >= 16) {
        success(`Node.js version: ${version} (✅ >= 16)`);
        return true;
    } else {
        error(`Node.js version: ${version} (❌ requires >= 16)`);
        issues.push('Node.js version too old');
        return false;
    }
};

// Check package.json dependencies
const checkDependencies = () => {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const requiredDeps = [
            'express',
            'mongoose',
            'socket.io',
            'winston',
            'express-rate-limit',
            'helmet',
            'express-validator'
        ];
        
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const missing = requiredDeps.filter(dep => !dependencies[dep]);
        
        if (missing.length === 0) {
            success('All required dependencies are listed');
            return true;
        } else {
            error(`Missing dependencies: ${missing.join(', ')}`);
            issues.push('Missing required dependencies');
            return false;
        }
    } catch (err) {
        error(`Error checking dependencies: ${err.message}`);
        issues.push('Cannot read package.json');
        return false;
    }
};

// Check environment configuration
const checkEnvironment = () => {
    const envExists = checkFile('.env', 'Environment file (.env)');
    const envExampleExists = checkFile('.env.example', 'Environment template (.env.example)');
    const envProductionExists = checkFile('.env.production', 'Production environment template');
    
    if (envExists) {
        try {
            const envContent = fs.readFileSync('.env', 'utf8');
            const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'SESSION_SECRET', 'JWT_SECRET'];
            const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
            
            if (missingVars.length === 0) {
                success('All required environment variables are defined');
            } else {
                warning(`Missing environment variables: ${missingVars.join(', ')}`);
                warnings.push('Some environment variables are missing');
            }
        } catch (err) {
            warning('Cannot read .env file');
        }
    }
    
    return envExists && (envExampleExists || envProductionExists);
};

// Main status check
const checkProductionStatus = () => {
    console.log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                KFSQUARE PRODUCTION STATUS CHECK             ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    log('Checking Node.js environment...');
    checkNodeVersion();
    
    log('Checking system dependencies...');
    checkCommand('npm', 'npm');
    checkCommand('mongosh', 'MongoDB Shell');
    checkCommand('mongo', 'MongoDB Legacy Shell');
    checkCommand('pm2', 'PM2 Process Manager');
    checkCommand('docker', 'Docker');
    checkCommand('curl', 'cURL');
    
    log('Checking project files...');
    checkFile('server.js', 'Main server file');
    checkFile('package.json', 'Package configuration');
    checkFile('ecosystem.config.js', 'PM2 configuration');
    checkFile('Dockerfile', 'Docker configuration');
    checkFile('docker-compose.yml', 'Docker Compose configuration');
    
    log('Checking production configuration files...');
    checkFile('config/logger.js', 'Logger configuration');
    checkFile('config/security.js', 'Security configuration');
    checkFile('config/errorHandler.js', 'Error handler configuration');
    checkFile('PRODUCTION.md', 'Production documentation');
    
    log('Checking directories...');
    checkDirectory('logs', 'Logs');
    checkDirectory('uploads', 'Uploads');
    checkDirectory('backups', 'Backups');
    checkDirectory('config', 'Configuration');
    checkDirectory('scripts', 'Scripts');
    checkDirectory('docker', 'Docker configs');
    
    log('Checking scripts...');
    checkFile('scripts/init-production.js', 'Production initialization script');
    checkFile('scripts/health-check.sh', 'Health check script');
    checkFile('scripts/start.sh', 'Startup script');
    checkFile('scripts/backup.sh', 'Backup script');
    
    log('Checking dependencies...');
    checkDependencies();
    
    log('Checking environment configuration...');
    checkEnvironment();
    
    // Summary
    console.log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                      STATUS SUMMARY                         ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    if (issues.length === 0 && warnings.length === 0) {
        console.log(`${colors.bright}${colors.green}
🎉 PRODUCTION READY! 
All systems are properly configured and ready for deployment.
${colors.reset}`);
    } else {
        if (issues.length > 0) {
            console.log(`${colors.red}
❌ CRITICAL ISSUES (${issues.length}):${colors.reset}`);
            issues.forEach(issue => console.log(`   • ${issue}`));
        }
        
        if (warnings.length > 0) {
            console.log(`${colors.yellow}
⚠️ WARNINGS (${warnings.length}):${colors.reset}`);
            warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        if (issues.length === 0) {
            console.log(`${colors.green}
✅ PRODUCTION READY WITH WARNINGS
Critical components are configured. Address warnings for optimal setup.
${colors.reset}`);
        } else {
            console.log(`${colors.red}
❌ NOT PRODUCTION READY
Please resolve critical issues before deploying.
${colors.reset}`);
        }
    }
    
    console.log(`${colors.blue}
Next Steps:
${colors.reset}1. Review and update .env configuration
2. Test database connectivity: mongosh $MONGODB_URI
3. Start production server: npm run pm2:start
4. Check health: curl http://localhost:3000/health
5. Monitor logs: npm run logs

For detailed deployment instructions, see PRODUCTION.md
`);
    
    // Return exit code
    process.exit(issues.length > 0 ? 1 : 0);
};

// Run the check
checkProductionStatus();
