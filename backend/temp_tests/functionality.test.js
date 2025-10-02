/**
 * Functionality Test Suite for QUT-MIT Learning Progress Tracker
 * =============================================================
 * 
 * This file tests core system functionality including:
 * - Course enrollment and progress tracking
 * - Module completion and progress syncing
 * - Quiz functionality
 * - User roles and permissions
 * 
 * Test Framework: Mocha + Chai + Chai-HTTP
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const sinon = require('sinon');
const mongoose = require('mongoose');
const server = require('../server');

// Import models for testing
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const LearningProgress = require('../models/LearningProgress');
const ModuleProgress = require('../models/ModuleProgress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

chai.use(chaiHttp);

// Test tracking
let testStats = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    startTime: Date.now()
};

// Test user credentials
const testUsers = {
    admin: {
        email: 'admin.test@example.com',
        password: 'Test@123',
        token: null
    },
    instructor: {
        email: 'instructor.test@example.com',
        password: 'Test@123',
        token: null
    },
    student: {
        email: 'student.test@example.com',
        password: 'Test@123',
        token: null
    }
};

describe('🧪 OLPT Functionality Test Suite', function() {
    this.timeout(15000); // Extend timeout for async operations
    
    before(async function() {
        console.log('\n🚀 Starting Functionality Test Suite');
        console.log('📊 Test Framework: Mocha + Chai + Chai-HTTP');
        console.log('🎯 Coverage: Core System Functionality\n');
        testStats.startTime = Date.now();
        
        // Ensure test database is used if not in test environment
        if (process.env.NODE_ENV !== 'test') {
            process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/olpt_test';
        }
    });
    
    after(async function() {
        const duration = ((Date.now() - testStats.startTime) / 1000).toFixed(2);
        console.log(`\n✅ Test Summary: ${testStats.passedTests}/${testStats.totalTests} tests passed (${duration}s)`);
        
        // Don't close mongoose connection as it will be managed by the server
    });
    
    // Test Section: Authentication
    describe('👤 Authentication', function() {
        
        it('Should register test users if they do not exist', async function() {
            // For each test user type
            for (const [role, userData] of Object.entries(testUsers)) {
                // Check if user exists
                const existingUser = await User.findOne({ email: userData.email });
                
                if (!existingUser) {
                    // Create the user
                    const res = await chai.request(server)
                        .post('/api/auth/register')
                        .send({
                            name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                            email: userData.email,
                            password: userData.password,
                            role: role
                        });
                    
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message').that.includes('registered');
                } else {
                    console.log(`Test user ${role} already exists`);
                }
            }
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Should login test users and retrieve tokens', async function() {
            // Login each test user
            for (const [role, userData] of Object.entries(testUsers)) {
                const res = await chai.request(server)
                    .post('/api/auth/login')
                    .send({
                        email: userData.email,
                        password: userData.password
                    });
                
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('user');
                expect(res.body.user).to.have.property('role', role);
                
                // Save token for later tests
                testUsers[role].token = res.body.token;
                testUsers[role].userId = res.body.user._id;
            }
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
    
    // Test Section: Course Management
    describe('📚 Course Management', function() {
        let courseId;
        
        it('Admin should be able to create a course', async function() {
            const res = await chai.request(server)
                .post('/api/courses')
                .set('Authorization', `Bearer ${testUsers.admin.token}`)
                .send({
                    title: 'Test Functionality Course',
                    description: 'Course for testing system functionality',
                    category: 'Testing',
                    difficulty: 'Intermediate',
                    tags: ['test', 'functionality'],
                    image: 'https://via.placeholder.com/150'
                });
            
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('course');
            expect(res.body.course).to.have.property('_id');
            courseId = res.body.course._id;
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Instructor should be able to view course details', async function() {
            const res = await chai.request(server)
                .get(`/api/courses/${courseId}`)
                .set('Authorization', `Bearer ${testUsers.instructor.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('course');
            expect(res.body.course).to.have.property('_id', courseId);
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should be able to enroll in a course', async function() {
            const res = await chai.request(server)
                .post(`/api/courses/${courseId}/enroll`)
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').that.includes('enrolled');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should have a learning progress record after enrollment', async function() {
            const progress = await LearningProgress.findOne({
                user: testUsers.student.userId,
                course: courseId
            });
            
            expect(progress).to.not.be.null;
            expect(progress).to.have.property('courseProgress');
            expect(progress.courseProgress).to.be.a('number');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
    
    // Test Section: Module Management
    describe('📝 Module Management', function() {
        let courseId, moduleId;
        
        before(async function() {
            // Get first available course for testing
            const course = await Course.findOne({ title: 'Test Functionality Course' });
            if (course) {
                courseId = course._id;
            } else {
                throw new Error('No test course available for module tests');
            }
        });
        
        it('Admin should be able to create a module for a course', async function() {
            const res = await chai.request(server)
                .post(`/api/modules`)
                .set('Authorization', `Bearer ${testUsers.admin.token}`)
                .send({
                    courseId: courseId,
                    title: 'Test Module',
                    description: 'Module for testing functionality',
                    content: '# Test Content\n\nThis is test content for the module.',
                    order: 1
                });
            
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('module');
            expect(res.body.module).to.have.property('_id');
            moduleId = res.body.module._id;
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should be able to access module content', async function() {
            const res = await chai.request(server)
                .get(`/api/modules/${moduleId}`)
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('module');
            expect(res.body.module).to.have.property('_id', moduleId);
            expect(res.body.module).to.have.property('content');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should be able to mark a module as completed', async function() {
            const res = await chai.request(server)
                .post(`/api/progress/module/${moduleId}/complete`)
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').that.includes('completed');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Module progress should be reflected in course progress', async function() {
            // Wait a moment for progress to sync
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const progress = await LearningProgress.findOne({
                user: testUsers.student.userId,
                course: courseId
            });
            
            expect(progress).to.not.be.null;
            expect(progress).to.have.property('courseProgress');
            expect(progress.courseProgress).to.be.greaterThan(0);
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
    
    // Test Section: Quiz Functionality
    describe('📝 Quiz Functionality', function() {
        let courseId, quizId;
        
        before(async function() {
            // Get the test course ID
            const course = await Course.findOne({ title: 'Test Functionality Course' });
            if (course) {
                courseId = course._id;
            } else {
                throw new Error('No test course available for quiz tests');
            }
        });
        
        it('Admin should be able to create a quiz for a course', async function() {
            const quizData = {
                title: 'Test Quiz',
                description: 'A quiz to test functionality',
                instructions: 'Answer all questions',
                timeLimit: 30,
                passingScore: 70,
                maxAttempts: 3,
                questions: [
                    {
                        type: 'multiple_choice',
                        question: 'What is the main purpose of this test?',
                        options: [
                            { id: 'a', text: 'To break the system', isCorrect: false },
                            { id: 'b', text: 'To verify functionality', isCorrect: true },
                            { id: 'c', text: 'To waste time', isCorrect: false },
                            { id: 'd', text: 'None of the above', isCorrect: false }
                        ],
                        points: 1
                    },
                    {
                        type: 'multiple_choice',
                        question: 'Which testing framework is used here?',
                        options: [
                            { id: 'a', text: 'Jest', isCorrect: false },
                            { id: 'b', text: 'Mocha + Chai', isCorrect: true },
                            { id: 'c', text: 'Jasmine', isCorrect: false },
                            { id: 'd', text: 'Selenium', isCorrect: false }
                        ],
                        points: 1
                    }
                ]
            };
            
            const res = await chai.request(server)
                .post(`/api/quiz/admin/course/${courseId}`)
                .set('Authorization', `Bearer ${testUsers.admin.token}`)
                .send(quizData);
            
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('quiz');
            expect(res.body.quiz).to.have.property('id');
            quizId = res.body.quiz.id;
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should be able to access a quiz', async function() {
            const res = await chai.request(server)
                .get(`/api/quiz/course/${courseId}`)
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('id', quizId);
            expect(res.body).to.have.property('questions');
            expect(res.body.questions).to.be.an('array');
            expect(res.body.questions).to.have.lengthOf(2);
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Student should be able to submit a quiz attempt', async function() {
            const attemptData = {
                answers: [
                    { questionId: 0, selectedOption: 'b' },
                    { questionId: 1, selectedOption: 'b' }
                ]
            };
            
            const res = await chai.request(server)
                .post(`/api/quiz/${quizId}/submit`)
                .set('Authorization', `Bearer ${testUsers.student.token}`)
                .send(attemptData);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('score');
            expect(res.body).to.have.property('passed');
            expect(res.body.score).to.equal(100); // Both answers correct
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Quiz completion should be reflected in course progress', async function() {
            // Wait a moment for progress to sync
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const progress = await LearningProgress.findOne({
                user: testUsers.student.userId,
                course: courseId
            });
            
            expect(progress).to.not.be.null;
            expect(progress).to.have.property('courseProgress');
            expect(progress.courseProgress).to.be.greaterThan(0);
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
    
    // Test Section: User Progress Dashboard
    describe('📊 User Progress Dashboard', function() {
        it('Student should be able to access their progress dashboard', async function() {
            const res = await chai.request(server)
                .get('/api/progress/dashboard')
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('enrolledCourses');
            expect(res.body.enrolledCourses).to.be.an('array');
            expect(res.body.enrolledCourses.length).to.be.at.least(1);
            
            // Check the enrolled course has progress data
            const testCourse = res.body.enrolledCourses.find(c => 
                c.course.title === 'Test Functionality Course');
            
            expect(testCourse).to.not.be.undefined;
            expect(testCourse).to.have.property('progress');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Instructor should be able to view course statistics', async function() {
            const course = await Course.findOne({ title: 'Test Functionality Course' });
            
            const res = await chai.request(server)
                .get(`/api/courses/${course._id}/stats`)
                .set('Authorization', `Bearer ${testUsers.instructor.token}`);
            
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('enrolledCount');
            expect(res.body).to.have.property('averageProgress');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
    
    // Test Section: Performance and Edge Cases
    describe('⚡ Performance and Edge Cases', function() {
        it('Should handle concurrent module progress updates', async function() {
            this.timeout(5000); // This test might take longer
            
            const module = await Module.findOne({ title: 'Test Module' });
            
            // Simulate concurrent requests
            const results = await Promise.all([
                chai.request(server)
                    .post(`/api/progress/module/${module._id}/complete`)
                    .set('Authorization', `Bearer ${testUsers.student.token}`),
                chai.request(server)
                    .post(`/api/progress/module/${module._id}/complete`)
                    .set('Authorization', `Bearer ${testUsers.student.token}`),
                chai.request(server)
                    .post(`/api/progress/module/${module._id}/complete`)
                    .set('Authorization', `Bearer ${testUsers.student.token}`)
            ]);
            
            // All requests should have succeeded without errors
            results.forEach(res => {
                expect(res).to.have.status(200);
            });
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
        
        it('Should correctly handle invalid course enrollment attempts', async function() {
            // Try to enroll in a non-existent course
            const nonExistentId = new mongoose.Types.ObjectId();
            
            const res = await chai.request(server)
                .post(`/api/courses/${nonExistentId}/enroll`)
                .set('Authorization', `Bearer ${testUsers.student.token}`);
            
            expect(res).to.have.status(404);
            expect(res.body).to.have.property('message').that.includes('not found');
            
            testStats.totalTests++;
            testStats.passedTests++;
        });
    });
});