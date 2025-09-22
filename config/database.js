const mongoose = require('mongoose');
const fs = require('fs');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  // Helper: read secret from env or file (e.g., Docker/K8s secret)
  readSecret(envKey, fileEnvKey) {
    const value = process.env[envKey];
    const filePath = process.env[fileEnvKey];
    if (value) return value;
    if (filePath) {
      try {
        return fs.readFileSync(filePath, 'utf8').trim();
      } catch (e) {
        console.warn(`⚠️  Could not read secret file for ${envKey}:`, e.message);
      }
    }
    return '';
  }

  // Build a safe connection configuration without embedding credentials in logs
  buildConnectionConfig() {
    const isProduction = process.env.NODE_ENV === 'production';

    // Prefer full URI if provided
    const explicitUri = process.env.MONGODB_URI || process.env.DATABASE_URL || '';

    // Separate credential/env inputs
    const useSrv = (process.env.MONGODB_USE_SRV || '').toLowerCase() === 'true' || explicitUri.startsWith('mongodb+srv://');
    const scheme = useSrv ? 'mongodb+srv' : 'mongodb';

    const hosts = (process.env.MONGODB_HOSTS || 'localhost:27017')
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const dbName = process.env.MONGODB_DB || process.env.DB_NAME || 'kfsquare';
    const user = process.env.MONGODB_USER || '';
    const password = this.readSecret('MONGODB_PASSWORD', 'MONGODB_PASSWORD_FILE');
    const authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';

    // Additional URI options
    const defaultParams = useSrv ? 'retryWrites=true&w=majority' : '';
    const uriParams = process.env.MONGODB_OPTIONS || defaultParams;

    // TLS/SSL
    const tls = (process.env.MONGODB_TLS || '').toLowerCase() === 'true' || useSrv;

    // Build base URI (without credentials)
    let baseUri = explicitUri;
    if (!baseUri) {
      const hostStr = hosts.join(',');
      const paramsPart = uriParams ? `?${uriParams}` : '';
      baseUri = `${scheme}://${hostStr}/${dbName}${paramsPart}`;
    }

    // Safety checks for production
    if (isProduction) {
      const allowLocal = (process.env.ALLOW_LOCAL_DB || '').toLowerCase() === 'true';
      const isLocal = /localhost|127\.0\.0\.1/.test(baseUri) || hosts.some(h => /localhost|127\.0\.0\.1/.test(h));

      if (isLocal && !allowLocal) {
        throw new Error('Refusing to connect to local MongoDB in production. Set ALLOW_LOCAL_DB=true to override.');
      }
    }

    // Prepare Mongoose options
    const connectOptions = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL || '10', 10),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000', 10),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000', 10),
      dbName,
    };

    if (user && password) {
      connectOptions.auth = { username: user, password };
      connectOptions.authSource = authSource;
    }

    if (tls) {
      connectOptions.tls = true;
      connectOptions.tlsAllowInvalidCertificates = false;
      // Optional: CA cert support
      const caPath = process.env.MONGODB_CA_FILE;
      if (caPath) {
        try {
          connectOptions.tlsCAFile = caPath;
        } catch (e) {
          console.warn('⚠️  Failed to set tlsCAFile:', e.message);
        }
      }
    }

    return { baseUri, options: connectOptions };
  }

  sanitizeForLog(uri) {
    try {
      const u = new URL(uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'));
      return `${u.protocol.replace('http:', 'mongodb:').replace('https:', 'mongodb+srv:')}//${u.host}${u.pathname}`;
    } catch (_) {
      return uri.replace(/:\/\/.*@/, '://***@');
    }
  }

  async connect() {
    if (this.isConnected) {
      console.log('📀 MongoDB already connected');
      return this.connection;
    }

    try {
      const { baseUri, options } = this.buildConnectionConfig();

      console.log('🔗 Attempting to connect to MongoDB...');
      console.log(`📡 Target: ${this.sanitizeForLog(baseUri)}`);

      const connection = await mongoose.connect(baseUri, options);

      this.connection = connection;
      this.isConnected = true;

      const db = connection.connection.db;
      const hostInfo = `${connection.connection.host}:${connection.connection.port || ''}`;
      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${db.databaseName}`);
      console.log(`🌍 Host: ${hostInfo}`);

      // Handle connection events
      mongoose.connection.on('connected', () => {
        console.log('📀 Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err.message);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📴 Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        this.disconnect();
      });

      return connection;

    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error.message);
      this.isConnected = false;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Running without database in development mode');
        return null;
      }
      
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
        this.isConnected = false;
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
      }
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return this.isConnected;
  }
}

module.exports = new DatabaseConnection();
