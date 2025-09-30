const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const ProgressSyncService = require('../services/progressSyncService');

// Import design patterns
const { ContentFactory } = require('../patterns/factory');
const { LearningProgressTracker } = require('../patterns/observer');
const { AccessControlProxy, CachingProxy } = require('../patterns/proxy');
const { GradeCalculator, WeightedAverageStrategy } = require('../patterns/strategy');

/**
 * Module Controller with Design Pattern Integration
 * Implements Factory, Observer, Proxy, and Strategy patterns
 */

// Initialize design pattern instances
const progressTracker = new LearningProgressTracker();
const gradeCalculator = new GradeCalculator(new WeightedAverageStrategy());

// Create a new module using Factory Pattern
const createModule = async (req, res) => {
    try {
        const { courseId, contents = [], ...moduleData } = req.body;
        const userId = req.user.id;

        // Verify course exists and user has permission
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create modules for this course' });
        }

        // Use Factory Pattern to create content items
        const processedContents = [];
        for (const contentData of contents) {
            try {
                // Create content using Factory Pattern
                const content = ContentFactory.createContent(contentData.type, {
                    title: contentData.title,
                    duration: contentData.duration,
                    ...contentData.contentData
                });

                processedContents.push({
                    contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: contentData.type,
                    title: contentData.title,
                    description: contentData.description || '',
                    duration: contentData.duration,
                    order: contentData.order || processedContents.length + 1,
                    isRequired: contentData.isRequired !== false,
                    contentData: contentData.contentData || {},
                    prerequisites: contentData.prerequisites || [],
                    learningObjectives: contentData.learningObjectives || [],
                    complexity: contentData.complexity || 1,
                    accessControl: {
                        requiresPremium: contentData.requiresPremium || false,
                        requiredRole: contentData.requiredRole || 'student',
                        availableFrom: contentData.availableFrom,
                        availableUntil: contentData.availableUntil
                    }
                });
            } catch (factoryError) {
                console.warn(`Failed to create content with factory: ${factoryError.message}`);
                // Fallback to basic content creation
                processedContents.push({
                    contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: contentData.type || 'text',
                    title: contentData.title,
                    description: contentData.description || '',
                    duration: contentData.duration || 10,
                    order: contentData.order || processedContents.length + 1,
                    isRequired: contentData.isRequired !== false,
                    contentData: contentData.contentData || {}
                });
            }
        }

        // Get next module number
        const lastModule = await Module.findOne({ courseId })
            .sort({ moduleNumber: -1 })
            .select('moduleNumber');
        
        const moduleNumber = lastModule ? lastModule.moduleNumber + 1 : 1;

        // Create module
        const module = new Module({
            courseId,
            moduleNumber,
            contents: processedContents,
            createdBy: userId,
            ...moduleData
        });

        await module.save();

        // Update course module settings
        await Course.findByIdAndUpdate(courseId, {
            'moduleSettings.hasModules': true,
            $push: {
                'syllabus': {
                    moduleTitle: module.title,
                    topics: module.learningObjectives,
                    estimatedHours: Math.ceil(module.estimatedDuration / 60),
                    moduleId: module._id
                }
            }
        });

        // Notify observers using Observer Pattern
        progressTracker.notify({
            type: 'MODULE_CREATED',
            moduleId: module._id,
            courseId,
            createdBy: userId
        }, {
            module: module.toObject(),
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'Module created successfully',
            module: await Module.findById(module._id)
                .populate('createdBy', 'name email')
        });

    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ 
            message: 'Failed to create module', 
            error: error.message 
        });
    }
};

// Get modules for a course
const getCourseModules = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { includeInactive = false } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get modules using the static method
        const modules = await Module.getByCourse(courseId, {
            includeInactive: includeInactive === 'true',
            populateContents: true
        });

        // Get user's progress for this course
        const userProgress = await ModuleProgress.find({ 
            userId, 
            courseId 
        });

        // Process modules with access control
        const processedModules = modules.map((module) => {
            try {
                // Ensure module is valid
                if (!module || !module._id) {
                    console.warn('Invalid module found:', module);
                    return null;
                }

                // Convert to plain object safely
                const moduleData = module.toObject ? module.toObject() : module;
                
                // Find user progress for this module
                const moduleProgressData = userProgress.find(
                    p => p.moduleId && p.moduleId.toString() === module._id.toString()
                );

                // Simple access check - for now, all authenticated users can access modules
                const processedModule = {
                    ...moduleData,
                    canAccess: true,
                    accessReason: userRole === 'admin' ? 'Administrator access' : 'Authenticated user access',
                    progress: moduleProgressData || null,
                    isLocked: false
                };

                // Remove any potential circular references or complex objects
                if (processedModule.nextModule) {
                    processedModule.nextModule = {
                        _id: processedModule.nextModule._id,
                        title: processedModule.nextModule.title,
                        moduleNumber: processedModule.nextModule.moduleNumber
                    };
                }

                if (processedModule.previousModule) {
                    processedModule.previousModule = {
                        _id: processedModule.previousModule._id,
                        title: processedModule.previousModule.title,
                        moduleNumber: processedModule.previousModule.moduleNumber
                    };
                }

                return processedModule;

            } catch (error) {
                console.warn(`Error processing module ${module?._id}:`, error.message);
                return {
                    _id: module?._id || 'unknown',
                    title: module?.title || 'Unknown Module',
                    moduleNumber: module?.moduleNumber || 0,
                    description: 'Module data unavailable',
                    canAccess: false,
                    accessReason: 'System error'
                };
            }
        }).filter(Boolean); // Remove any null modules

        res.json({
            modules: processedModules,
            totalModules: modules.length,
            accessibleModules: processedModules.filter(m => m.canAccess).length
        });

    } catch (error) {
        console.error('Error fetching course modules:', error);
        res.status(500).json({ 
            message: 'Failed to fetch modules', 
            error: error.message 
        });
    }
};

// Get specific module with detailed progress
const getModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.user.id;

        const module = await Module.findById(moduleId)
            .populate('createdBy', 'name email')
            .populate('courseId', 'title instructor');

        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check access permissions using Proxy Pattern
        const accessCheck = module.canUserAccess(req.user);
        if (!accessCheck.canAccess && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Access denied', 
                reason: accessCheck.reason 
            });
        }

        // Get detailed progress
        const moduleProgress = await ModuleProgress.getDetailedProgress(userId, moduleId);

        // Get learning recommendations using Strategy Pattern
        let recommendations = null;
        if (moduleProgress) {
            recommendations = moduleProgress.getPersonalizedRecommendations();
        }

        res.json({
            module: module.toObject(),
            progress: moduleProgress,
            recommendations,
            navigation: {
                nextModule: await module.getNextModule(),
                previousModule: await module.getPreviousModule()
            }
        });

    } catch (error) {
        console.error('Error fetching module:', error);
        res.status(500).json({ 
            message: 'Failed to fetch module', 
            error: error.message 
        });
    }
};

// Update module progress using Observer Pattern
const updateModuleProgress = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { contentId, progressData, action } = req.body;
        const userId = req.user.id;

        // Get or create module progress
        let moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
        
        if (!moduleProgress) {
            const module = await Module.findById(moduleId);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }

            // Get total content counts
            const totalContentCount = module.contents.length;
            const totalRequiredContentCount = module.contents.filter(c => c.isRequired).length;

            moduleProgress = new ModuleProgress({
                userId,
                courseId: module.courseId,
                moduleId,
                totalContentCount,
                totalRequiredContentCount
            });
        }

        // Update specific content progress
        if (contentId && progressData) {
            await moduleProgress.updateContentProgress(contentId, progressData);
        }

        // Handle specific actions
        switch (action) {
            case 'start_module':
                if (moduleProgress.status === 'not-started') {
                    moduleProgress.status = 'in-progress';
                    moduleProgress.startedAt = new Date();
                }
                break;

            case 'complete_content':
                // Content completion is handled in updateContentProgress
                break;

            case 'complete_module':
                if (moduleProgress.requiredCompletionRate >= 100) {
                    moduleProgress.status = 'completed';
                    moduleProgress.completedAt = new Date();
                }
                break;
        }

        await moduleProgress.save();

        // Sync module progress with course progress using new service
        const updatedLearningProgress = await ProgressSyncService.syncModuleWithCourse(
            userId, 
            moduleProgress.courseId, 
            moduleId
        );

        // Notify observers using Observer Pattern
        progressTracker.notify({
            type: 'MODULE_PROGRESS_UPDATED',
            userId,
            moduleId,
            courseId: moduleProgress.courseId,
            action,
            contentId
        }, {
            progress: moduleProgress.toObject(),
            courseProgress: updatedLearningProgress.toObject(),
            updatedAt: new Date()
        });

        // Check for achievements and milestones
        await checkModuleAchievements(moduleProgress);

        res.json({
            message: 'Progress updated successfully',
            progress: moduleProgress,
            completionRate: moduleProgress.completionPercentage,
            isCompleted: moduleProgress.isCompleted
        });

    } catch (error) {
        console.error('Error updating module progress:', error);
        res.status(500).json({ 
            message: 'Failed to update progress', 
            error: error.message 
        });
    }
};

// Calculate module grade using Strategy Pattern
const calculateModuleGrade = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { gradingStrategy = 'weighted' } = req.body;
        const userId = req.user.id;

        const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
        if (!moduleProgress) {
            return res.status(404).json({ message: 'Module progress not found' });
        }

        // Prepare scores for grading
        const scores = {
            assignments: [],
            quizzes: [],
            finalExam: 0
        };

        // Extract scores from content progress
        moduleProgress.contentProgress.forEach(cp => {
            if (cp.bestScore && cp.bestScore.percentage > 0) {
                switch (cp.contentType) {
                    case 'quiz':
                        scores.quizzes.push(cp.bestScore.percentage);
                        break;
                    case 'assignment':
                        scores.assignments.push(cp.bestScore.percentage);
                        break;
                    case 'interactive':
                        scores.assignments.push(cp.bestScore.percentage);
                        break;
                }
            }
        });

        // Use module assessment as final exam if available
        if (moduleProgress.moduleAssessment && moduleProgress.moduleAssessment.bestScorePercentage > 0) {
            scores.finalExam = moduleProgress.moduleAssessment.bestScorePercentage;
        }

        // Apply grading strategy
        let gradingStrategyInstance;
        switch (gradingStrategy) {
            case 'pass-fail':
                const { PassFailStrategy } = require('../patterns/strategy');
                gradingStrategyInstance = new PassFailStrategy(70);
                break;
            case 'competency':
                const { CompetencyBasedStrategy } = require('../patterns/strategy');
                // Define competencies based on learning objectives
                const competencies = moduleProgress.moduleId.learningObjectives.map((obj, index) => ({
                    id: `competency_${index}`,
                    name: obj,
                    masteryThreshold: 75
                }));
                gradingStrategyInstance = new CompetencyBasedStrategy(competencies);
                break;
            default:
                gradingStrategyInstance = new WeightedAverageStrategy();
        }

        gradeCalculator.setStrategy(gradingStrategyInstance);
        const gradeResult = gradeCalculator.calculateStudentGrade(scores);

        // Update module progress with grade
        moduleProgress.moduleAssessment.bestScore = gradeResult.finalGrade;
        moduleProgress.moduleAssessment.bestScorePercentage = 
            typeof gradeResult.finalGrade === 'number' ? gradeResult.finalGrade : 0;
        
        await moduleProgress.save();

        res.json({
            message: 'Module grade calculated successfully',
            grade: gradeResult,
            strategy: gradingStrategyInstance.getDescription(),
            moduleProgress: {
                completionPercentage: moduleProgress.completionPercentage,
                totalTimeSpent: moduleProgress.totalTimeSpent,
                averageScore: moduleProgress.averageScore
            }
        });

    } catch (error) {
        console.error('Error calculating module grade:', error);
        res.status(500).json({ 
            message: 'Failed to calculate grade', 
            error: error.message 
        });
    }
};

// Helper function to update overall course progress
const updateCourseProgress = async (userId, courseId) => {
    try {
        const moduleProgresses = await ModuleProgress.find({ userId, courseId });
        const learningProgress = await LearningProgress.findOne({ userId, courseId });

        if (learningProgress && moduleProgresses.length > 0) {
            // Update module-based progress
            const completedModules = moduleProgresses.filter(mp => mp.isCompleted).length;
            const totalModules = moduleProgresses.length;
            
            learningProgress.moduleProgress.totalModules = totalModules;
            learningProgress.moduleProgress.completedModules = completedModules;
            learningProgress.completionPercentage = (completedModules / totalModules) * 100;
            
            // Update current module
            const inProgressModule = moduleProgresses.find(mp => mp.status === 'in-progress');
            if (inProgressModule) {
                learningProgress.moduleProgress.currentModuleId = inProgressModule.moduleId;
                learningProgress.currentModule = inProgressModule.moduleId.moduleNumber || 0;
            }

            // Calculate average module score
            const moduleScores = moduleProgresses
                .filter(mp => mp.moduleAssessment.bestScorePercentage > 0)
                .map(mp => mp.moduleAssessment.bestScorePercentage);
            
            if (moduleScores.length > 0) {
                learningProgress.moduleProgress.averageModuleScore = 
                    moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length;
            }

            await learningProgress.save();
        }
    } catch (error) {
        console.error('Error updating course progress:', error);
    }
};

// Helper function to check for module achievements
const checkModuleAchievements = async (moduleProgress) => {
    try {
        const achievements = [];

        // First content completion
        if (moduleProgress.contentCompletionCount === 1 && 
            !moduleProgress.achievements.some(a => a.type === 'first-content')) {
            achievements.push({
                type: 'first-content',
                description: 'Completed first content item in module'
            });
        }

        // Module completion
        if (moduleProgress.isCompleted && 
            !moduleProgress.achievements.some(a => a.type === 'module-completion')) {
            achievements.push({
                type: 'module-completion',
                description: 'Successfully completed the module'
            });
        }

        // Perfect score
        if (moduleProgress.averageScore >= 100 && 
            !moduleProgress.achievements.some(a => a.type === 'perfect-score')) {
            achievements.push({
                type: 'perfect-score',
                description: 'Achieved perfect scores in all assessments'
            });
        }

        // Quick learner (completed in less than estimated time)
        const estimatedTime = moduleProgress.moduleId?.estimatedDuration || 0;
        if (moduleProgress.totalTimeSpent < estimatedTime * 0.75 && 
            moduleProgress.isCompleted &&
            !moduleProgress.achievements.some(a => a.type === 'quick-learner')) {
            achievements.push({
                type: 'quick-learner',
                description: 'Completed module faster than estimated time'
            });
        }

        // Add achievements to progress
        if (achievements.length > 0) {
            moduleProgress.achievements.push(...achievements);
            await moduleProgress.save();

            // Notify observers about achievements
            progressTracker.notify({
                type: 'ACHIEVEMENTS_UNLOCKED',
                userId: moduleProgress.userId,
                moduleId: moduleProgress.moduleId,
                achievements
            }, {
                achievements,
                unlockedAt: new Date()
            });
        }

    } catch (error) {
        console.error('Error checking module achievements:', error);
    }
};

// Get module analytics (admin/instructor only)
const getModuleAnalytics = async (req, res) => {
    try {
        const { moduleId } = req.params;

        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const module = await Module.findById(moduleId).populate('courseId');
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Check if user is instructor of the course
        if (req.user.role === 'instructor' && 
            module.courseId.instructor.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this module' });
        }

        // Get all progress records for this module
        const allProgress = await ModuleProgress.find({ moduleId })
            .populate('userId', 'name email');

        // Calculate analytics
        const analytics = {
            totalEnrollments: allProgress.length,
            completionRate: allProgress.filter(p => p.isCompleted).length / allProgress.length * 100,
            averageCompletionTime: 0,
            averageScore: 0,
            contentAnalytics: {},
            strugglingStudents: [],
            topPerformers: []
        };

        if (allProgress.length > 0) {
            // Average completion time
            const completedProgress = allProgress.filter(p => p.isCompleted && p.totalTimeSpent > 0);
            if (completedProgress.length > 0) {
                analytics.averageCompletionTime = completedProgress
                    .reduce((sum, p) => sum + p.totalTimeSpent, 0) / completedProgress.length;
            }

            // Average score
            const scoredProgress = allProgress.filter(p => p.averageScore > 0);
            if (scoredProgress.length > 0) {
                analytics.averageScore = scoredProgress
                    .reduce((sum, p) => sum + p.averageScore, 0) / scoredProgress.length;
            }

            // Content analytics
            module.contents.forEach(content => {
                const contentProgress = allProgress.map(p => 
                    p.contentProgress.find(cp => cp.contentId === content.contentId)
                ).filter(Boolean);

                analytics.contentAnalytics[content.contentId] = {
                    title: content.title,
                    type: content.type,
                    completionRate: contentProgress.filter(cp => cp.isCompleted).length / allProgress.length * 100,
                    averageTimeSpent: contentProgress.reduce((sum, cp) => sum + (cp.timeSpent || 0), 0) / contentProgress.length,
                    averageAttempts: contentProgress.reduce((sum, cp) => sum + (cp.attempts || 0), 0) / contentProgress.length
                };
            });

            // Struggling students (bottom 20% by completion rate and score)
            analytics.strugglingStudents = allProgress
                .filter(p => p.completionPercentage < 50 || p.averageScore < 60)
                .sort((a, b) => (a.completionPercentage + a.averageScore) - (b.completionPercentage + b.averageScore))
                .slice(0, Math.ceil(allProgress.length * 0.2))
                .map(p => ({
                    userId: p.userId._id,
                    userName: p.userId.name,
                    completionPercentage: p.completionPercentage,
                    averageScore: p.averageScore,
                    timeSpent: p.totalTimeSpent,
                    strugglingAreas: p.getStrugglingAreas()
                }));

            // Top performers (top 20% by completion rate and score)
            analytics.topPerformers = allProgress
                .filter(p => p.completionPercentage >= 80 && p.averageScore >= 80)
                .sort((a, b) => (b.completionPercentage + b.averageScore) - (a.completionPercentage + a.averageScore))
                .slice(0, Math.ceil(allProgress.length * 0.2))
                .map(p => ({
                    userId: p.userId._id,
                    userName: p.userId.name,
                    completionPercentage: p.completionPercentage,
                    averageScore: p.averageScore,
                    timeSpent: p.totalTimeSpent,
                    achievements: p.achievements.length
                }));
        }

        res.json({
            module: {
                _id: module._id,
                title: module.title,
                moduleNumber: module.moduleNumber,
                totalContents: module.totalContents
            },
            analytics
        });

    } catch (error) {
        console.error('Error getting module analytics:', error);
        res.status(500).json({ 
            message: 'Failed to get analytics', 
            error: error.message 
        });
    }
};

// Complete a module and sync with course progress
const completeModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { timeSpent, score } = req.body;
        const userId = req.user.id;

        // Get module and course info
        const module = await Module.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Use the sync service to complete the module
        const updatedLearningProgress = await ProgressSyncService.syncModuleCompletion(
            userId,
            module.courseId,
            moduleId,
            { timeSpent, score }
        );

        // Get updated module progress
        const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });

        res.json({
            message: 'Module completed successfully',
            moduleProgress,
            courseProgress: updatedLearningProgress,
            achievements: updatedLearningProgress.achievements.slice(-3) // Last 3 achievements
        });

    } catch (error) {
        console.error('Error completing module:', error);
        res.status(500).json({ 
            message: 'Failed to complete module', 
            error: error.message 
        });
    }
};

// Get progress synchronization report
const getProgressSyncReport = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const report = await ProgressSyncService.getProgressSyncReport(userId, courseId);

        res.json({
            message: 'Progress sync report retrieved successfully',
            report
        });

    } catch (error) {
        console.error('Error getting progress sync report:', error);
        res.status(500).json({ 
            message: 'Failed to get progress sync report', 
            error: error.message 
        });
    }
};

// Admin function to sync all users in a course
const syncAllUsersInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Check if user is admin (add proper auth check)
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const results = await ProgressSyncService.syncAllUsersInCourse(courseId);

        res.json({
            message: 'Course-wide progress sync completed',
            results,
            totalUsers: results.length,
            successfulSyncs: results.filter(r => r.success).length,
            failedSyncs: results.filter(r => !r.success).length
        });

    } catch (error) {
        console.error('Error syncing all users in course:', error);
        res.status(500).json({ 
            message: 'Failed to sync all users', 
            error: error.message 
        });
    }
};

module.exports = {
    createModule,
    getCourseModules,
    getModule,
    updateModuleProgress,
    calculateModuleGrade,
    getModuleAnalytics,
    completeModule,
    getProgressSyncReport,
    syncAllUsersInCourse
};