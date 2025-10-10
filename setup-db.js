const mongoose = require('mongoose');
require('dotenv').config();

async function setupDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Create indexes for the contacts collection
    await db.collection('contacts').createIndex({ email: 1, createdAt: -1 });
    await db.collection('contacts').createIndex({ status: 1 });
    await db.collection('contacts').createIndex({ createdAt: -1 });
    await db.collection('contacts').createIndex({ serviceInterest: 1 });
    
    console.log('✅ Database indexes created successfully');
    
    // Create a test document to verify everything works
    const testContact = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message to verify database functionality',
      serviceInterest: 'other',
      source: 'database_setup_test',
      status: 'new',
      createdAt: new Date()
    };
    
    await db.collection('contacts').insertOne(testContact);
    console.log('✅ Test document created successfully');
    
    // Clean up test document
    await db.collection('contacts').deleteOne({ email: 'test@example.com' });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupDatabase();