require('dotenv').config();
const mongoose = require('mongoose');

console.log('=== MONGODB CONNECTION DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);

if (process.env.MONGODB_URI) {
  // Mask the URI for security
  const maskedUri = process.env.MONGODB_URI.replace(/(mongodb:\/\/[^:]+:)[^@]+@/, '$1***@');
  console.log('MONGODB_URI (masked):', maskedUri);
}

// Test connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 10000,
  maxPoolSize: 5,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority',
  bufferCommands: false,
  retryReads: true,
  heartbeatFrequencyMS: 10000
};

console.log('\n=== ATTEMPTING CONNECTION ===');
mongoose
  .connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
    process.exit(1);
  }); 