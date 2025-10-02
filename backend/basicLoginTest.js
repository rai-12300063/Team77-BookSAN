// basicLoginTest.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📚 MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Verify login functionality
const verifyLogin = async (email, password) => {
  try {
    // Get a reference to the users collection (bypassing Mongoose)
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Find user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return false;
    }
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (passwordMatch) {
      console.log(`✅ Login successful for ${email} (${user.name})`);
      return true;
    } else {
      console.log(`❌ Password does not match for ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error verifying login for ${email}:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  // Connect to database
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    console.log('\n🔍 VERIFYING LOGIN CREDENTIALS FOR ALL USERS');
    
    // Define users
    const users = [
      { email: 'admin@example.com', password: 'Admin123!' },
      { email: 'student@example.com', password: 'Student123!' },
      { email: 'instructor@example.com', password: 'Instructor123!' },
      { email: 'test@example.com', password: 'Test123!' }
    ];
    
    // Verify login for each user
    let successCount = 0;
    for (const user of users) {
      const success = await verifyLogin(user.email, user.password);
      if (success) successCount++;
    }
    
    // Print summary
    console.log('\n📊 SUMMARY');
    console.log(`Total tests: ${users.length}`);
    console.log(`Successful logins: ${successCount}`);
    console.log(`Failed logins: ${users.length - successCount}`);
    
    if (successCount === users.length) {
      console.log('✅ All login tests passed! Authentication is working properly.');
    } else {
      console.log('❌ Some login tests failed. Authentication needs attention.');
    }
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the main function
main();