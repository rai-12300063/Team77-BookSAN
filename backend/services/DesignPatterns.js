/**
 * Design Patterns Implementation
 * Demonstrating 7+ design patterns integrated with the OOP classes
 */

// Import the required classes for patterns
const { Content, VideoContent, QuizContent, User, Student, Instructor } = require('./CoreClasses');
const { TextContent } = require('./AdditionalClasses');

/**
 * 1. FACTORY PATTERN - Creates different types of content and users
 */
class ContentFactory {
    createContent(type, data) {
        switch (type.toLowerCase()) {
            case 'video':
                return new VideoContent(
                    data.id,
                    data.title,
                    data.description,
                    data.duration,
                    data.videoUrl,
                    data.resolution
                );
                
            case 'quiz':
                return new QuizContent(
                    data.id,
                    data.title,
                    data.description,
                    data.duration,
                    data.questions,
                    data.passingScore
                );
                
            case 'text':
                return new TextContent(
                    data.id,
                    data.title,
                    data.description,
                    data.duration,
                    data.textContent,
                    data.readingLevel
                );
                
            default:
                throw new Error(`Unknown content type: ${type}`);
        }
    }

    // Factory method for content templates
    createFromTemplate(templateType, customData) {
        const templates = {
            'intro-video': {
                type: 'video',
                title: 'Introduction Video',
                description: 'Course introduction and overview',
                duration: 300, // 5 minutes
                resolution: '1080p'
            },
            'quick-quiz': {
                type: 'quiz',
                title: 'Quick Knowledge Check',
                description: 'Test your understanding',
                duration: 180, // 3 minutes
                passingScore: 70,
                questions: []
            },
            'reading-material': {
                type: 'text',
                title: 'Reading Material',
                description: 'Essential reading for this topic',
                duration: 600, // 10 minutes
                readingLevel: 'intermediate'
            }
        };

        const template = templates[templateType];
        if (!template) {
            throw new Error(`Unknown template type: ${templateType}`);
        }

        return this.createContent(template.type, { 
            ...template, 
            ...customData,
            id: customData.id || `${templateType}_${Date.now()}`
        });
    }
}

class UserFactory {
    createUser(type, userData) {
        switch (type.toLowerCase()) {
            case 'student':
                return new Student(
                    userData.id,
                    userData.name,
                    userData.email
                );
                
            case 'instructor':
                return new Instructor(
                    userData.id,
                    userData.name,
                    userData.email
                );
                
            case 'admin':
                return new AdminUser(
                    userData.id,
                    userData.name,
                    userData.email
                );
                
            default:
                throw new Error(`Unknown user type: ${type}`);
        }
    }
}

/**
 * 2. STRATEGY PATTERN - Different grading strategies
 */
class GradingStrategy {
    calculate(userProgress) {
        throw new Error("Method 'calculate()' must be implemented");
    }
    
    getDescription() {
        throw new Error("Method 'getDescription()' must be implemented");
    }
}

class WeightedGradingStrategy extends GradingStrategy {
    constructor(weights = { assignments: 0.4, quizzes: 0.3, participation: 0.3 }) {
        super();
        this.weights = weights;
    }

    calculate(userProgress) {
        const scores = userProgress.scores || {};
        let totalScore = 0;

        for (const [category, weight] of Object.entries(this.weights)) {
            const categoryScores = scores[category] || [];
            if (categoryScores.length > 0) {
                const average = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
                totalScore += average * weight;
            }
        }

        return {
            finalGrade: Math.round(totalScore),
            letterGrade: this.getLetterGrade(totalScore),
            breakdown: this.getBreakdown(scores)
        };
    }

    getLetterGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    getBreakdown(scores) {
        const breakdown = {};
        for (const [category, weight] of Object.entries(this.weights)) {
            const categoryScores = scores[category] || [];
            const average = categoryScores.length > 0 
                ? categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length 
                : 0;
            breakdown[category] = {
                average,
                weight: weight * 100,
                contribution: average * weight
            };
        }
        return breakdown;
    }

    getDescription() {
        return `Weighted grading: ${Object.entries(this.weights)
            .map(([key, weight]) => `${key} ${weight * 100}%`)
            .join(', ')}`;
    }
}

class PassFailGradingStrategy extends GradingStrategy {
    constructor(passingThreshold = 70) {
        super();
        this.passingThreshold = passingThreshold;
    }

    calculate(userProgress) {
        const scores = userProgress.scores || {};
        const allScores = Object.values(scores).flat();
        
        if (allScores.length === 0) {
            return { finalGrade: 0, letterGrade: 'F', status: 'Incomplete' };
        }

        const average = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
        const passed = average >= this.passingThreshold;

        return {
            finalGrade: average,
            letterGrade: passed ? 'P' : 'F',
            status: passed ? 'Pass' : 'Fail',
            threshold: this.passingThreshold
        };
    }

    getDescription() {
        return `Pass/Fail grading with ${this.passingThreshold}% threshold`;
    }
}

/**
 * 3. OBSERVER PATTERN - Progress tracking and notifications
 */
class ProgressObserver {
    update(event, data) {
        throw new Error("Method 'update()' must be implemented");
    }
}

class ProgressTracker extends ProgressObserver {
    constructor() {
        super();
        this.progressLog = [];
    }

    update(event, data) {
        const logEntry = {
            timestamp: new Date(),
            event,
            data,
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        this.progressLog.push(logEntry);
        this.processEvent(event, data);
    }

    processEvent(event, data) {
        switch (event) {
            case 'content_added':
                console.log(`📚 New content added to module ${data.moduleId}: ${data.contentId}`);
                break;
            case 'content_completed':
                console.log(`✅ Content completed in module ${data.moduleId}: ${data.contentId}`);
                this.checkModuleCompletion(data.moduleId);
                break;
            case 'module_started':
                console.log(`🚀 Module started: ${data.moduleId} by user ${data.userId}`);
                break;
            case 'module_completed':
                console.log(`🎉 Module completed: ${data.moduleId} by user ${data.userId}`);
                break;
        }
    }

    checkModuleCompletion(moduleId) {
        // Logic to check if module is completed and trigger events
        console.log(`🔍 Checking completion status for module: ${moduleId}`);
    }

    getProgressLog(filterBy = null) {
        if (!filterBy) return [...this.progressLog];
        
        return this.progressLog.filter(entry => 
            entry.event === filterBy || 
            entry.data.moduleId === filterBy ||
            entry.data.userId === filterBy
        );
    }
}

class NotificationObserver extends ProgressObserver {
    constructor(notificationService) {
        super();
        this.notificationService = notificationService;
    }

    update(event, data) {
        switch (event) {
            case 'content_completed':
                this.sendContentCompletionNotification(data);
                break;
            case 'module_completed':
                this.sendModuleCompletionNotification(data);
                break;
            case 'achievement_unlocked':
                this.sendAchievementNotification(data);
                break;
        }
    }

    sendContentCompletionNotification(data) {
        this.notificationService.send({
            userId: data.userId,
            type: 'content_completion',
            message: `Congratulations! You've completed "${data.contentTitle}"`,
            priority: 'normal'
        });
    }

    sendModuleCompletionNotification(data) {
        this.notificationService.send({
            userId: data.userId,
            type: 'module_completion',
            message: `🎉 Module "${data.moduleTitle}" completed! Great job!`,
            priority: 'high'
        });
    }

    sendAchievementNotification(data) {
        this.notificationService.send({
            userId: data.userId,
            type: 'achievement',
            message: `🏆 Achievement unlocked: ${data.achievementName}`,
            priority: 'high'
        });
    }
}

/**
 * 4. DECORATOR PATTERN - Enhancing content with additional features
 */
class ContentDecorator extends Content {
    constructor(content) {
        super(content.id, content.title, content.description, content.duration);
        this.wrappedContent = content;
    }

    render() {
        return this.wrappedContent.render();
    }

    getContentType() {
        return this.wrappedContent.getContentType();
    }

    calculateProgress(userInteraction) {
        return this.wrappedContent.calculateProgress(userInteraction);
    }
}

class TimeLimitDecorator extends ContentDecorator {
    constructor(content, timeLimit) {
        super(content);
        this.timeLimit = timeLimit;
    }

    render() {
        const baseRender = super.render();
        return {
            ...baseRender,
            timeLimit: this.timeLimit,
            timerEnabled: true
        };
    }

    calculateProgress(userInteraction) {
        const baseProgress = super.calculateProgress(userInteraction);
        const timeUsed = userInteraction.timeUsed || 0;
        
        if (timeUsed > this.timeLimit) {
            return Math.max(baseProgress - 10, 0); // Penalty for exceeding time
        }
        
        return baseProgress;
    }
}

class AdaptiveDecorator extends ContentDecorator {
    constructor(content, difficultyLevel) {
        super(content);
        this.difficultyLevel = difficultyLevel;
    }

    render() {
        const baseRender = super.render();
        return {
            ...baseRender,
            adaptiveDifficulty: this.difficultyLevel,
            hints: this.generateHints(),
            supportMaterials: this.getSupportMaterials()
        };
    }

    generateHints() {
        const hintLevels = {
            'beginner': ['Take your time', 'Review the basics if needed', 'Don\'t hesitate to ask for help'],
            'intermediate': ['Think about the core concepts', 'Consider multiple approaches'],
            'advanced': ['Apply advanced techniques', 'Consider edge cases']
        };
        
        return hintLevels[this.difficultyLevel] || hintLevels['intermediate'];
    }

    getSupportMaterials() {
        return {
            glossary: `/glossary/${this.difficultyLevel}`,
            references: `/references/${this.wrappedContent.getContentType()}`,
            examples: `/examples/${this.difficultyLevel}`
        };
    }
}

/**
 * 5. PROXY PATTERN - Access control and caching
 */
class ContentProxy {
    constructor(content, user, accessControl) {
        this.content = content;
        this.user = user;
        this.accessControl = accessControl;
        this.cache = new Map();
    }

    render() {
        // Check access permissions
        if (!this.accessControl.canAccess(this.user, this.content)) {
            throw new Error("Access denied: Insufficient permissions");
        }

        // Check cache first
        const cacheKey = `${this.content.id}_${this.user.id}_render`;
        if (this.cache.has(cacheKey)) {
            console.log("📋 Serving content from cache");
            return this.cache.get(cacheKey);
        }

        // Render content and cache result
        const result = this.content.processContent(this.user);
        this.cache.set(cacheKey, result);
        
        return result;
    }

    calculateProgress(userInteraction) {
        if (!this.accessControl.canAccess(this.user, this.content)) {
            return 0;
        }

        return this.content.calculateProgress(userInteraction);
    }

    getContentType() {
        return this.content.getContentType();
    }

    // Proxy-specific methods
    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}

/**
 * 6. COMMAND PATTERN - Encapsulating learning actions
 */
class LearningCommand {
    execute() {
        throw new Error("Method 'execute()' must be implemented");
    }

    undo() {
        throw new Error("Method 'undo()' must be implemented");
    }

    getDescription() {
        throw new Error("Method 'getDescription()' must be implemented");
    }
}

class EnrollCommand extends LearningCommand {
    constructor(user, course) {
        super();
        this.user = user;
        this.course = course;
        this.executed = false;
    }

    execute() {
        if (this.executed) {
            throw new Error("Command already executed");
        }

        this.user.enrollInCourse(this.course.id);
        this.executed = true;
        return `User ${this.user.name} enrolled in course ${this.course.title}`;
    }

    undo() {
        if (!this.executed) {
            throw new Error("Cannot undo: Command not executed");
        }

        this.user.unenrollFromCourse(this.course.id);
        this.executed = false;
        return `User ${this.user.name} unenrolled from course ${this.course.title}`;
    }

    getDescription() {
        return `Enroll ${this.user.name} in ${this.course.title}`;
    }
}

class CompleteContentCommand extends LearningCommand {
    constructor(user, content, progressData) {
        super();
        this.user = user;
        this.content = content;
        this.progressData = progressData;
        this.previousProgress = null;
        this.executed = false;
    }

    execute() {
        if (this.executed) {
            throw new Error("Command already executed");
        }

        // Store previous progress for undo
        this.previousProgress = this.user.getProgress(
            this.progressData.courseId, 
            this.progressData.moduleId
        );

        // Update progress
        this.user.updateProgress(
            this.progressData.courseId,
            this.progressData.moduleId,
            {
                ...this.progressData,
                completedAt: new Date(),
                contentId: this.content.id
            }
        );

        this.executed = true;
        return `Content "${this.content.title}" marked as completed`;
    }

    undo() {
        if (!this.executed) {
            throw new Error("Cannot undo: Command not executed");
        }

        // Restore previous progress
        if (this.previousProgress) {
            this.user.updateProgress(
                this.progressData.courseId,
                this.progressData.moduleId,
                this.previousProgress
            );
        }

        this.executed = false;
        return `Content completion undone for "${this.content.title}"`;
    }

    getDescription() {
        return `Complete content: ${this.content.title}`;
    }
}

/**
 * 7. ADAPTER PATTERN - Integrating external content systems
 */
class ExternalContentAdapter {
    constructor(externalContent, contentType) {
        this.externalContent = externalContent;
        this.contentType = contentType;
    }

    // Adapt external content to our Content interface
    adaptToContent() {
        const adaptedData = {
            id: this.generateId(),
            title: this.extractTitle(),
            description: this.extractDescription(),
            duration: this.extractDuration(),
            type: this.contentType
        };

        // Add type-specific adaptations
        switch (this.contentType) {
            case 'video':
                adaptedData.videoUrl = this.extractVideoUrl();
                adaptedData.resolution = this.extractResolution();
                break;
            case 'quiz':
                adaptedData.questions = this.adaptQuestions();
                adaptedData.passingScore = this.extractPassingScore();
                break;
        }

        return adaptedData;
    }

    generateId() {
        return `ext_${this.externalContent.id || Date.now()}`;
    }

    extractTitle() {
        return this.externalContent.title || 
               this.externalContent.name || 
               this.externalContent.subject ||
               'Imported Content';
    }

    extractDescription() {
        return this.externalContent.description || 
               this.externalContent.summary ||
               this.externalContent.overview ||
               'Content imported from external system';
    }

    extractDuration() {
        // Convert different time formats to minutes
        const duration = this.externalContent.duration || 
                        this.externalContent.length ||
                        this.externalContent.estimatedTime;

        if (typeof duration === 'string') {
            // Parse formats like "1h 30m", "90 minutes", "1:30:00"
            return this.parseDurationString(duration);
        }

        return duration || 30; // Default 30 minutes
    }

    parseDurationString(durationStr) {
        // Simple duration parser - can be extended
        const hourMatch = durationStr.match(/(\d+)h/);
        const minuteMatch = durationStr.match(/(\d+)m/);
        
        let totalMinutes = 0;
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
        if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
        
        return totalMinutes || 30;
    }

    extractVideoUrl() {
        return this.externalContent.videoUrl || 
               this.externalContent.streamUrl ||
               this.externalContent.mediaUrl;
    }

    extractResolution() {
        return this.externalContent.quality || 
               this.externalContent.resolution || 
               '720p';
    }

    adaptQuestions() {
        const externalQuestions = this.externalContent.questions || 
                                 this.externalContent.items ||
                                 [];

        return externalQuestions.map((q, index) => ({
            id: `q_${index}`,
            question: q.question || q.text || q.prompt,
            options: q.options || q.choices || q.answers,
            correctAnswer: q.correctAnswer || q.correct || 0
        }));
    }

    extractPassingScore() {
        return this.externalContent.passingScore || 
               this.externalContent.threshold ||
               70;
    }
}

module.exports = {
    ContentFactory,
    UserFactory,
    GradingStrategy,
    WeightedGradingStrategy,
    PassFailGradingStrategy,
    ProgressObserver,
    ProgressTracker,
    NotificationObserver,
    ContentDecorator,
    TimeLimitDecorator,
    AdaptiveDecorator,
    ContentProxy,
    LearningCommand,
    EnrollCommand,
    CompleteContentCommand,
    ExternalContentAdapter
};