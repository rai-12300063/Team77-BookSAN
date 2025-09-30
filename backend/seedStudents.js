const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const createStudents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing student data (optional - uncomment if you want to start fresh)
    // await User.deleteMany({ role: 'student' });
    // console.log('Cleared existing student data');

    const students = [];
    const saltRounds = 10;

    // Create 30 students
    for (let i = 1; i <= 30; i++) {
      const hashedPassword = await bcrypt.hash('password1234', saltRounds);

      const student = {
        name: `Student ${i}`,
        email: `student${i}@gmail.com`,
        password: hashedPassword,
        role: 'student',
        university: 'Queensland University of Technology',
        address: 'Brisbane, Australia',
        learningGoals: ['Web Development', 'Programming Skills', 'Technology'],
        skillTags: ['JavaScript', 'HTML', 'CSS'],
        learningPreferences: {
          preferredLearningTime: 'any',
          learningPace: 'medium',
          notificationsEnabled: true
        },
        joinDate: new Date()
      };

      students.push(student);
    }

    // Insert all students
    const createdStudents = await User.insertMany(students);
    console.log(`✅ Successfully created ${createdStudents.length} students`);

    // Display created students
    console.log('\n📋 Created Students:');
    createdStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
    });

    console.log('\n🔑 Login Credentials:');
    console.log('Email: student1@gmail.com to student30@gmail.com');
    console.log('Password: password1234 (for all students)');

    console.log('\n✨ Students seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding students:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seeding
console.log('🚀 Starting student database seeding...');
createStudents();