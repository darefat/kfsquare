const fs = require('fs');
const path = require('path');

class EnvironmentValidator {
  constructor(environment = process.env.NODE_ENV || 'development') {
    this.environment = environment;
    this.errors = [];
    this.warnings = [];
  }

  // Validate required environment variables
  validateRequired(variables) {
    console.log(`🔍 Validating required variables for ${this.environment}...`);
    
    for (const [key, config] of Object.entries(variables)) {
      const value = process.env[key];
      
      if (!value || value.trim() === '') {
        this.errors.push(`Missing required environment variable: ${key}`);
        continue;
      }
      
      // Type validation
      if (config.type) {
        if (!this.validateType(value, config.type, key)) {
          continue;
        }
      }
      
      // Pattern validation
      if (config.pattern && !config.pattern.test(value)) {
        this.errors.push(`Invalid format for ${key}: ${config.description || 'pattern mismatch'}`);
        continue;
      }
      
      // Length validation
      if (config.minLength && value.length < config.minLength) {
        this.errors.push(`${key} must be at least ${config.minLength} characters long`);
        continue;
      }
      
      // Custom validation
      if (config.validate && !config.validate(value)) {
        this.errors.push(`${key} failed custom validation: ${config.description || 'invalid value'}`);
        continue;
      }
      
      console.log(`✅ ${key}: ${this.maskSensitive(key, value)}`);
    }
  }

  // Validate type
  validateType(value, type, key) {
    switch (type) {
      case 'number':
        if (isNaN(Number(value))) {
          this.errors.push(`${key} must be a valid number`);
          return false;
        }
        break;
      case 'boolean':
        if (!['true', 'false', '0', '1'].includes(value.toLowerCase())) {
          this.errors.push(`${key} must be a boolean (true/false)`);
          return false;
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch (e) {
          this.errors.push(`${key} must be a valid URL`);
          return false;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.errors.push(`${key} must be a valid email address`);
          return false;
        }
        break;
    }
    return true;
  }

  // Mask sensitive values for logging
  maskSensitive(key, value) {
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'api'];
    const isSensitive = sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
    
    if (isSensitive && value.length > 8) {
      return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
    }
    
    return value;
  }

  // Validate MongoDB configuration
  validateMongoDB() {
    console.log('🔍 Validating MongoDB configuration...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      this.errors.push('MONGODB_URI is required');
      return;
    }
    
    // Check URI format
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      this.errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
      return;
    }
    
    // Production checks
    if (this.environment === 'production') {
      if (mongoUri.includes('localhost') && process.env.ALLOW_LOCAL_DB !== 'true') {
        this.errors.push('Production should not use localhost MongoDB. Set ALLOW_LOCAL_DB=true to override.');
        return;
      }
      
      // Check for authentication in production
      if (!mongoUri.includes('@') && !mongoUri.includes('localhost')) {
        this.warnings.push('MongoDB URI appears to be missing authentication credentials');
      }
    }
    
    console.log(`✅ MONGODB_URI: ${this.maskSensitive('MONGODB_URI', mongoUri)}`);
  }

  // Validate Mailgun configuration
  validateMailgun() {
    console.log('🔍 Validating Mailgun configuration...');
    
    const required = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'RECIPIENT_EMAIL'];
    const config = {};
    
    for (const key of required) {
      const value = process.env[key];
      if (!value) {
        this.errors.push(`${key} is required for email functionality`);
        continue;
      }
      config[key] = value;
    }
    
    // Validate domain format
    if (config.MAILGUN_DOMAIN) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/;
      if (!domainRegex.test(config.MAILGUN_DOMAIN)) {
        this.errors.push('MAILGUN_DOMAIN must be a valid domain name');
      }
    }
    
    // Validate email format
    if (config.RECIPIENT_EMAIL) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.RECIPIENT_EMAIL)) {
        this.errors.push('RECIPIENT_EMAIL must be a valid email address');
      }
    }
    
    // Check for test values
    const testPatterns = [
      'your_mailgun_api_key_here',
      'example.com',
      'test@example.com'
    ];
    
    for (const [key, value] of Object.entries(config)) {
      for (const pattern of testPatterns) {
        if (value.includes(pattern)) {
          this.warnings.push(`${key} appears to contain a placeholder value`);
        }
      }
      console.log(`✅ ${key}: ${this.maskSensitive(key, value)}`);
    }
  }

  // Validate security configuration
  validateSecurity() {
    console.log('🔍 Validating security configuration...');
    
    const secrets = ['SESSION_SECRET', 'JWT_SECRET'];
    
    for (const secret of secrets) {
      const value = process.env[secret];
      
      if (!value) {
        this.errors.push(`${secret} is required`);
        continue;
      }
      
      // Check length
      if (value.length < 32) {
        this.errors.push(`${secret} must be at least 32 characters long`);
        continue;
      }
      
      if (value.length < 64) {
        this.warnings.push(`${secret} should be at least 64 characters for better security`);
      }
      
      // Check for weak patterns
      const weakPatterns = [
        'your_secure_session_secret_here',
        'your_secure_jwt_secret_here',
        'secret',
        'password',
        '12345'
      ];
      
      for (const pattern of weakPatterns) {
        if (value.toLowerCase().includes(pattern.toLowerCase())) {
          this.errors.push(`${secret} contains a weak pattern: ${pattern}`);
          break;
        }
      }
      
      console.log(`✅ ${secret}: ${this.maskSensitive(secret, value)} (${value.length} chars)`);
    }
    
    // Validate NODE_ENV matches expected environment
    if (process.env.NODE_ENV !== this.environment) {
      this.errors.push(`NODE_ENV (${process.env.NODE_ENV}) doesn't match expected environment (${this.environment})`);
    }
  }

  // Run all validations
  async validate() {
    console.log(`🚀 Starting environment validation for: ${this.environment}`);
    console.log('='.repeat(60));
    
    // Define required variables by environment
    const requiredVars = {
      // Core application
      NODE_ENV: { 
        type: 'string',
        validate: (val) => ['development', 'staging', 'production'].includes(val)
      },
      PORT: { 
        type: 'number',
        validate: (val) => Number(val) > 0 && Number(val) < 65536
      },
      
      // MongoDB
      MONGODB_URI: { 
        type: 'url',
        description: 'Valid MongoDB connection string'
      },
      MONGODB_DB: { 
        type: 'string',
        minLength: 1
      },
      
      // Mailgun
      MAILGUN_API_KEY: { 
        type: 'string',
        minLength: 32,
        description: 'Valid Mailgun API key'
      },
      MAILGUN_DOMAIN: { 
        type: 'string',
        pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/,
        description: 'Valid domain name'
      },
      RECIPIENT_EMAIL: { 
        type: 'email'
      },
      
      // Security
      SESSION_SECRET: { 
        type: 'string',
        minLength: 32,
        description: 'Strong session secret'
      },
      JWT_SECRET: { 
        type: 'string',
        minLength: 32,
        description: 'Strong JWT secret'
      }
    };
    
    // Run validations
    this.validateRequired(requiredVars);
    this.validateMongoDB();
    this.validateMailgun();
    this.validateSecurity();
    
    // Print results
    console.log('='.repeat(60));
    
    if (this.errors.length > 0) {
      console.log('❌ VALIDATION FAILED');
      console.log('');
      console.log('Errors:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('');
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.errors.length === 0) {
      console.log('✅ VALIDATION PASSED');
      console.log(`Environment ${this.environment} is ready for deployment!`);
    }
    
    console.log('');
    return this.errors.length === 0;
  }
}

// CLI usage
if (require.main === module) {
  const environment = process.argv[2] || process.env.NODE_ENV || 'development';
  const envFile = path.join(process.cwd(), `.env.${environment}`);
  
  // Load environment file if it exists
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
  } else {
    require('dotenv').config();
  }
  
  const validator = new EnvironmentValidator(environment);
  
  validator.validate().then(isValid => {
    process.exit(isValid ? 0 : 1);
  }).catch(error => {
    console.error('Validation error:', error);
    process.exit(1);
  });
}

module.exports = EnvironmentValidator;