// MongoDB Initialization Script for KFSQUARE
// This script sets up the initial database configuration

// Switch to the kfsquare database
db = db.getSiblingDB('kfsquare');

// Create application user
db.createUser({
  user: 'kfsquare_user',
  pwd: 'KFSquareAppUser2025!',
  roles: [
    {
      role: 'readWrite',
      db: 'kfsquare'
    }
  ]
});

// Create collections with initial indexes
db.createCollection('messages');
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('logs');

// Create indexes for better performance
db.messages.createIndex({ "timestamp": -1 });
db.messages.createIndex({ "userId": 1, "timestamp": -1 });
db.users.createIndex({ "email": 1 }, { unique: true });
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 });
db.logs.createIndex({ "timestamp": -1 });
db.logs.createIndex({ "level": 1, "timestamp": -1 });

// Insert initial data if needed
db.messages.insertOne({
  _id: ObjectId(),
  message: "Welcome to KFSQUARE!",
  user: "System",
  timestamp: new Date(),
  type: "system"
});

print("KFSQUARE database initialized successfully");
print("Created user: kfsquare_user");
print("Created collections: messages, users, sessions, logs");
print("Created performance indexes");
print("Database setup complete!");
