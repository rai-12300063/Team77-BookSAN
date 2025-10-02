/**
 * Module Service - Integrates all design patterns for module functionality
 * This service acts as a Facade Pattern to coordinate complex module operations
 */

const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');

// Import design patterns
const { ContentFactory, CourseBuilder } = require('../patterns/factory');
const { LearningProgressTracker, EmailNotificationObserver, AnalyticsObserver, BadgeSystemObserver } = require('../patterns/observer');
const { AccessControlProxy, CachingProxy, LazyLoadingProxy } = require('../patterns/proxy');
const { GradeCalculator, WeightedAverageStrategy, PassFailStrategy, CompetencyBasedStrategy } = require('../patterns/strategy');
const { LearningManagementFacade } = require('../patterns/facade');
const { CoursePrototype, LearningPathPrototype, PrototypeRegistry } = require('../patterns/prototype');
const { MiddlewarePipeline, AuthenticationMiddleware, ValidationMiddleware, LoggingMiddleware } = require('../patterns/middleware');
const { ConfigurationManager, Logger } = require('../patterns/singleton');

/**
 * ModuleService - Comprehensive service integrating all design patterns
 */
class ModuleService {
    constructor() {
        // Initialize pattern instances
        this.progressTracker = new LearningProgressTracker();
        this.gradeCalculator = new GradeCalculator(new WeightedAverageStrategy());
        this.contentFactory = ContentFactory;
        this.templateRegistry = new PrototypeRegistry();
        this.config = ConfigurationManager.getInstance();
        this.logger = Logger.getInstance();
        this.lmsFacade = new LearningManagementFacade();
        
        // Set up observers
        this.setupObservers();
        
        // Initialize templates
        this.initializeTemplates();
        
        // Set up middleware pipeline
        this.setupMiddleware();
    }

    /**
     * Setup Observer Pattern - Initialize all observers
     */
    setupObservers() {
        const emailNotifier = new EmailNotificationObserver();
        const analytics = new AnalyticsObserver();
        const badgeSystem = new BadgeSystemObserver();
        
        this.progressTracker.subscribe(emailNotifier);
        this.progressTracker.subscribe(analytics);
        this.progressTracker.subscribe(badgeSystem);
        
        this.logger.info('Module service observers initialized');
    }

    /**
     * Initialize Prototype Pattern - Set up module templates
     */
    initializeTemplates() {
        // Create basic module templates
        const basicModuleTemplate = new CoursePrototype(
            'Basic Module Template',
            'General',
            'Beginner',
            60, // 1 hour
            [
                { title: 'Introduction', duration: 10, type: 'video' },
                { title: 'Core Content', duration: 30, type: 'text' },
                { title: 'Practice Exercise', duration: 15, type: 'interactive' },
                { title: 'Knowledge Check', duration: 5, type: 'quiz' }
            ]
        );

        const advancedModuleTemplate = new CoursePrototype(
            'Advanced Module Template',
            'Technical',
            'Advanced',
            120, // 2 hours
            [
                { title: 'Advanced Concepts', duration: 20, type: 'video' },
                { title: 'Technical Reading', duration: 40, type: 'text' },
                { title: 'Complex Assignment', duration: 45, type: 'assignment' },
                { title: 'Peer Discussion', duration: 15, type: 'discussion' }
            ]
        );

        this.templateRegistry.register('basic-module', basicModuleTemplate);
        this.templateRegistry.register('advanced-module', advancedModuleTemplate);
        
        this.logger.info('Module templates initialized');
    }

    /**
     * Setup Middleware Pattern - Initialize request processing pipeline
     */
    setupMiddleware() {
        this.requestPipeline = new MiddlewarePipeline()
            .use(new LoggingMiddleware())
            .use(new AuthenticationMiddleware())
            .use(new ValidationMiddleware([
                { field: 'moduleId', required: true, type: 'string' },
                { field: 'userId', required: true, type: 'string' }
            ]));
        
        this.logger.info('Module service middleware pipeline initialized');
    }

    /**
     * Factory Pattern - Create module with different content types
     */
    async createModuleFromTemplate(templateName, customizations = {}) {
        try {
            this.logger.info(`Creating module from template: ${templateName}`);
            
            // Get template from registry
            const template = this.templateRegistry.get(templateName);
            
            // Apply customizations
            if (customizations.title) {
                template.updateTitle(customizations.title);
            }
            
            // Create content using Factory Pattern
            const contents = [];
            if (template.syllabus) {
                for (const syllabusItem of template.syllabus) {
                    try {
                        const content = this.contentFactory.createContent(syllabusItem.type, {
                            title: syllabusItem.title,
                            duration: syllabusItem.duration,
                            ...customizations.contentData
                        });
                        
                        contents.push({
                            contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            type: syllabusItem.type,
                            title: syllabusItem.title,
                            duration: syllabusItem.duration,
                            order: contents.length + 1,
                            isRequired: true,
                            contentData: content.getMetadata ? content.getMetadata() : {}
                        });
                    } catch (factoryError) {
                        this.logger.warn(`Factory pattern failed for content: ${factoryError.message}`);
                    }
                }
            }
            
            // Create module
            const moduleData = {
                title: template.title,
                description: customizations.description || template.description || 'Module created from template',
                learningObjectives: template.learningObjectives || [],
                estimatedDuration: template.duration || 60,
                difficulty: template.difficulty || 'Beginner',
                contents,
                ...customizations
            };
            
            this.logger.info(`Module created from template with ${contents.length} content items`);
            return moduleData;
            
        } catch (error) {
            this.logger.error('Error creating module from template:', error);
            throw error;
        }
    }

    /**
     * Proxy Pattern - Get module with access control and caching
     */
    async getModuleWithProxy(moduleId, user, options = {}) {
        try {
            this.logger.info(`Fetching module ${moduleId} for user ${user.id}`);
            
            const module = await Module.findById(moduleId);
            if (!module) {
                throw new Error('Module not found');
            }
            
            // Apply Access Control Proxy
            const accessProxy = new AccessControlProxy(
                module,
                user.role,
                user.subscription || 'free'
            );
            
            // Apply Caching Proxy
            const cachingProxy = new CachingProxy(
                accessProxy,
                this.config.get('cache.ttl') || 300000
            );
            
            // Apply Lazy Loading Proxy if requested
            let finalProxy = cachingProxy;
            if (options.lazyLoad) {
                finalProxy = new LazyLoadingProxy({
                    id: module._id,
                    title: module.title,
                    description: module.description,
                    estimatedDuration: module.estimatedDuration,
                    contents: module.contents
                });
            }
            
            const moduleData = await finalProxy.getContent();
            const metadata = finalProxy.getMetadata();
            
            this.logger.info(`Module ${moduleId} retrieved with proxy patterns`);
            
            return {
                module: moduleData,
                metadata,
                accessGranted: metadata.accessible !== false
            };
            
        } catch (error) {
            this.logger.error(`Error fetching module with proxy: ${error.message}`);
            throw error;
        }
    }

    /**
     * Strategy Pattern - Calculate grade using different strategies
     */
    async calculateModuleGrade(moduleProgress, strategy = 'weighted', options = {}) {
        try {
            this.logger.info(`Calculating grade for module ${moduleProgress.moduleId} using ${strategy} strategy`);
            
            // Prepare score data
            const scores = this.prepareScoreData(moduleProgress);
            
            // Select and apply strategy
            let gradingStrategy;
            switch (strategy) {
                case 'pass-fail':
                    gradingStrategy = new PassFailStrategy(options.passingThreshold || 70);
                    break;
                    
                case 'competency':
                    const competencies = this.extractCompetencies(moduleProgress);
                    gradingStrategy = new CompetencyBasedStrategy(competencies);
                    scores.competencyScores = this.extractCompetencyScores(moduleProgress);
                    break;
                    
                case 'weighted':
                default:
                    const weights = options.weights || {
                        assignments: 0.4,
                        quizzes: 0.3,
                        finalExam: 0.3
                    };
                    gradingStrategy = new WeightedAverageStrategy(weights);
            }
            
            this.gradeCalculator.setStrategy(gradingStrategy);
            const gradeResult = this.gradeCalculator.calculateStudentGrade(scores);
            
            this.logger.info(`Grade calculated: ${gradeResult.finalGrade} (${gradeResult.letterGrade})`);
            
            return {
                ...gradeResult,
                strategy: gradingStrategy.getDescription(),
                calculatedAt: new Date()
            };
            
        } catch (error) {
            this.logger.error(`Error calculating module grade: ${error.message}`);
            throw error;
        }
    }

    /**
     * Observer Pattern - Update progress and notify observers
     */
    async updateModuleProgressWithNotifications(userId, moduleId, progressData) {
        try {
            this.logger.info(`Updating module progress for user ${userId}, module ${moduleId}`);
            
            // Update progress
            let moduleProgress = await ModuleProgress.findOne({ userId, moduleId });
            if (!moduleProgress) {
                const module = await Module.findById(moduleId);
                moduleProgress = new ModuleProgress({
                    userId,
                    courseId: module.courseId,
                    moduleId,
                    totalContentCount: module.contents.length,
                    totalRequiredContentCount: module.contents.filter(c => c.isRequired).length
                });
            }
            
            // Apply progress updates
            if (progressData.contentId) {
                await moduleProgress.updateContentProgress(progressData.contentId, progressData);
            }
            
            await moduleProgress.save();
            
            // Notify observers
            this.progressTracker.notify({
                type: 'MODULE_PROGRESS_UPDATED',
                userId,
                moduleId,
                progressData
            }, {
                progress: moduleProgress.toObject(),
                updatedAt: new Date()
            });
            
            // Check for milestone achievements
            await this.checkMilestones(moduleProgress);
            
            this.logger.info(`Module progress updated and notifications sent`);
            
            return moduleProgress;
            
        } catch (error) {
            this.logger.error(`Error updating module progress: ${error.message}`);
            throw error;
        }
    }

    /**
     * Facade Pattern - Comprehensive module learning workflow
     */
    async enrollUserInModule(userId, moduleId, options = {}) {
        try {
            this.logger.info(`Enrolling user ${userId} in module ${moduleId}`);
            
            // Use Facade Pattern for complex enrollment process
            const enrollmentResult = await this.lmsFacade.enrollUserInModule(
                userId,
                moduleId,
                options
            );
            
            if (enrollmentResult.success) {
                // Initialize module progress
                const module = await Module.findById(moduleId);
                const moduleProgress = new ModuleProgress({
                    userId,
                    courseId: module.courseId,
                    moduleId,
                    totalContentCount: module.contents.length,
                    totalRequiredContentCount: module.contents.filter(c => c.isRequired).length
                });
                
                await moduleProgress.save();
                
                // Notify observers
                this.progressTracker.notify({
                    type: 'MODULE_ENROLLMENT',
                    userId,
                    moduleId
                }, {
                    enrolledAt: new Date(),
                    moduleProgress: moduleProgress.toObject()
                });
                
                this.logger.info(`User ${userId} successfully enrolled in module ${moduleId}`);
            }
            
            return enrollmentResult;
            
        } catch (error) {
            this.logger.error(`Error enrolling user in module: ${error.message}`);
            throw error;
        }
    }

    /**
     * Adapter Pattern - Integrate external content sources
     */
    async integrateExternalContent(moduleId, externalContentSource) {
        try {
            this.logger.info(`Integrating external content for module ${moduleId}`);
            
            const { ExternalCourseAdapter } = require('../patterns/adapter');
            
            // Create adapter for external content
            const adapter = new ExternalCourseAdapter(externalContentSource);
            const adaptedContent = adapter.getInfo();
            
            // Add to module
            const module = await Module.findById(moduleId);
            if (!module) {
                throw new Error('Module not found');
            }
            
            // Convert external content to internal format
            const newContent = {
                contentId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'external',
                title: adaptedContent.name,
                description: `External content from ${externalContentSource.source}`,
                duration: adaptedContent.estimatedDuration || 30,
                order: module.contents.length + 1,
                isRequired: false,
                contentData: {
                    externalUrl: externalContentSource.url,
                    provider: externalContentSource.provider,
                    adaptedAt: new Date()
                }
            };
            
            module.contents.push(newContent);
            await module.save();
            
            this.logger.info(`External content integrated successfully`);
            
            return {
                success: true,
                addedContent: newContent,
                totalContents: module.contents.length
            };
            
        } catch (error) {
            this.logger.error(`Error integrating external content: ${error.message}`);
            throw error;
        }
    }

    /**
     * Helper Methods
     */
    
    prepareScoreData(moduleProgress) {
        const scores = {
            assignments: [],
            quizzes: [],
            finalExam: 0
        };
        
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
        
        if (moduleProgress.moduleAssessment && moduleProgress.moduleAssessment.bestScorePercentage > 0) {
            scores.finalExam = moduleProgress.moduleAssessment.bestScorePercentage;
        }
        
        return scores;
    }
    
    extractCompetencies(moduleProgress) {
        // Extract competencies from module learning objectives
        const module = moduleProgress.moduleId;
        if (!module || !module.learningObjectives) return [];
        
        return module.learningObjectives.map((objective, index) => ({
            id: `comp_${index}`,
            name: objective,
            masteryThreshold: 75
        }));
    }
    
    extractCompetencyScores(moduleProgress) {
        const competencyScores = {};
        
        // Map content progress to competencies
        moduleProgress.contentProgress.forEach((cp, index) => {
            if (cp.bestScore && cp.bestScore.percentage > 0) {
                competencyScores[`comp_${index}`] = cp.bestScore.percentage;
            }
        });
        
        return competencyScores;
    }
    
    async checkMilestones(moduleProgress) {
        try {
            const milestones = [25, 50, 75, 100];
            
            for (const milestone of milestones) {
                if (moduleProgress.completionPercentage >= milestone) {
                    // Check if milestone already achieved
                    const alreadyAchieved = moduleProgress.achievements.some(
                        a => a.type === 'milestone' && a.description.includes(`${milestone}%`)
                    );
                    
                    if (!alreadyAchieved) {
                        moduleProgress.achievements.push({
                            type: 'milestone',
                            description: `Reached ${milestone}% completion`,
                            unlockedAt: new Date()
                        });
                        
                        // Notify observers
                        this.progressTracker.notify({
                            type: 'MILESTONE_ACHIEVED',
                            userId: moduleProgress.userId,
                            moduleId: moduleProgress.moduleId,
                            milestone
                        }, {
                            milestone,
                            achievedAt: new Date()
                        });
                    }
                }
            }
            
            await moduleProgress.save();
            
        } catch (error) {
            this.logger.error(`Error checking milestones: ${error.message}`);
        }
    }
}

// Singleton instance
let moduleServiceInstance = null;

/**
 * Get ModuleService singleton instance
 */
function getModuleService() {
    if (!moduleServiceInstance) {
        moduleServiceInstance = new ModuleService();
    }
    return moduleServiceInstance;
}

module.exports = {
    ModuleService,
    getModuleService
};