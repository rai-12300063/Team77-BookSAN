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
        // Validate moduleId
        if (!req.params.moduleId || !req.params.moduleId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid module ID format' });
        }

        // Find the module and populate course information
        const module = await Module.findById(req.params.moduleId).populate('courseId');
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check if user is enrolled in the course
        const Course = require('../models/Course');
        const LearningProgress = require('../models/LearningProgress');
        
        const courseEnrollment = await LearningProgress.findOne({
            userId: req.user.id,
            courseId: module.courseId._id
        });

        if (!courseEnrollment) {
            return res.status(403).json({ 
                message: 'You must be enrolled in the course to start this module',
                courseId: module.courseId._id,
                courseTitle: module.courseId.title
            });
        }

        // Check if progress already exists
        let moduleProgress = await ModuleProgress.findOne({
            userId: req.user.id,
            moduleId: req.params.moduleId
        }).populate('moduleId');

        if (moduleProgress) {
            // Update last accessed time
            moduleProgress.lastAccessedAt = new Date();
            await moduleProgress.save();
            
            return res.json({ 
                message: 'Module already started', 
                moduleProgress,
                alreadyStarted: true
            });
        }

        // Check prerequisites if they exist
        if (module.prerequisites && module.prerequisites.length > 0) {
            for (const prereqId of module.prerequisites) {
                const prereqProgress = await ModuleProgress.findOne({
                    userId: req.user.id,
                    moduleId: prereqId
                });

                if (!prereqProgress || prereqProgress.completionStatus !== 'completed') {
                    const prereqModule = await Module.findById(prereqId);
                    return res.status(403).json({ 
                        message: `You must complete the prerequisite module "${prereqModule?.title || 'Unknown'}" before starting this module`,
                        prerequisiteModule: {
                            id: prereqId,
                            title: prereqModule?.title || 'Unknown Module'
                        }
                    });
                }
            }
        }

        // Validate module contents
        const contents = module.contents || [];
        const requiredContents = contents.filter(c => c.isRequired !== false); // Default to required if not specified

        // Create new module progress with proper validation
        moduleProgress = new ModuleProgress({
            userId: req.user.id,
            courseId: module.courseId._id,
            moduleId: req.params.moduleId,
            startedAt: new Date(),
            lastAccessedAt: new Date(),
            status: 'in-progress',
            totalContentCount: contents.length,
            totalRequiredContentCount: requiredContents.length,
            completionPercentage: 0,
            contentProgress: contents.map(content => ({
                contentId: content.contentId || `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                contentType: content.type || 'text',
                status: 'not-started',
                isMandatory: content.isRequired !== false,
                startedAt: null,
                timeSpent: 0
            }))
        });

        // Save the module progress
        await moduleProgress.save();

        // Populate the moduleId field for response
        await moduleProgress.populate('moduleId');

        // Log the activity
        console.log(`User ${req.user.id} started module ${req.params.moduleId} in course ${module.courseId._id}`);

        res.json({ 
            message: 'Module started successfully', 
            moduleProgress,
            moduleInfo: {
                title: module.title,
                description: module.description,
                estimatedDuration: module.estimatedDuration,
                totalContents: contents.length,
                requiredContents: requiredContents.length
            }
        });
    } catch (error) {
        console.error('Error starting module:', error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message) 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid module ID format' });
        }
        
        res.status(500).json({ 
            message: 'Internal server error', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
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