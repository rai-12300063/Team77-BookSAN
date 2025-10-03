/**
 * OOP Routes - RESTful API endpoints for OOP learning management system
 * Demonstrates integration of OOP patterns with Express.js routing
 */

const express = require('express');
const router = express.Router();
const oopController = require('../controllers/oopController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route GET /api/oop/demo
 * @desc Run comprehensive OOP demonstration
 * @access Public (for demonstration purposes)
 */
router.get('/demo', oopController.runDemo);

/**
 * @route POST /api/oop/users
 * @desc Create user using Factory pattern
 * @access Private
 * @body {string} type - User type ('student', 'instructor', 'admin')
 * @body {object} userData - User data (id, name, email)
 */
router.post('/users', protect, oopController.createUser);

/**
 * @route POST /api/oop/courses
 * @desc Create course with modules using Facade pattern
 * @access Private
 * @body {object} courseData - Course data
 * @body {object} moduleData - Optional module data
 */
router.post('/courses', protect, oopController.createCourse);

/**
 * @route POST /api/oop/content
 * @desc Create content using Factory and Decorator patterns
 * @access Private
 * @body {string} courseId - Course ID
 * @body {string} moduleId - Module ID
 * @body {object} contentData - Content data
 * @body {object} decorators - Optional decorators (timeLimit, adaptive)
 */
router.post('/content', protect, oopController.createContent);

/**
 * @route POST /api/oop/enroll
 * @desc Enroll student using Command pattern
 * @access Private
 * @body {string} studentId - Student ID
 * @body {string} courseId - Course ID
 */
router.post('/enroll', protect, oopController.enrollStudent);

/**
 * @route POST /api/oop/assessments
 * @desc Create assessment using Strategy pattern
 * @access Private
 * @body {object} assessmentData - Assessment data
 * @body {string} gradingStrategy - Grading strategy ('weighted', 'pass_fail')
 */
router.post('/assessments', protect, oopController.createAssessment);

/**
 * @route POST /api/oop/submit-assessment
 * @desc Submit assessment for grading using Strategy pattern
 * @access Private
 * @body {string} userId - User ID
 * @body {string} assessmentId - Assessment ID
 * @body {object} submission - Submission data
 */
router.post('/submit-assessment', protect, oopController.submitAssessment);

/**
 * @route GET /api/oop/reports/:type
 * @desc Generate reports using Aggregation pattern
 * @access Private
 * @param {string} type - Report type
 * @query {string} filters - JSON string of report filters
 */
router.get('/reports/:type', protect, oopController.generateReport);

/**
 * @route GET /api/oop/patterns
 * @desc Get list of implemented design patterns
 * @access Public
 */
router.get('/patterns', oopController.getPatterns);

/**
 * Demo Routes - For testing and demonstration purposes
 */

/**
 * @route GET /api/oop/test/factory
 * @desc Test Factory pattern with sample data
 * @access Public
 */
router.get('/test/factory', async (req, res) => {
    try {
        // Factory pattern implementation removed for standalone operation
        // Using simple mock implementation
        const contentFactory = { createContent: (type, data) => ({ type, ...data }) };
        const userFactory = { createUser: (type, data) => ({ type, ...data }) };
        
        const sampleVideo = contentFactory.createContent('video', {
            id: 'test_video',
            title: 'Test Video',
            description: 'Testing factory pattern',
            duration: 30,
            videoUrl: 'https://test.com/video.mp4'
        });
        
        const sampleStudent = userFactory.createUser('student', {
            id: 'test_student',
            name: 'Test Student',
            email: 'test@example.com'
        });
        
        res.json({
            success: true,
            message: 'Factory pattern demonstration',
            data: {
                video_content: {
                    id: sampleVideo.id,
                    title: sampleVideo.title,
                    type: sampleVideo.getContentType()
                },
                student: {
                    id: sampleStudent.id,
                    name: sampleStudent.name,
                    role: sampleStudent.role,
                    permissions: sampleStudent.getPermissions()
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/oop/test/decorator
 * @desc Test Decorator pattern with sample content
 * @access Public
 */
router.get('/test/decorator', async (req, res) => {
    try {
        // Decorator pattern implementation removed for standalone operation
        // Using simple mock implementation
        const contentFactory = { createContent: (type, data) => ({ type, ...data }) };
        
        const baseContent = contentFactory.createContent('quiz', {
            id: 'test_quiz',
            title: 'Test Quiz',
            description: 'Testing decorator pattern',
            duration: 15,
            questions: [{
                id: 'q1',
                question: 'What is a decorator?',
                options: ['A pattern', 'A class', 'A method', 'All of the above'],
                correctAnswer: 3
            }],
            passingScore: 70
        });
        
        const decoratedContent = new TimeLimitDecorator(
            new AdaptiveDecorator(baseContent, 'intermediate'),
            600 // 10 minutes
        );
        
        const baseRender = baseContent.render();
        const decoratedRender = decoratedContent.render();
        
        res.json({
            success: true,
            message: 'Decorator pattern demonstration',
            data: {
                base_content: baseRender,
                decorated_content: decoratedRender,
                decorators_applied: ['TimeLimitDecorator', 'AdaptiveDecorator']
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /api/oop/test/observer
 * @desc Test Observer pattern with progress tracking
 * @access Public
 */
router.get('/test/observer', async (req, res) => {
    try {
        // Observer pattern implementation removed for standalone operation
        // Using simple mock implementation
        const module = { id: 'test_module', name: 'Test Module' };
        const progressTracker = { observers: [], addObserver: () => {}, notifyObservers: () => {} };
        const notificationService = { send: (notification) => console.log('Notification:', notification) };
        const notificationObserver = { update: () => {} };
        
        module.addObserver(progressTracker);
        module.addObserver(notificationObserver);
        
        // Trigger observer notifications
        module.notifyObservers('content_completed', {
            userId: 'test_user',
            contentId: 'test_content',
            contentTitle: 'Test Content'
        });
        
        res.json({
            success: true,
            message: 'Observer pattern demonstration',
            data: {
                progress_entries: progressTracker.getProgressLog().length,
                observers_notified: 2,
                pattern: 'Observer Pattern'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Error handling middleware for OOP routes
 */
router.use((error, req, res, next) => {
    console.error('OOP Route Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error in OOP system',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;