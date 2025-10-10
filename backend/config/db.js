/**
 * Database Configuration - Demonstrates SINGLETON PATTERN
 * 
 * DESIGN PATTERNS IMPLEMENTED:
 * 1. SINGLETON PATTERN - MongoDB connection is singleton (implicit via Mongoose)
 * 2. CONNECTION POOLING - Optimized connection management
 * 
 * OOP CONCEPTS DEMONSTRATED:
 * 1. ENCAPSULATION - Connection complexity hidden from application
 * 2. ABSTRACTION - Simple interface for database operations
 */

// config/db.js
const mongoose = require("mongoose");

// Set strictQuery explicitly to suppress the warning
mongoose.set('strictQuery', false);

/**
 * SINGLETON PATTERN IMPLEMENTATION (via Mongoose)
 * Database connection function - ensures single connection instance
 * 
 * SINGLETON: Mongoose internally manages single connection instance
 * ENCAPSULATION: Connection details hidden from application code
 * ERROR HANDLING: Centralized connection error management
 */
const connectDB = async () => {
  try {
    // Optimized connection settings for faster performance
    const options = {
      maxPoolSize: 15, // Increase connection pool for better concurrency
      minPoolSize: 2, // Keep minimum connections open
      serverSelectionTimeoutMS: 3000, // Reduce timeout for faster failure detection
      socketTimeoutMS: 30000, // Reduce socket timeout for faster cleanup
      connectTimeoutMS: 3000, // Faster connection timeout
      heartbeatFrequencyMS: 10000, // More frequent heartbeats
      maxIdleTimeMS: 30000, // Close idle connections faster
      // Performance optimizations
      bufferMaxEntries: 0, // Disable mongoose buffering for immediate errors
      bufferCommands: false, // Disable command buffering
      // Additional MongoDB driver options
      retryWrites: true,
      w: 'majority',
      readPreference: 'secondaryPreferred', // Use secondary for reads when possible
      compressors: ['zlib'], // Enable compression for network efficiency
    };
    
    const connectionStart = Date.now();
    await mongoose.connect(process.env.MONGO_URI, options);
    const connectionTime = Date.now() - connectionStart;
    
    console.log(`✅ MongoDB connected successfully in ${connectionTime}ms with optimized settings`);
    
    // Set up connection event listeners for monitoring
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
