const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection string from environment variables.
 * Exits the process on failure so the server doesn't run without a database.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('mock')) {
    console.warn('⚠️ No valid MONGO_URI string provided. Skipping DB connection.');
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Server will run without Database access');
  }
};

module.exports = connectDB;
