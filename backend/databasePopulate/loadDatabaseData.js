/**
 * Database Data Loader
 * ===================
 * 
 * This script connects to the MongoDB database and loads:
 * - Users
 * - Courses
 * - Modules
 * - Quizzes
 * - Learning Progress
 * 
 * It displays the data in a structured format for review and debugging.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const chalk = require('chalk'); // For colored console output

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
        console.log(chalk.green('📚 MongoDB connected successfully'));
    } catch (err) {
        console.error(chalk.red('❌ MongoDB connection error:'), err.message);
        process.exit(1);
    }
};

// Format object for console output
const formatObject = (obj) => {
    if (!obj) return chalk.red('Not found');
    
    // Convert Mongoose document to plain object
    const plainObj = obj.toObject ? obj.toObject() : obj;
    
    // Remove verbose fields for cleaner output
    delete plainObj.__v;
    
    // Format dates for better readability
    Object.keys(plainObj).forEach(key => {
        if (plainObj[key] instanceof Date) {
            plainObj[key] = plainObj[key].toISOString().split('T')[0];
        }
    });
    
    return plainObj;
};

// Load users
const loadUsers = async () => {
    try {
        const users = await User.find().select('-password');
        
        console.log(chalk.cyan('\n======== 👥 USERS ========'));
        console.log(chalk.cyan(`Total users: ${users.length}\n`));
        
        // Display users by role
        const admins = users.filter(user => user.role === 'admin');
        const students = users.filter(user => user.role === 'student');
        const instructors = users.filter(user => user.role === 'instructor');
        
        console.log(chalk.cyan(`Admins (${admins.length}):`));
        admins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.name} (${admin.email})`);
        });
        
        console.log(chalk.cyan(`\nInstructors (${instructors.length}):`));
        instructors.forEach((instructor, index) => {
            console.log(`  ${index + 1}. ${instructor.name} (${instructor.email})`);
        });
        
        console.log(chalk.cyan(`\nStudents (${students.length}):`));
        students.forEach((student, index) => {
            console.log(`  ${index + 1}. ${student.name} (${student.email})`);
        });
        
        return users;
    } catch (error) {
        console.error(chalk.red('❌ Error loading users:'), error);
        return [];
    }
};

// Load courses
const loadCourses = async () => {
    try {
        const courses = await Course.find();
        
        console.log(chalk.cyan('\n======== 📚 COURSES ========'));
        console.log(chalk.cyan(`Total courses: ${courses.length}\n`));
        
        courses.forEach((course, index) => {
            console.log(chalk.cyan(`Course ${index + 1}: ${course.title}`));
            console.log(`  Description: ${course.description.substring(0, 100)}${course.description.length > 100 ? '...' : ''}`);
            console.log(`  Modules: ${course.modules ? course.modules.length : 0}`);
            console.log(`  Category: ${course.category || 'Not specified'}`);
            console.log(`  Difficulty: ${course.difficulty || 'Not specified'}`);
            console.log(`  ID: ${course._id}\n`);
        });
        
        return courses;
    } catch (error) {
        console.error(chalk.red('❌ Error loading courses:'), error);
        return [];
    }
};

// Load modules
const loadModules = async () => {
    try {
        const modules = await Module.find();
        
        console.log(chalk.cyan('\n======== 📝 MODULES ========'));
        console.log(chalk.cyan(`Total modules: ${modules.length}\n`));
        
        // Group modules by course
        const modulesByCourse = {};
        
        for (const module of modules) {
            const courseId = module.courseId ? module.courseId.toString() : 'unassigned';
            
            if (!modulesByCourse[courseId]) {
                modulesByCourse[courseId] = [];
            }
            
            modulesByCourse[courseId].push(module);
        }
        
        // Display modules by course
        for (const courseId in modulesByCourse) {
            if (courseId === 'unassigned') {
                console.log(chalk.yellow(`\nUnassigned Modules (${modulesByCourse[courseId].length}):`));
            } else {
                // Try to get the course title
                let courseTitle = 'Unknown Course';
                try {
                    const course = await Course.findById(courseId);
                    if (course) {
                        courseTitle = course.title;
                    }
                } catch (err) {
                    // Ignore errors in looking up course
                }
                
                console.log(chalk.cyan(`\nCourse: ${courseTitle} (${modulesByCourse[courseId].length} modules):`));
            }
            
            modulesByCourse[courseId].forEach((module, index) => {
                console.log(`  ${index + 1}. ${module.title}`);
                console.log(`     ID: ${module._id}`);
                console.log(`     Description: ${module.description ? module.description.substring(0, 100) + (module.description.length > 100 ? '...' : '') : 'No description'}`);
                console.log(`     Module #: ${module.moduleNumber || 'Not specified'}`);
                console.log(`     Published: ${module.isPublished ? 'Yes' : 'No'}`);
            });
        }
        
        return modules;
    } catch (error) {
        console.error(chalk.red('❌ Error loading modules:'), error);
        return [];
    }
};

// Load quizzes
const loadQuizzes = async () => {
    try {
        const quizzes = await Quiz.find();
        
        console.log(chalk.cyan('\n======== 📋 QUIZZES ========'));
        console.log(chalk.cyan(`Total quizzes: ${quizzes.length}\n`));
        
        quizzes.forEach((quiz, index) => {
            console.log(chalk.cyan(`Quiz ${index + 1}: ${quiz.title}`));
            console.log(`  Description: ${quiz.description || 'No description'}`);
            console.log(`  Questions: ${quiz.questions ? quiz.questions.length : 0}`);
            console.log(`  Course ID: ${quiz.courseId || 'Not assigned to course'}`);
            console.log(`  ID: ${quiz._id}\n`);
            
            // Display some question details
            if (quiz.questions && quiz.questions.length > 0) {
                console.log(`  Questions Preview (showing ${Math.min(2, quiz.questions.length)} of ${quiz.questions.length}):`);
                
                quiz.questions.slice(0, 2).forEach((q, qIndex) => {
                    console.log(`    ${qIndex + 1}. ${q.question}`);
                    if (q.options && q.options.length > 0) {
                        console.log(`       Options: ${q.options.length} options`);
                    }
                });
                console.log();
            }
        });
        
        return quizzes;
    } catch (error) {
        console.error(chalk.red('❌ Error loading quizzes:'), error);
        return [];
    }
};

// Load learning progress
const loadProgress = async (users) => {
    try {
        const progress = await LearningProgress.find();
        
        console.log(chalk.cyan('\n======== 📊 LEARNING PROGRESS ========'));
        console.log(chalk.cyan(`Total progress records: ${progress.length}\n`));
        
        // Get usernames for better display
        const userMap = {};
        if (users && users.length > 0) {
            users.forEach(user => {
                userMap[user._id.toString()] = user.name;
            });
        }
        
        for (const progressItem of progress) {
            const userName = userMap[progressItem.userId] || progressItem.userId;
            
            // Try to get the course title
            let courseTitle = 'Unknown Course';
            try {
                const course = await Course.findById(progressItem.courseId);
                if (course) {
                    courseTitle = course.title;
                }
            } catch (err) {
                // Ignore errors in looking up course
            }
            
            console.log(chalk.cyan(`\nUser: ${userName}`));
            console.log(`  Course: ${courseTitle}`);
            console.log(`  Enrollment Date: ${new Date(progressItem.enrollmentDate).toISOString().split('T')[0]}`);
            console.log(`  Completion: ${progressItem.completionPercentage || 0}%`);
            console.log(`  Module Progress: ${progressItem.moduleProgress ? progressItem.moduleProgress.length : 0} modules tracked`);
            
            if (progressItem.moduleProgress && progressItem.moduleProgress.length > 0) {
                console.log('  Module Progress Details:');
                
                for (const modProgress of progressItem.moduleProgress) {
                    // Try to get the module title
                    let moduleTitle = 'Unknown Module';
                    try {
                        const module = await Module.findById(modProgress.moduleId);
                        if (module) {
                            moduleTitle = module.title;
                        }
                    } catch (err) {
                        // Ignore errors in looking up module
                    }
                    
                    console.log(`    - ${moduleTitle}: ${modProgress.completed ? 'Completed' : 'In Progress'} (${modProgress.progressPercentage || 0}%)`);
                }
            }
        }
        
        return progress;
    } catch (error) {
        console.error(chalk.red('❌ Error loading learning progress:'), error);
        return [];
    }
};

// Run all data loading functions
const loadAllData = async () => {
    try {
        await connectDB();
        
        console.log(chalk.green.bold('\n🔍 LOADING DATABASE DATA 🔍\n'));
        
        const users = await loadUsers();
        await loadCourses();
        await loadModules();
        await loadQuizzes();
        await loadProgress(users);
        
        console.log(chalk.green.bold('\n✅ DATA LOADING COMPLETED ✅\n'));
        
        mongoose.connection.close();
    } catch (error) {
        console.error(chalk.red('\n❌ ERROR LOADING DATA:'), error);
        process.exit(1);
    }
};

// Run the data loading function
loadAllData();