const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    if (this.isConnected) {
      console.log('📀 MongoDB already connected');
      return this.connection;
    }

    try {
      const mongoURI = process.env.MONGODB_URI || 
                      process.env.DATABASE_URL || 
                      'mongodb://localhost:27017/kfsquare';

      console.log('🔗 Attempting to connect to MongoDB...');
      
      const connection = await mongoose.connect(mongoURI, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });

      this.connection = connection;
      this.isConnected = true;

      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${connection.connection.db.databaseName}`);
      console.log(`🌍 Host: ${connection.connection.host}:${connection.connection.port}`);

      // Handle connection events
      mongoose.connection.on('connected', () => {
        console.log('📀 Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
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
      
      // In development, we can continue without DB
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
