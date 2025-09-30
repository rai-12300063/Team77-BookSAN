const express = require('express');
const router = express.Router();
const ModuleProgress = require('../models/ModuleProgress');
const Module = require('../models/Module');
const { protect: auth } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/module-progress/course/:courseId
 * @desc    Get all module progress for a course for the current user
 * @access  Private
 */
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const moduleProgresses = await ModuleProgress.find({
            userId: req.user.id,
            courseId: req.params.courseId
        }).populate('moduleId');

        res.json({ moduleProgresses });
    } catch (error) {
        console.error('Error fetching module progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/module-progress/:moduleId
 * @desc    Get specific module progress for current user
 * @access  Private
 */
router.get('/:moduleId', auth, async (req, res) => {
    try {
        const moduleProgress = await ModuleProgress.findOne({
            userId: req.user.id,
            moduleId: req.params.moduleId
        }).populate('moduleId');

        if (!moduleProgress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }

        res.json({ moduleProgress });
    } catch (error) {
        console.error('Error fetching module progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/module-progress/:moduleId/start
 * @desc    Start a module (create initial progress)
 * @access  Private
 */
router.post('/:moduleId/start', auth, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check if progress already exists
        let moduleProgress = await ModuleProgress.findOne({
            userId: req.user.id,
            moduleId: req.params.moduleId
        });

        if (moduleProgress) {
            return res.json({ 
                message: 'Module already started', 
                moduleProgress 
            });
        }

        // Create new module progress
        moduleProgress = new ModuleProgress({
            userId: req.user.id,
            courseId: module.courseId,
            moduleId: req.params.moduleId,
            startedAt: new Date(),
            totalContentCount: module.contents.length,
            totalRequiredContentCount: module.contents.filter(c => c.isRequired).length,
            contentProgress: module.contents.map(content => ({
                contentId: content.contentId,
                contentType: content.type,
                status: 'not_started'
            }))
        });

        await moduleProgress.save();

        res.json({ 
            message: 'Module started successfully', 
            moduleProgress 
        });
    } catch (error) {
        console.error('Error starting module:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   PUT /api/module-progress/:moduleId/content/:contentId
 * @desc    Update progress for specific content
 * @access  Private
 */
router.put('/:moduleId/content/:contentId', auth, async (req, res) => {
    try {
        const { status, timeSpent, score } = req.body;

        const moduleProgress = await ModuleProgress.findOne({
            userId: req.user.id,
            moduleId: req.params.moduleId
        });

        if (!moduleProgress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }

        await moduleProgress.updateContentProgress(req.params.contentId, {
            status,
            timeSpent,
            score
        });

        res.json({ 
            message: 'Content progress updated', 
            moduleProgress 
        });
    } catch (error) {
        console.error('Error updating content progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;