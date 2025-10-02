// testConnection.js
require('dotenv').config();
const mongoose = require('mongoose');

console.log('MongoDB URI:', process.env.MONGO_URI);

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test connection by listing some collections
    const collections = await mongoose.connection.db.collections();
    console.log('Collections in database:');
    for (let collection of collections) {
      console.log(`- ${collection.collectionName}`);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (error.name === 'MongoNetworkError') {
      console.log('\nPossible causes:');
      console.log('1. Network connectivity issue');
      console.log('2. MongoDB server is not running');
      console.log('3. IP address is not whitelisted in MongoDB Atlas');
    } else if (error.name === 'MongoServerSelectionError') {
      console.log('\nPossible causes:');
      console.log('1. Connection string is incorrect');
      console.log('2. DNS resolution issue');
      console.log('3. MongoDB Atlas cluster is down');
    } else if (error.name === 'MongoAuthenticationError') {
      console.log('\nPossible causes:');
      console.log('1. Incorrect username or password in connection string');
      console.log('2. Database user does not have access to this database');
    }
    process.exit(1);
  }
};

connectDB();