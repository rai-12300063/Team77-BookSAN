/**
 * Additional Classes for OOP Requirements
 * Completing the 5+ interacting classes requirement with additional implementations
 */

// Import required base classes
const { Content, User } = require('./CoreClasses');

/**
 * TextContent Class - Demonstrates INHERITANCE and POLYMORPHISM
 * Extends the abstract Content class
 */
class TextContent extends Content {
    #textContent;
    #readingLevel;
    #wordCount;
    #language;

    constructor(id, title, description, duration, textContent, readingLevel = 'intermediate') {
        super(id, title, description, duration); // INHERITANCE
        this.#textContent = textContent;
        this.#readingLevel = readingLevel;
        this.#wordCount = this.calculateWordCount(textContent);
        this.#language = 'english';
    }

    // POLYMORPHISM - specific implementation for text content
    render() {
        return {
            type: 'text',
            content: {
                title: this.title,
                text: this.#textContent,
                readingLevel: this.#readingLevel,
                wordCount: this.#wordCount,
                estimatedReadingTime: this.calculateReadingTime(),
                language: this.#language
            }
        };
    }

    getContentType() {
        return 'text';
    }

    calculateProgress(userInteraction) {
        const readTime = userInteraction.timeSpent || 0;
        const expectedTime = this.calculateReadingTime();
        return Math.min((readTime / expectedTime) * 100, 100);
    }

    // Private method (ENCAPSULATION)
    calculateWordCount(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    calculateReadingTime() {
        // Average reading speed: 200-250 words per minute
        const wordsPerMinute = 225;
        return Math.ceil(this.#wordCount / wordsPerMinute);
    }

    // Text-specific methods
    updateContent(newContent) {
        this.#textContent = newContent;
        this.#wordCount = this.calculateWordCount(newContent);
    }

    setReadingLevel(level) {
        const validLevels = ['beginner', 'intermediate', 'advanced'];
        if (validLevels.includes(level)) {
            this.#readingLevel = level;
        } else {
            throw new Error(`Invalid reading level: ${level}`);
        }
    }

    get wordCount() { return this.#wordCount; }
    get readingLevel() { return this.#readingLevel; }
}

/**
 * AdminUser Class - Demonstrates INHERITANCE and POLYMORPHISM
 * Extends User class with administrative capabilities
 */
class AdminUser extends User {
    #permissions;
    #managedInstructors;
    #systemAccess;

    constructor(id, name, email) {
        super(id, name, email, 'admin'); // INHERITANCE
        this.#permissions = new Set([
            'manage_users',
            'manage_courses', 
            'view_analytics',
            'system_settings',
            'bulk_operations',
            'audit_logs'
        ]);
        this.#managedInstructors = new Set();
        this.#systemAccess = {
            database: true,
            reports: true,
            userManagement: true,
            courseManagement: true
        };
    }

    // POLYMORPHISM - admin-specific permissions
    getPermissions() {
        return Array.from(this.#permissions);
    }

    // Admin-specific methods
    addPermission(permission) {
        this.#permissions.add(permission);
    }

    removePermission(permission) {
        this.#permissions.delete(permission);
    }

    hasPermission(permission) {
        return this.#permissions.has(permission);
    }

    assignInstructor(instructorId) {
        this.#managedInstructors.add(instructorId);
    }

    removeInstructor(instructorId) {
        this.#managedInstructors.delete(instructorId);
    }

    getManagedInstructors() {
        return Array.from(this.#managedInstructors);
    }

    // System access methods
    canAccessSystem(systemComponent) {
        return this.#systemAccess[systemComponent] || false;
    }

    updateSystemAccess(component, access) {
        this.#systemAccess[component] = access;
    }
}

/**
 * AssessmentSystem Class - Demonstrates COMPOSITION and AGGREGATION
 * Manages assessments and grading across the learning system
 */
class AssessmentSystem {
    #assessments;
    #gradingStrategies;
    #submissionQueue;
    #gradingHistory;

    constructor() {
        this.#assessments = new Map();
        this.#gradingStrategies = new Map();
        this.#submissionQueue = [];
        this.#gradingHistory = new Map();
    }

    // Assessment management
    createAssessment(assessmentData) {
        const assessment = new Assessment(
            assessmentData.id,
            assessmentData.title,
            assessmentData.type,
            assessmentData.questions || assessmentData.content,
            assessmentData.timeLimit,
            assessmentData.gradingStrategy
        );

        this.#assessments.set(assessment.id, assessment);
        return assessment;
    }

    getAssessment(assessmentId) {
        return this.#assessments.get(assessmentId);
    }

    // COMPOSITION - assessment system contains grading strategies
    addGradingStrategy(strategyName, strategy) {
        this.#gradingStrategies.set(strategyName, strategy);
    }

    // Submission processing
    submitAssessment(userId, assessmentId, answers) {
        const submission = {
            id: `sub_${Date.now()}_${userId}`,
            userId,
            assessmentId,
            answers,
            submittedAt: new Date(),
            status: 'pending'
        };

        this.#submissionQueue.push(submission);
        return submission.id;
    }

    processSubmissionQueue() {
        while (this.#submissionQueue.length > 0) {
            const submission = this.#submissionQueue.shift();
            this.gradeSubmission(submission);
        }
    }

    gradeSubmission(submission) {
        const assessment = this.#assessments.get(submission.assessmentId);
        if (!assessment) {
            console.error(`Assessment not found: ${submission.assessmentId}`);
            return;
        }

        const strategyName = assessment.gradingStrategy || 'default';
        const strategy = this.#gradingStrategies.get(strategyName);
        
        if (!strategy) {
            console.error(`Grading strategy not found: ${strategyName}`);
            return;
        }

        const grade = assessment.calculateGrade(submission.answers, strategy);
        
        // Store grading history
        const historyKey = `${submission.userId}_${submission.assessmentId}`;
        if (!this.#gradingHistory.has(historyKey)) {
            this.#gradingHistory.set(historyKey, []);
        }
        
        this.#gradingHistory.get(historyKey).push({
            submissionId: submission.id,
            grade,
            gradedAt: new Date(),
            strategy: strategyName
        });

        submission.status = 'graded';
        submission.grade = grade;

        return grade;
    }

    // Analytics and reporting
    getGradingHistory(userId, assessmentId = null) {
        if (assessmentId) {
            const key = `${userId}_${assessmentId}`;
            return this.#gradingHistory.get(key) || [];
        }

        // Return all grading history for user
        const userHistory = [];
        for (const [key, history] of this.#gradingHistory) {
            if (key.startsWith(`${userId}_`)) {
                userHistory.push(...history);
            }
        }
        return userHistory;
    }

    getAssessmentStatistics(assessmentId) {
        const submissions = [];
        for (const [key, history] of this.#gradingHistory) {
            if (key.endsWith(`_${assessmentId}`)) {
                submissions.push(...history);
            }
        }

        if (submissions.length === 0) {
            return { totalSubmissions: 0 };
        }

        const grades = submissions.map(s => s.grade.finalGrade || 0);
        const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
        const highest = Math.max(...grades);
        const lowest = Math.min(...grades);

        return {
            totalSubmissions: submissions.length,
            averageGrade: Math.round(average),
            highestGrade: highest,
            lowestGrade: lowest,
            passRate: this.calculatePassRate(grades)
        };
    }

    calculatePassRate(grades, passingGrade = 70) {
        const passing = grades.filter(grade => grade >= passingGrade).length;
        return Math.round((passing / grades.length) * 100);
    }
}

/**
 * Assessment Class - Used by AssessmentSystem (COMPOSITION)
 */
class Assessment {
    #id;
    #title;
    #type;
    #content;
    #timeLimit;
    #gradingStrategy;
    #attempts;

    constructor(id, title, type, content, timeLimit, gradingStrategy = 'default') {
        this.#id = id;
        this.#title = title;
        this.#type = type; // 'quiz', 'assignment', 'exam'
        this.#content = content;
        this.#timeLimit = timeLimit; // in minutes
        this.#gradingStrategy = gradingStrategy;
        this.#attempts = new Map(); // userId -> attempt count
    }

    get id() { return this.#id; }
    get title() { return this.#title; }
    get type() { return this.#type; }
    get timeLimit() { return this.#timeLimit; }
    get gradingStrategy() { return this.#gradingStrategy; }

    // Assessment-specific methods
    canAttempt(userId, maxAttempts = 3) {
        const currentAttempts = this.#attempts.get(userId) || 0;
        return currentAttempts < maxAttempts;
    }

    recordAttempt(userId) {
        const currentAttempts = this.#attempts.get(userId) || 0;
        this.#attempts.set(userId, currentAttempts + 1);
    }

    calculateGrade(answers, gradingStrategy) {
        this.recordAttempt(answers.userId);

        if (this.#type === 'quiz') {
            return this.gradeQuiz(answers, gradingStrategy);
        } else if (this.#type === 'assignment') {
            return this.gradeAssignment(answers, gradingStrategy);
        }

        return { finalGrade: 0, feedback: 'Unknown assessment type' };
    }

    gradeQuiz(answers, strategy) {
        let correctCount = 0;
        const feedback = [];

        this.#content.forEach((question, index) => {
            const userAnswer = answers.responses[index];
            const isCorrect = question.correctAnswer === userAnswer;
            
            if (isCorrect) {
                correctCount++;
            }

            feedback.push({
                questionId: question.id,
                correct: isCorrect,
                userAnswer,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation
            });
        });

        const percentage = (correctCount / this.#content.length) * 100;
        
        return {
            finalGrade: Math.round(percentage),
            correctAnswers: correctCount,
            totalQuestions: this.#content.length,
            feedback,
            gradedAt: new Date()
        };
    }

    gradeAssignment(submission, strategy) {
        // For assignments, manual grading would typically be required
        // This is a simplified automatic grading example
        return {
            finalGrade: 85, // Placeholder
            feedback: 'Assignment submitted successfully. Manual review pending.',
            submittedAt: new Date(),
            requiresManualGrading: true
        };
    }
}

/**
 * ReportingSystem Class - Demonstrates AGGREGATION
 * Aggregates data from various system components
 */
class ReportingSystem {
    #dataProviders;
    #reportCache;
    #reportTemplates;

    constructor() {
        this.#dataProviders = new Map();
        this.#reportCache = new Map();
        this.#reportTemplates = new Map();
        this.initializeDefaultTemplates();
    }

    // AGGREGATION - reporting system uses but doesn't own other systems
    registerDataProvider(name, provider) {
        this.#dataProviders.set(name, provider);
    }

    generateReport(reportType, parameters = {}) {
        const cacheKey = `${reportType}_${JSON.stringify(parameters)}`;
        
        // Check cache first
        if (this.#reportCache.has(cacheKey)) {
            const cached = this.#reportCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                return cached.data;
            }
        }

        const template = this.#reportTemplates.get(reportType);
        if (!template) {
            throw new Error(`Unknown report type: ${reportType}`);
        }

        const reportData = this.executeReport(template, parameters);
        
        // Cache the result
        this.#reportCache.set(cacheKey, {
            data: reportData,
            timestamp: Date.now()
        });

        return reportData;
    }

    executeReport(template, parameters) {
        const reportData = {
            title: template.title,
            generatedAt: new Date(),
            parameters,
            sections: []
        };

        for (const section of template.sections) {
            const provider = this.#dataProviders.get(section.dataProvider);
            if (!provider) {
                console.warn(`Data provider not found: ${section.dataProvider}`);
                continue;
            }

            try {
                const sectionData = provider[section.method](parameters);
                reportData.sections.push({
                    title: section.title,
                    data: sectionData,
                    type: section.type
                });
            } catch (error) {
                console.error(`Error generating section ${section.title}:`, error);
                reportData.sections.push({
                    title: section.title,
                    error: error.message,
                    type: 'error'
                });
            }
        }

        return reportData;
    }

    initializeDefaultTemplates() {
        this.#reportTemplates.set('student_progress', {
            title: 'Student Progress Report',
            sections: [
                {
                    title: 'Enrollment Summary',
                    dataProvider: 'userSystem',
                    method: 'getEnrollmentSummary',
                    type: 'summary'
                },
                {
                    title: 'Course Progress',
                    dataProvider: 'learningSystem',
                    method: 'getCourseProgress',
                    type: 'progress'
                },
                {
                    title: 'Assessment Results',
                    dataProvider: 'assessmentSystem',
                    method: 'getGradingHistory',
                    type: 'grades'
                }
            ]
        });

        this.#reportTemplates.set('course_analytics', {
            title: 'Course Analytics Report',
            sections: [
                {
                    title: 'Enrollment Statistics',
                    dataProvider: 'learningSystem',
                    method: 'getEnrollmentStats',
                    type: 'statistics'
                },
                {
                    title: 'Content Engagement',
                    dataProvider: 'contentSystem',
                    method: 'getEngagementMetrics',
                    type: 'metrics'
                },
                {
                    title: 'Assessment Performance',
                    dataProvider: 'assessmentSystem',
                    method: 'getAssessmentStatistics',
                    type: 'performance'
                }
            ]
        });
    }

    // Cache management
    clearCache() {
        this.#reportCache.clear();
    }

    getCacheStats() {
        return {
            size: this.#reportCache.size,
            keys: Array.from(this.#reportCache.keys())
        };
    }
}

module.exports = {
    TextContent,
    AdminUser,
    AssessmentSystem,
    Assessment,
    ReportingSystem
};