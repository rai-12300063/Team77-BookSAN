const express = require('express');
const router = express.Router();
const {
    createModule,
    getCourseModules,
    getModule,
    updateModule,
    deleteModule,
    updateModuleProgress,
    calculateModuleGrade,
    getModuleAnalytics,
    completeModule,
    getProgressSyncReport,
    syncAllUsersInCourse
} = require('../controllers/moduleController');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

/**
 * Module Routes with Design Pattern Integration
 * All routes use Middleware Pattern for authentication and authorization
 */


// Apply authentication middleware to protected routes
// Note: Some development routes may skip authentication

// Create a new module (instructors and admins only)
router.post('/', authMiddleware, async (req, res, next) => {

    // Authorization middleware using Middleware Pattern
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, createModule);

// Debug route - check if modules API is working
router.get('/debug', (req, res) => {
    res.json({ 
        message: 'Module routes are working!', 
        timestamp: new Date(),
        user: req.user ? req.user.name : 'Not authenticated'
    });
});

// Get all modules for a course

router.get('/course/:courseId', authMiddleware, getCourseModules);

// Get specific module with detailed information
router.get('/:moduleId', authMiddleware, getModule);

// Update module progress
router.put('/:moduleId/progress', authMiddleware, updateModuleProgress);

// Calculate module grade using different strategies
router.post('/:moduleId/grade', authMiddleware, calculateModuleGrade);

// Get module analytics (instructors and admins only)
router.get('/:moduleId/analytics', authMiddleware, async (req, res, next) => {
  
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, getModuleAnalytics);

// Update module (instructors and admins only)
router.put('/:moduleId', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, updateModule);

// Delete module (instructors and admins only)
router.delete('/:moduleId', authMiddleware, async (req, res, next) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, deleteModule);

// Update specific content progress within a module

router.put('/:moduleId/content/:contentId/progress', authMiddleware, async (req, res, next) => {

    try {
        // Add contentId to request body for processing
        req.body.contentId = req.params.contentId;
        updateModuleProgress(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update content progress', error: error.message });
    }
});

// Get module progress for a specific user (admin/instructor can view others)

router.get('/:moduleId/progress/:userId?', authMiddleware, async (req, res) => {

    try {
        const { moduleId, userId } = req.params;
        const requestingUserId = req.user.id;
        const userRole = req.user.role;
        
        // Determine which user's progress to fetch
        let targetUserId = userId || requestingUserId;
        
        // Check permissions for viewing other users' progress
        if (targetUserId !== requestingUserId && userRole !== 'admin' && userRole !== 'instructor') {
            return res.status(403).json({ message: 'Access denied. Cannot view other users\' progress.' });
        }
        
        const ModuleProgress = require('../models/ModuleProgress');
        const progress = await ModuleProgress.getDetailedProgress(targetUserId, moduleId);
        
        if (!progress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }
        
        res.json({
            progress,
            recommendations: progress.getPersonalizedRecommendations(),
            strugglingAreas: progress.getStrugglingAreas(),
            learningVelocity: progress.calculateLearningVelocity()
        });
        
    } catch (error) {
        console.error('Error fetching module progress:', error);
        res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
    }
});

// Bulk update module progress (for offline sync)
router.post('/:moduleId/progress/bulk', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { progressUpdates } = req.body;
        const userId = req.user.id;
        
        if (!Array.isArray(progressUpdates)) {
            return res.status(400).json({ message: 'progressUpdates must be an array' });
        }
        
        const ModuleProgress = require('../models/ModuleProgress');
        let moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
        
        if (!moduleProgress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }
        
        // Process each progress update
        const results = [];
        for (const update of progressUpdates) {
            try {
                if (update.contentId && update.progressData) {
                    await moduleProgress.updateContentProgress(update.contentId, update.progressData);
                    results.push({ contentId: update.contentId, status: 'success' });
                } else {
                    results.push({ 
                        contentId: update.contentId || 'unknown', 
                        status: 'error', 
                        message: 'Missing contentId or progressData' 
                    });
                }
            } catch (updateError) {
                results.push({ 
                    contentId: update.contentId || 'unknown', 
                    status: 'error', 
                    message: updateError.message 
                });
            }
        }
        
        res.json({
            message: 'Bulk progress update completed',
            results,
            totalUpdates: progressUpdates.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            progress: moduleProgress
        });
        
    } catch (error) {
        console.error('Error in bulk progress update:', error);
        res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
});

// Get module completion certificate
router.get('/:moduleId/certificate', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.id;
        
        const ModuleProgress = require('../models/ModuleProgress');
        const progress = await ModuleProgress.getDetailedProgress(userId, moduleId);
        
        if (!progress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }
        
        if (!progress.isCompleted) {
            return res.status(400).json({ message: 'Module not completed. Certificate not available.' });
        }
        
        // Generate certificate data (in a real app, this might create a PDF)
        const certificateData = {
            moduleId: progress.moduleId._id,
            moduleTitle: progress.moduleId.title,
            userName: progress.userId.name,
            completionDate: progress.completedAt,
            finalScore: progress.averageScore,
            totalTimeSpent: progress.totalTimeSpent,
            certificateId: `CERT_${moduleId}_${userId}_${Date.now()}`,
            issuedAt: new Date()
        };
        
        res.json({
            message: 'Certificate generated successfully',
            certificate: certificateData
        });
        
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
    }
});

// Reset module progress (admin/instructor only)
router.delete('/:moduleId/progress/:userId', async (req, res, next) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, async (req, res) => {
    try {
        const { moduleId, userId } = req.params;
        
        const ModuleProgress = require('../models/ModuleProgress');
        const progress = await ModuleProgress.findOneAndDelete({ userId, moduleId });
        
        if (!progress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }
        
        // Notify observers about progress reset
        const { LearningProgressTracker } = require('../patterns/observer');
        const progressTracker = new LearningProgressTracker();
        
        progressTracker.notify({
            type: 'MODULE_PROGRESS_RESET',
            userId,
            moduleId,
            resetBy: req.user.id
        }, {
            resetAt: new Date(),
            previousProgress: progress.toObject()
        });
        
        res.json({
            message: 'Module progress reset successfully',
            resetProgress: {
                moduleId,
                userId,
                previousCompletionPercentage: progress.completionPercentage,
                previousTimeSpent: progress.totalTimeSpent
            }
        });
        
    } catch (error) {
        console.error('Error resetting module progress:', error);
        res.status(500).json({ message: 'Failed to reset progress', error: error.message });
    }
});

// Complete a module and sync with course progress
router.post('/:moduleId/complete', completeModule);

// Get progress synchronization report for a course
router.get('/course/:courseId/progress-sync-report', getProgressSyncReport);

// Admin route: Sync all users' progress in a course
router.post('/course/:courseId/sync-all-users', async (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return res.status(403).json({ message: 'Access denied. Admin or instructor role required.' });
    }
    next();
}, syncAllUsersInCourse);

// Development route: Populate all modules with demo content (no auth required for demo)
router.post('/populate-all-demo', (req, res, next) => {
    // Skip authentication for this demo route
    next();
}, async (req, res) => {
    try {
        const Module = require('../models/Module');
        
        // Get all modules and check their content status
        const allModules = await Module.find({});
        
        // Find modules without content
        const emptyModules = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        });

        // Find modules with content
        const populatedModules = await Module.find({
            contents: { $exists: true, $not: { $size: 0 } }
        });

        console.log(`📊 Module Status: ${allModules.length} total, ${emptyModules.length} empty, ${populatedModules.length} populated`);
        
        const shortDemoContent = (moduleId, moduleTitle) => [
            {
                contentId: `demo_${moduleId}_intro`,
                type: 'text',
                title: 'Introduction',
                description: 'Quick overview of the topic',
                duration: 5,
                order: 1,
                isRequired: true,
                contentData: {
                    content: `
                        <h3>Welcome to ${moduleTitle}</h3>
                        <p>This short module introduces you to <strong>${moduleTitle.toLowerCase()}</strong>.</p>
                        <h4>You'll learn:</h4>
                        <ul>
                            <li>🎯 Core concepts</li>
                            <li>💡 Key insights</li>
                            <li>🛠️ Practical applications</li>
                        </ul>
                        <div style="background: #e8f4fd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                            <strong>💡 Tip:</strong> Complete this module at your own pace!
                        </div>
                    `,
                    readingTime: 3
                }
            },
            {
                contentId: `demo_${moduleId}_quiz`,
                type: 'quiz',
                title: 'Quick Knowledge Check',
                description: 'Test your understanding',
                duration: 3,
                order: 2,
                isRequired: true,
                contentData: {
                    questions: [
                        {
                            questionId: 'demo_q1',
                            type: 'multiple-choice',
                            question: `What is the main goal of studying ${moduleTitle}?`,
                            options: [
                                'To understand core concepts',
                                'To memorize facts',
                                'To pass a test',
                                'To complete requirements'
                            ],
                            correctAnswer: 0,
                            points: 10,
                            explanation: 'The main goal is to understand core concepts that can be applied practically.'
                        }
                    ],
                    passingScore: 70,
                    timeLimit: 3,
                    allowRetakes: true
                }
            }
        ];

        let updatedCount = 0;
        
        // If there are empty modules, populate them
        if (emptyModules.length > 0) {
            for (const module of emptyModules) {
                const demoContent = shortDemoContent(module._id, module.title);
                
                await Module.findByIdAndUpdate(module._id, {
                    contents: demoContent,
                    estimatedDuration: 8 // 5 + 3 minutes
                });
                
                updatedCount++;
            }
        }

        // Return comprehensive status
        if (emptyModules.length === 0) {
            res.json({
                message: `All ${allModules.length} modules are already populated with content! 🎉`,
                status: 'already_populated',
                totalModules: allModules.length,
                populatedModules: populatedModules.length,
                emptyModules: 0,
                newlyPopulated: 0,
                moduleDetails: populatedModules.slice(0, 5).map(m => ({
                    title: m.title,
                    contentCount: m.contents?.length || 0,
                    duration: m.estimatedDuration || 0
                }))
            });
        } else {
            res.json({
                message: `Successfully populated ${updatedCount} modules with demo content`,
                status: 'populated',
                totalModules: allModules.length,
                populatedModules: populatedModules.length,
                emptyModules: emptyModules.length,
                newlyPopulated: updatedCount
            });
        }

    } catch (error) {
        console.error('Error populating modules:', error);
        res.status(500).json({ 
            message: 'Failed to populate modules', 
            error: error.message 
        });
    }
});

// Development route: Add sample content to a module
router.post('/:moduleId/add-sample-content', async (req, res) => {
    try {
        const Module = require('../models/Module');
        const module = await Module.findById(req.params.moduleId);
        
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Sample content
        const sampleContent = [
            {
                contentId: `${req.params.moduleId}_intro`,
                type: 'text',
                title: `${module.title} - Introduction`,
                description: 'Learn the fundamental concepts',
                duration: 15,
                order: 1,
                isRequired: true,
                contentData: {
                    content: `
                        <h2>Welcome to ${module.title}</h2>
                        <p>In this module, you will learn about ${module.title.toLowerCase()}. This comprehensive guide will help you understand the key concepts and apply them in practical scenarios.</p>
                        
                        <h3>What You'll Learn:</h3>
                        <ul>
                            <li>Core concepts and principles</li>
                            <li>Real-world applications</li>
                            <li>Best practices and techniques</li>
                            <li>Common challenges and solutions</li>
                        </ul>
                        
                        <div style="background-color: #e8f4fd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff;">
                            <h4>💡 Learning Tip</h4>
                            <p>Take your time to understand each concept thoroughly. Don't hesitate to re-read sections if needed.</p>
                        </div>
                    `,
                    readingTime: 10
                }
            },
            {
                contentId: `${req.params.moduleId}_video`,
                type: 'video',
                title: `${module.title} - Video Lesson`,
                description: 'Watch and learn through visual demonstration',
                duration: 25,
                order: 2,
                isRequired: true,
                contentData: {
                    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                    transcript: 'This video provides a comprehensive overview of the topic with practical examples and step-by-step demonstrations.'
                }
            },
            {
                contentId: `${req.params.moduleId}_quiz`,
                type: 'quiz',
                title: `${module.title} - Knowledge Check`,
                description: 'Test your understanding with this quick quiz',
                duration: 10,
                order: 3,
                isRequired: true,
                contentData: {
                    questions: [
                        {
                            questionId: 'q1',
                            type: 'multiple-choice',
                            question: 'What is the main focus of this module?',
                            options: [
                                'Understanding fundamental concepts',
                                'Advanced programming techniques',
                                'Historical background only',
                                'None of the above'
                            ],
                            correctAnswer: 0,
                            points: 10,
                            explanation: 'This module focuses on helping you understand the fundamental concepts that form the foundation of the subject.'
                        },
                        {
                            questionId: 'q2',
                            type: 'true-false',
                            question: 'Practical application is important for learning these concepts.',
                            options: ['True', 'False'],
                            correctAnswer: 0,
                            points: 5,
                            explanation: 'Yes, practical application helps reinforce theoretical knowledge and makes learning more effective.'
                        }
                    ],
                    passingScore: 70,
                    timeLimit: 10,
                    allowRetakes: true
                }
            },
            {
                contentId: `${req.params.moduleId}_assignment`,
                type: 'assignment',
                title: `${module.title} - Practical Exercise`,
                description: 'Apply your knowledge in a practical scenario',
                duration: 30,
                order: 4,
                isRequired: true,
                contentData: {
                    instructions: `
                        <h3>Assignment: Practical Application</h3>
                        <p>Now that you've learned the key concepts, it's time to apply them in a practical scenario.</p>
                        
                        <h4>Your Task:</h4>
                        <ol>
                            <li>Choose a real-world scenario related to ${module.title.toLowerCase()}</li>
                            <li>Identify how the concepts from this module apply to your chosen scenario</li>
                            <li>Write a detailed analysis (400-600 words) explaining your application</li>
                            <li>Include specific examples and justifications for your approach</li>
                        </ol>
                        
                        <h4>Grading Criteria:</h4>
                        <ul>
                            <li><strong>Understanding (40%):</strong> Demonstrates clear grasp of module concepts</li>
                            <li><strong>Application (35%):</strong> Effectively applies concepts to chosen scenario</li>
                            <li><strong>Analysis (15%):</strong> Provides thoughtful analysis and insights</li>
                            <li><strong>Communication (10%):</strong> Clear writing and good organization</li>
                        </ul>
                    `,
                    submissionFormat: 'text',
                    rubric: [
                        {
                            criterion: 'Conceptual Understanding',
                            maxPoints: 40,
                            description: 'Clear demonstration of understanding key module concepts'
                        },
                        {
                            criterion: 'Practical Application',
                            maxPoints: 35,
                            description: 'Effective application of concepts to real-world scenario'
                        },
                        {
                            criterion: 'Critical Analysis',
                            maxPoints: 15,
                            description: 'Thoughtful analysis with insights and justifications'
                        },
                        {
                            criterion: 'Communication',
                            maxPoints: 10,
                            description: 'Clear, organized, and well-written response'
                        }
                    ]
                }
            }
        ];

        // Update module with sample content
        module.contents = sampleContent;
        module.estimatedDuration = sampleContent.reduce((total, content) => total + content.duration, 0);
        await module.save();

        res.json({
            message: 'Sample content added successfully',
            contentCount: sampleContent.length,
            totalDuration: module.estimatedDuration
        });

    } catch (error) {
        console.error('Error adding sample content:', error);
        res.status(500).json({ message: 'Failed to add sample content', error: error.message });
    }
});

module.exports = router;