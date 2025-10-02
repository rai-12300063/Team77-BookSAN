const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const connectDB = require('../config/db');

dotenv.config();

const enrollTestUserInCourse = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    // Find test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Please run createTestUser.js first.');
      return;
    }

    // Find first available course
    const course = await Course.findOne({ isActive: true });
    if (!course) {
      console.log('❌ No active courses found.');
      return;
    }

    // Check if already enrolled using LearningProgress
    const existingProgress = await LearningProgress.findOne({
      userId: testUser._id,
      courseId: course._id
    });

    if (existingProgress) {
      console.log(`✅ Test user is already enrolled in "${course.title}"`);
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
      console.log(`🎓 Course: ${course.title}`);
      return;
    }

    // Create learning progress record (this represents enrollment)
    const progress = await LearningProgress.create({
      userId: testUser._id,
      courseId: course._id
    });

    // Update course enrollment count
    course.enrollmentCount = course.enrollmentCount + 1;
    await course.save();

    console.log(`✅ Test user enrolled in "${course.title}" successfully!`);
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log(`🎓 Course: ${course.title}`);
    console.log('');
    console.log('Now you can log in and see the Drop Course button!');

  } catch (error) {
    console.error('❌ Error enrolling test user:', error);
  } finally {
    mongoose.connection.close();
  }
};

enrollTestUserInCourse();
