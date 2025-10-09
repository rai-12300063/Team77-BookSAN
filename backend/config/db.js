// config/db.js
const mongoose = require("mongoose");

// Set strictQuery explicitly to suppress the warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    // Optimized connection settings for better performance
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("MongoDB connected successfully with optimized settings");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
