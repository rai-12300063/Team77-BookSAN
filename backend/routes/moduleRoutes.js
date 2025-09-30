const express = require('express');
const router = express.Router();
const {
    createModule,
    getCourseModules,
    getModule,
    updateModuleProgress,
    calculateModuleGrade,
    getModuleAnalytics
} = require('../controllers/moduleController');
const { protect: authMiddleware } = require('../middleware/authMiddleware');

/**
 * Module Routes with Design Pattern Integration
 * All routes use Middleware Pattern for authentication and authorization
 */

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new module (instructors and admins only)
router.post('/', async (req, res, next) => {
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
router.get('/course/:courseId', getCourseModules);

// Get specific module with detailed information
router.get('/:moduleId', getModule);

// Update module progress
router.put('/:moduleId/progress', updateModuleProgress);

// Calculate module grade using different strategies
router.post('/:moduleId/grade', calculateModuleGrade);

// Get module analytics (instructors and admins only)
router.get('/:moduleId/analytics', async (req, res, next) => {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Instructor or admin role required.' });
    }
    next();
}, getModuleAnalytics);

// Update specific content progress within a module
router.put('/:moduleId/content/:contentId/progress', async (req, res, next) => {
    try {
        // Add contentId to request body for processing
        req.body.contentId = req.params.contentId;
        updateModuleProgress(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update content progress', error: error.message });
    }
});

// Get module progress for a specific user (admin/instructor can view others)
router.get('/:moduleId/progress/:userId?', async (req, res) => {
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

module.exports = router;