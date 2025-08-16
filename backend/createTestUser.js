const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // Will be hashed by the User model
      role: 'student',
      learningPreferences: {
        preferredCategories: ['Programming', 'Data Science'],
        difficultyLevel: 'Intermediate',
        studyTimePerDay: 60
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('');
    console.log('You can now use these credentials to log in to the application.');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUser();
