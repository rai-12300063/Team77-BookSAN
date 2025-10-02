/**
 * Database Data Export to JSON
 * ==========================
 * 
 * This script connects to the MongoDB database and exports:
 * - Users
 * - Courses
 * - Modules
 * - Quizzes
 * - Learning Progress
 * 
 * to a JSON file for review or backup purposes.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const LearningProgress = require('../models/LearningProgress');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/olpt', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('📚 MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

// Convert Mongoose document to plain object
const docToObject = (doc) => {
    if (!doc) return null;
    
    // Convert Mongoose document to plain object
    const obj = doc.toObject ? doc.toObject() : doc;
    
    // Remove verbose fields for cleaner output
    delete obj.__v;
    
    return obj;
};

// Load all data and export to JSON
const exportData = async () => {
    try {
        await connectDB();
        
        console.log('🔍 Fetching data from database...');
        
        // Get users (without passwords)
        const users = await User.find().select('-password');
        
        // Get courses
        const courses = await Course.find();
        
        // Get modules
        const modules = await Module.find();
        
        // Get quizzes
        const quizzes = await Quiz.find();
        
        // Get learning progress
        const progress = await LearningProgress.find();
        
        // Prepare data object
        const data = {
            users: users.map(docToObject),
            courses: courses.map(docToObject),
            modules: modules.map(docToObject),
            quizzes: quizzes.map(docToObject),
            learningProgress: progress.map(docToObject),
            metadata: {
                exportDate: new Date().toISOString(),
                counts: {
                    users: users.length,
                    courses: courses.length,
                    modules: modules.length,
                    quizzes: quizzes.length,
                    progress: progress.length
                }
            }
        };
        
        // Create export directory if it doesn't exist
        const exportDir = path.join(__dirname, 'exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir);
        }
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const filename = `database_export_${timestamp}.json`;
        const filepath = path.join(exportDir, filename);
        
        // Write data to file
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Data exported successfully to: ${filepath}`);
        console.log('\nData summary:');
        console.log(`- Users: ${users.length}`);
        console.log(`- Courses: ${courses.length}`);
        console.log(`- Modules: ${modules.length}`);
        console.log(`- Quizzes: ${quizzes.length}`);
        console.log(`- Learning Progress records: ${progress.length}`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        process.exit(1);
    }
};

// Run the export function
exportData();