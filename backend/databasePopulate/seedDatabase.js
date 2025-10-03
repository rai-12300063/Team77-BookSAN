/**
 * Consolidated Database Seed Script
 * ================================
 * 
 * This script combines the functionality of:
 * - seedQUTCurriculum.js
 * - seedQuizzes.js
 * - seedStudents.js
 * 
 * It provides a single entry point to populate the entire database
 * with courses, modules, quizzes, and test users.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const Course = require('../models/Course');
const Module = require('../models/Module');
const User = require('../models/User');
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

// Sample QUT curriculum data
const qutCourses = [
    {
        title: "IFN636 - Advanced Design Patterns",
        description: "Learn about advanced software design patterns and architectures that enhance code quality and maintainability.",
        image: "https://example.com/ifn636.jpg",
        modules: [
            {
                title: "Core Design Patterns",
                description: "Fundamental design patterns every software engineer should know",
                content: `
                    <h1>Core Design Patterns</h1>
                    <p>Design patterns are typical solutions to common problems in software design. 
                    Each pattern is like a blueprint that you can customize to solve a particular design problem in your code.</p>
                    
                    <h2>Creational Patterns</h2>
                    <ul>
                        <li><strong>Singleton</strong>: Ensures a class has only one instance</li>
                        <li><strong>Factory Method</strong>: Creates objects without specifying the exact class</li>
                        <li><strong>Abstract Factory</strong>: Creates families of related objects</li>
                        <li><strong>Builder</strong>: Constructs complex objects step by step</li>
                        <li><strong>Prototype</strong>: Creates new objects by copying existing ones</li>
                    </ul>
                    
                    <h2>Structural Patterns</h2>
                    <ul>
                        <li><strong>Adapter</strong>: Makes incompatible interfaces compatible</li>
                        <li><strong>Bridge</strong>: Separates abstraction from implementation</li>
                        <li><strong>Composite</strong>: Composes objects into tree structures</li>
                        <li><strong>Decorator</strong>: Adds responsibilities to objects dynamically</li>
                        <li><strong>Facade</strong>: Provides a simplified interface to a complex system</li>
                    </ul>
                    
                    <h2>Behavioral Patterns</h2>
                    <ul>
                        <li><strong>Observer</strong>: Defines a dependency between objects</li>
                        <li><strong>Strategy</strong>: Defines a family of interchangeable algorithms</li>
                        <li><strong>Command</strong>: Turns a request into a stand-alone object</li>
                        <li><strong>State</strong>: Allows object behavior to change based on state</li>
                        <li><strong>Visitor</strong>: Separates algorithms from the objects they operate on</li>
                    </ul>
                `
            },
            {
                title: "Advanced Architectural Patterns",
                description: "Higher-level patterns for organizing application architecture",
                content: `
                    <h1>Advanced Architectural Patterns</h1>
                    <p>Architectural patterns address the higher-level structure of code, defining the overall shape and structure of applications.</p>
                    
                    <h2>Model-View-Controller (MVC)</h2>
                    <p>Separates application into three components:</p>
                    <ul>
                        <li><strong>Model</strong>: Data and business logic</li>
                        <li><strong>View</strong>: User interface</li>
                        <li><strong>Controller</strong>: Handles user input and updates Model/View</li>
                    </ul>
                    
                    <h2>Model-View-ViewModel (MVVM)</h2>
                    <p>An evolution of MVC designed for modern UI frameworks:</p>
                    <ul>
                        <li><strong>Model</strong>: Data and business logic</li>
                        <li><strong>View</strong>: The UI (HTML/CSS/components)</li>
                        <li><strong>ViewModel</strong>: Converts Model data for View and handles user interactions</li>
                    </ul>
                    
                    <h2>Microservices</h2>
                    <p>An architectural style that structures an application as a collection of small, loosely coupled services.</p>
                    <ul>
                        <li>Each service runs in its own process</li>
                        <li>Services communicate via lightweight protocols (HTTP/gRPC)</li>
                        <li>Each service can be independently deployed and scaled</li>
                    </ul>
                    
                    <h2>Event-Driven Architecture</h2>
                    <p>A design paradigm built around the production, detection, and reaction to events.</p>
                    <ul>
                        <li>Publishers emit events without knowledge of subscribers</li>
                        <li>Subscribers listen for specific events</li>
                        <li>Promotes loose coupling between components</li>
                    </ul>
                `
            }
        ]
    },
    {
        title: "IFN645 - Enterprise Systems",
        description: "Study modern enterprise systems, their architecture, implementation and management.",
        image: "https://example.com/ifn645.jpg",
        modules: [
            {
                title: "Enterprise Architecture",
                description: "Introduction to enterprise architecture frameworks",
                content: `
                    <h1>Enterprise Architecture</h1>
                    <p>Enterprise Architecture (EA) is the practice of analyzing, designing, planning, and implementing enterprise analysis to successfully execute business strategies.</p>
                    
                    <h2>Enterprise Architecture Frameworks</h2>
                    <ul>
                        <li><strong>TOGAF (The Open Group Architecture Framework)</strong>: One of the most popular frameworks</li>
                        <li><strong>Zachman Framework</strong>: Focuses on classifying architectural artifacts</li>
                        <li><strong>Federal Enterprise Architecture (FEA)</strong>: Used by US government agencies</li>
                        <li><strong>Gartner EA Framework</strong>: Business-centered approach</li>
                    </ul>
                    
                    <h2>Key Components of Enterprise Architecture</h2>
                    <ul>
                        <li><strong>Business Architecture</strong>: Business strategy, governance, organization, and processes</li>
                        <li><strong>Data Architecture</strong>: Structure of an organization's logical and physical data assets</li>
                        <li><strong>Application Architecture</strong>: Blueprint for individual application systems</li>
                        <li><strong>Technology Architecture</strong>: Hardware, software, and network infrastructure</li>
                    </ul>
                    
                    <h2>Enterprise Architecture Lifecycle</h2>
                    <ol>
                        <li><strong>Architecture Vision</strong>: Define scope, constraints, and expectations</li>
                        <li><strong>Business Architecture</strong>: Define business strategy and goals</li>
                        <li><strong>Information Systems Architecture</strong>: Develop target data and application architectures</li>
                        <li><strong>Technology Architecture</strong>: Develop target technology architecture</li>
                        <li><strong>Opportunities and Solutions</strong>: Generate an implementation and migration strategy</li>
                        <li><strong>Migration Planning</strong>: Prioritize projects and create roadmap</li>
                        <li><strong>Implementation Governance</strong>: Provide oversight for implementation</li>
                        <li><strong>Architecture Change Management</strong>: Manage ongoing changes</li>
                    </ol>
                `
            }
        ]
    }
];

// Sample quiz data
const quizzes = [
    {
        title: "Design Patterns Quiz",
        description: "Test your knowledge of software design patterns",
        courseId: null, // Will be populated during seeding
        questions: [
            {
                question: "Which pattern ensures a class has only one instance?",
                options: ["Factory Method", "Singleton", "Observer", "Decorator"],
                correctAnswer: "Singleton",
                points: 10
            },
            {
                question: "Which pattern adds new functionality to objects without modifying their structure?",
                options: ["Adapter", "Bridge", "Decorator", "Proxy"],
                correctAnswer: "Decorator",
                points: 10
            },
            {
                question: "Which pattern defines a family of interchangeable algorithms?",
                options: ["Command", "Strategy", "Template Method", "Observer"],
                correctAnswer: "Strategy",
                points: 10
            }
        ]
    },
    {
        title: "Enterprise Architecture Quiz",
        description: "Test your knowledge of enterprise architecture frameworks",
        courseId: null, // Will be populated during seeding
        questions: [
            {
                question: "Which framework is developed by The Open Group?",
                options: ["Zachman", "TOGAF", "Gartner", "FEA"],
                correctAnswer: "TOGAF",
                points: 10
            },
            {
                question: "Which of the following is NOT a layer in the standard Enterprise Architecture?",
                options: ["Business Architecture", "Data Architecture", "Network Architecture", "Application Architecture"],
                correctAnswer: "Network Architecture",
                points: 10
            }
        ]
    }
];

// Sample user data
const users = [
    {
        name: "Admin User",
        email: "admin@example.com",
        password: "Admin123!",
        role: "admin"
    },
    {
        name: "Student User",
        email: "student@example.com",
        password: "Student123!",
        role: "student"
    },
    {
        name: "Instructor User",
        email: "instructor@example.com",
        password: "Instructor123!",
        role: "instructor"
    }
];

// Seed courses and modules
const seedCourses = async () => {
    try {
        // Clear existing courses and modules
        await Course.deleteMany({});
        await Module.deleteMany({});
        
        console.log('📚 Seeding courses and modules...');
        
        // Create admin user for createdBy reference
        const adminUser = await User.findOne({ role: 'admin' });
        let adminId = null;
        
        if (adminUser) {
            adminId = adminUser._id;
        } else {
            // Create a temporary admin user if none exists
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);
            
            const newAdmin = await User.create({
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            adminId = newAdmin._id;
        }
        
        for (const courseData of qutCourses) {
            // Create course first
            const newCourse = await Course.create({
                title: courseData.title,
                description: courseData.description,
                image: courseData.image,
                modules: [],
                category: 'Programming',
                difficulty: 'Intermediate',
                instructor: {
                    id: adminId,
                    name: 'Admin User',
                    email: 'admin@test.com'
                },
                duration: {
                    weeks: 12,
                    hoursPerWeek: 5
                },
                estimatedCompletionTime: 60, // hours
                prerequisites: ['Basic programming knowledge'],
                learningObjectives: ['Learn software design patterns', 'Apply patterns to real projects']
            });
            
            // Create modules with reference to the course
            let moduleNumber = 1;
            for (const moduleData of courseData.modules) {
                const newModule = await Module.create({
                    title: moduleData.title,
                    description: moduleData.description,
                    content: moduleData.content,
                    courseId: newCourse._id,
                    createdBy: adminId,
                    difficulty: 'intermediate',
                    estimatedDuration: 60, // minutes
                    moduleNumber: moduleNumber++,
                    isPublished: true
                });
                
                // Add module to course's modules array
                newCourse.modules.push(newModule._id);
            }
            
            // Save updated course with module references
            await newCourse.save();
        }
        
        console.log('✅ Courses and modules seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding courses:', error);
    }
};

// Seed quizzes
const seedQuizzes = async () => {
    try {
        // Clear existing quizzes
        await Quiz.deleteMany({});
        
        console.log('📝 Seeding quizzes...');
        
        // Get all courses to associate quizzes
        const courses = await Course.find();
        
        if (courses.length === 0) {
            console.error('❌ No courses found. Please seed courses first.');
            return;
        }
        
        // Match quizzes to courses by title
        for (const quiz of quizzes) {
            const course = courses.find(c => {
                const courseName = c.title.toLowerCase();
                const quizName = quiz.title.toLowerCase();
                
                return courseName.includes('ifn636') && quizName.includes('design patterns') ||
                       courseName.includes('ifn645') && quizName.includes('enterprise');
            });
            
            if (course) {
                quiz.courseId = course._id;
                await Quiz.create(quiz);
            }
        }
        
        console.log('✅ Quizzes seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding quizzes:', error);
    }
};

// Seed users
const seedUsers = async () => {
    try {
        // Clear existing users except for the primary admin user
        await User.deleteMany({ email: { $ne: 'admin@test.com' } });
        
        console.log('👥 Seeding users...');
        
        for (const userData of users) {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (!existingUser) {
                await User.create({
                    name: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role
                });
            }
        }
        
        console.log('✅ Users seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding users:', error);
    }
};

// Enroll test students in courses
const enrollStudents = async () => {
    try {
        console.log('📊 Enrolling students in courses...');
        
        // Get a student user
        const student = await User.findOne({ role: 'student' });
        
        if (!student) {
            console.error('❌ No student user found');
            return;
        }
        
        // Get all courses
        const courses = await Course.find();
        
        // Enroll student in each course
        for (const course of courses) {
            // Check if progress already exists
            const existingProgress = await LearningProgress.findOne({
                userId: student._id,
                courseId: course._id
            });
            
            if (!existingProgress) {
                await LearningProgress.create({
                    userId: student._id,
                    courseId: course._id,
                    enrollmentDate: new Date(),
                    moduleProgress: []
                });
            }
        }
        
        console.log('✅ Students enrolled successfully');
    } catch (error) {
        console.error('❌ Error enrolling students:', error);
    }
};

// Run all seed functions
const seedAll = async () => {
    await connectDB();
    
    // Run seeds in sequence
    await seedCourses();
    await seedQuizzes();
    await seedUsers();
    await enrollStudents();
    
    console.log('✨ All seeding completed successfully!');
    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', err => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});

// Run the seed function
seedAll();