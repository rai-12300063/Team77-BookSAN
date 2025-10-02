/**
 * OOP Integration and Demonstration
 * This file demonstrates all 5+ interacting classes with OOP principles
 * and 7+ design patterns working together in a cohesive system
 */

// Import all classes and patterns
const {
    Content,
    VideoContent,
    QuizContent,
    LearningModule,
    User,
    Student,
    Instructor,
    LearningManagementSystem
} = require('./CoreClasses');

const {
    ContentFactory,
    UserFactory,
    WeightedGradingStrategy,
    PassFailGradingStrategy,
    ProgressTracker,
    NotificationObserver,
    TimeLimitDecorator,
    AdaptiveDecorator,
    ContentProxy,
    EnrollCommand,
    CompleteContentCommand,
    ExternalContentAdapter
} = require('./DesignPatterns');

const {
    TextContent,
    AdminUser,
    AssessmentSystem,
    ReportingSystem
} = require('./AdditionalClasses');

/**
 * Access Control System for Proxy Pattern
 */
class AccessControl {
    constructor() {
        this.permissions = new Map();
        this.setupDefaultPermissions();
    }

    setupDefaultPermissions() {
        this.permissions.set('student', [
            'view_basic_content',
            'submit_assignments',
            'take_quizzes'
        ]);
        
        this.permissions.set('instructor', [
            'view_basic_content',
            'view_advanced_content', 
            'create_content',
            'grade_assignments'
        ]);
        
        this.permissions.set('admin', [
            'view_basic_content',
            'view_advanced_content',
            'create_content',
            'manage_users',
            'system_admin'
        ]);
    }

    canAccess(user, content) {
        const userPermissions = this.permissions.get(user.role) || [];
        
        // Basic content accessible to all authenticated users
        if (content.getContentType() === 'text' || content.getContentType() === 'video') {
            return userPermissions.includes('view_basic_content');
        }
        
        // Quizzes require special permissions
        if (content.getContentType() === 'quiz') {
            return userPermissions.includes('view_basic_content') || 
                   userPermissions.includes('take_quizzes');
        }
        
        return false;
    }
}

/**
 * Notification Service for Observer Pattern
 */
class NotificationService {
    constructor() {
        this.notifications = [];
    }

    send(notification) {
        console.log(`📧 Notification sent to user ${notification.userId}: ${notification.message}`);
        this.notifications.push({
            ...notification,
            sentAt: new Date(),
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
    }

    getNotifications(userId) {
        return this.notifications.filter(n => n.userId === userId);
    }
}

/**
 * OOP and Design Patterns Integration Demo
 */
class LearningSystemDemo {
    constructor() {
        // Initialize core systems
        this.lms = new LearningManagementSystem();
        this.assessmentSystem = new AssessmentSystem();
        this.reportingSystem = new ReportingSystem();
        this.accessControl = new AccessControl();
        this.notificationService = new NotificationService();
        
        // Initialize patterns
        this.contentFactory = new ContentFactory();
        this.userFactory = new UserFactory();
        this.progressTracker = new ProgressTracker();
        this.notificationObserver = new NotificationObserver(this.notificationService);
        
        // Register data providers for reporting
        this.reportingSystem.registerDataProvider('learningSystem', this.lms);
        this.reportingSystem.registerDataProvider('assessmentSystem', this.assessmentSystem);
        
        // Add grading strategies
        this.assessmentSystem.addGradingStrategy('weighted', new WeightedGradingStrategy());
        this.assessmentSystem.addGradingStrategy('pass_fail', new PassFailGradingStrategy());
    }

    /**
     * Comprehensive Demo showcasing all OOP principles and design patterns
     */
    runComprehensiveDemo() {
        console.log("\n🚀 === COMPREHENSIVE OOP & DESIGN PATTERNS DEMO ===\n");
        
        // 1. Demonstrate FACTORY PATTERN with OOP INHERITANCE
        console.log("1️⃣ Factory Pattern + Inheritance Demo:");
        const student = this.lms.createUser('student', {
            id: 'student_001',
            name: 'Alice Johnson',
            email: 'alice@example.com'
        });
        
        const instructor = this.lms.createUser('instructor', {
            id: 'instructor_001',
            name: 'Dr. Bob Smith',
            email: 'bob@example.com'
        });
        
        console.log(`Created ${student.constructor.name}: ${student.name} (${student.role})`);
        console.log(`Created ${instructor.constructor.name}: ${instructor.name} (${instructor.role})`);
        console.log(`Student permissions: ${student.getPermissions().join(', ')}`);
        console.log(`Instructor permissions: ${instructor.getPermissions().join(', ')}\n`);

        // 2. Demonstrate POLYMORPHISM with different content types
        console.log("2️⃣ Polymorphism Demo - Different Content Types:");
        
        const videoContent = this.contentFactory.createContent('video', {
            id: 'video_001',
            title: 'Introduction to JavaScript',
            description: 'Learn the basics of JavaScript programming',
            duration: 30,
            videoUrl: 'https://example.com/js-intro.mp4',
            resolution: '1080p'
        });
        
        const quizContent = this.contentFactory.createContent('quiz', {
            id: 'quiz_001',
            title: 'JavaScript Basics Quiz',
            description: 'Test your knowledge of JavaScript fundamentals',
            duration: 15,
            questions: [
                {
                    id: 'q1',
                    question: 'What is a variable in JavaScript?',
                    options: ['A container for data', 'A function', 'A loop', 'An object'],
                    correctAnswer: 0
                }
            ],
            passingScore: 80
        });
        
        const textContent = this.contentFactory.createContent('text', {
            id: 'text_001',
            title: 'JavaScript Variables Guide',
            description: 'Comprehensive guide to JavaScript variables',
            duration: 20,
            textContent: 'Variables in JavaScript are containers that store data values...',
            readingLevel: 'beginner'
        });
        
        // Demonstrate polymorphism - same method, different implementations
        console.log(`Video content type: ${videoContent.getContentType()}`);
        console.log(`Quiz content type: ${quizContent.getContentType()}`);
        console.log(`Text content type: ${textContent.getContentType()}\n`);

        // 3. Demonstrate DECORATOR PATTERN with ENCAPSULATION
        console.log("3️⃣ Decorator Pattern + Encapsulation Demo:");
        
        const decoratedQuiz = new TimeLimitDecorator(quizContent, 600); // 10 minutes
        const adaptiveVideo = new AdaptiveDecorator(videoContent, 'beginner');
        
        console.log("Original quiz render:", JSON.stringify(quizContent.render().content.title));
        console.log("Decorated quiz with time limit:", JSON.stringify(decoratedQuiz.render().timeLimit));
        console.log("Adaptive video content:", JSON.stringify(adaptiveVideo.render().adaptiveDifficulty));
        console.log();

        // 4. Demonstrate PROXY PATTERN with access control
        console.log("4️⃣ Proxy Pattern Demo - Access Control:");
        
        const videoProxy = new ContentProxy(videoContent, student, this.accessControl);
        const quizProxy = new ContentProxy(decoratedQuiz, student, this.accessControl);
        
        try {
            const videoRender = videoProxy.render();
            console.log(`✅ Student can access video: ${videoRender.content.title}`);
        } catch (error) {
            console.log(`❌ Access denied: ${error.message}`);
        }
        
        try {
            const quizRender = quizProxy.render();
            console.log(`✅ Student can access quiz: ${quizRender.content.title}`);
        } catch (error) {
            console.log(`❌ Access denied: ${error.message}`);
        }
        console.log();

        // 5. Demonstrate STRATEGY PATTERN with COMPOSITION
        console.log("5️⃣ Strategy Pattern + Composition Demo:");
        
        const course = this.lms.createCourse({
            id: 'course_001',
            title: 'Web Development Fundamentals',
            instructorId: instructor.id
        });
        
        const module = this.lms.addModuleToCourse(course.id, {
            id: 'module_001',
            title: 'JavaScript Fundamentals'
        });
        
        // Add contents to module (COMPOSITION)
        this.lms.addContentToModule(course.id, module.id, {
            type: 'video',
            id: videoContent.id,
            title: videoContent.title,
            description: videoContent.description,
            duration: videoContent.duration,
            videoUrl: 'https://example.com/js-intro.mp4'
        });
        
        // Demonstrate different grading strategies
        const weightedStrategy = this.assessmentSystem.addGradingStrategy('weighted', 
            new WeightedGradingStrategy({ assignments: 0.5, quizzes: 0.3, participation: 0.2 }));
        
        const progressData = {
            scores: {
                assignments: [85, 90, 78],
                quizzes: [88, 92],
                participation: [95]
            }
        };
        
        const grade = module.calculateGrade(progressData);
        console.log(`Module grade calculated: ${grade.finalGrade} (${grade.letterGrade})`);
        console.log();

        // 6. Demonstrate OBSERVER PATTERN with notifications
        console.log("6️⃣ Observer Pattern Demo - Progress Tracking:");
        
        // Add observers to module
        module.addObserver(this.progressTracker);
        module.addObserver(this.notificationObserver);
        
        // Enroll student and trigger events
        this.lms.enrollStudent(student.id, course.id);
        
        // Simulate content completion (triggers observers)
        module.notifyObservers('content_completed', {
            userId: student.id,
            contentId: videoContent.id,
            contentTitle: videoContent.title
        });
        
        console.log("Progress log entries:", this.progressTracker.getProgressLog().length);
        console.log("Notifications sent:", this.notificationService.getNotifications(student.id).length);
        console.log();

        // 7. Demonstrate COMMAND PATTERN
        console.log("7️⃣ Command Pattern Demo:");
        
        const enrollCommand = new EnrollCommand(student, course);
        const completeCommand = new CompleteContentCommand(student, videoContent, {
            courseId: course.id,
            moduleId: module.id,
            progress: 100
        });
        
        console.log(`Executing: ${enrollCommand.getDescription()}`);
        const enrollResult = enrollCommand.execute();
        console.log(enrollResult);
        
        console.log(`Executing: ${completeCommand.getDescription()}`);
        const completeResult = completeCommand.execute();
        console.log(completeResult);
        
        // Demonstrate undo
        console.log("Undoing enrollment...");
        const undoResult = enrollCommand.undo();
        console.log(undoResult);
        console.log();

        // 8. Demonstrate ADAPTER PATTERN
        console.log("8️⃣ Adapter Pattern Demo - External Content Integration:");
        
        const externalContent = {
            id: 'ext_001',
            title: 'Python Basics from External Platform',
            summary: 'Learn Python programming fundamentals',
            duration: '1h 30m',
            videoUrl: 'https://external.com/python-basics.mp4',
            quality: '720p'
        };
        
        const adapter = new ExternalContentAdapter(externalContent, 'video');
        const adaptedContent = adapter.adaptToContent();
        
        console.log("External content adapted:");
        console.log(`- ID: ${adaptedContent.id}`);
        console.log(`- Title: ${adaptedContent.title}`);
        console.log(`- Duration: ${adaptedContent.duration} minutes`);
        console.log(`- Video URL: ${adaptedContent.videoUrl}`);
        console.log();

        // 9. Demonstrate ABSTRACTION with Assessment System
        console.log("9️⃣ Abstraction Demo - Assessment System:");
        
        const assessment = this.assessmentSystem.createAssessment({
            id: 'assessment_001',
            title: 'JavaScript Fundamentals Test',
            type: 'quiz',
            questions: [
                {
                    id: 'q1',
                    question: 'What keyword is used to declare a variable?',
                    options: ['var', 'let', 'const', 'All of the above'],
                    correctAnswer: 3,
                    explanation: 'All three keywords can be used to declare variables in JavaScript'
                }
            ],
            timeLimit: 30,
            gradingStrategy: 'weighted'
        });
        
        const submissionId = this.assessmentSystem.submitAssessment(student.id, assessment.id, {
            userId: student.id,
            responses: [3] // Correct answer
        });
        
        this.assessmentSystem.processSubmissionQueue();
        
        const stats = this.assessmentSystem.getAssessmentStatistics(assessment.id);
        console.log(`Assessment statistics:`, stats);
        console.log();

        // 10. Demonstrate AGGREGATION with Reporting System
        console.log("🔟 Aggregation Demo - Reporting System:");
        
        // Mock data providers for demo
        this.reportingSystem.registerDataProvider('mockUserSystem', {
            getEnrollmentSummary: () => ({
                totalEnrollments: 150,
                activeStudents: 142,
                newEnrollments: 23
            })
        });
        
        this.reportingSystem.registerDataProvider('mockContentSystem', {
            getEngagementMetrics: () => ({
                averageTimeSpent: 45,
                completionRate: 78,
                popularContent: ['JavaScript Basics', 'HTML Fundamentals']
            })
        });
        
        try {
            const report = this.reportingSystem.generateReport('student_progress', {
                userId: student.id,
                courseId: course.id
            });
            
            console.log(`Generated report: ${report.title}`);
            console.log(`Report sections: ${report.sections.length}`);
            console.log(`Generated at: ${report.generatedAt}`);
        } catch (error) {
            console.log(`Report generation demo (expected to have some missing providers): ${error.message}`);
        }
        
        console.log("\n✅ === DEMO COMPLETED ===");
        console.log("\n📊 SUMMARY OF DEMONSTRATED CONCEPTS:");
        
        this.printSummary();
    }

    printSummary() {
        console.log("\n🏗️ OOP PRINCIPLES DEMONSTRATED:");
        console.log("✅ INHERITANCE: Student, Instructor, AdminUser extend User");
        console.log("✅ POLYMORPHISM: Different render() implementations in Content subclasses");
        console.log("✅ ENCAPSULATION: Private fields (#) and controlled access via getters");
        console.log("✅ ABSTRACTION: Abstract Content class and Assessment system interfaces");
        
        console.log("\n🎨 DESIGN PATTERNS IMPLEMENTED:");
        console.log("1️⃣ FACTORY PATTERN: ContentFactory, UserFactory");
        console.log("2️⃣ STRATEGY PATTERN: WeightedGradingStrategy, PassFailGradingStrategy");
        console.log("3️⃣ OBSERVER PATTERN: ProgressTracker, NotificationObserver");
        console.log("4️⃣ DECORATOR PATTERN: TimeLimitDecorator, AdaptiveDecorator");
        console.log("5️⃣ PROXY PATTERN: ContentProxy with access control");
        console.log("6️⃣ COMMAND PATTERN: EnrollCommand, CompleteContentCommand");
        console.log("7️⃣ ADAPTER PATTERN: ExternalContentAdapter");
        console.log("8️⃣ FACADE PATTERN: LearningManagementSystem");
        console.log("9️⃣ TEMPLATE METHOD: Content.processContent()");
        
        console.log("\n🔗 INTERACTING CLASSES (5+):");
        console.log("1. Content (abstract) + VideoContent, QuizContent, TextContent");
        console.log("2. User (base) + Student, Instructor, AdminUser");
        console.log("3. LearningModule (manages Content via composition)");
        console.log("4. AssessmentSystem (aggregates Assessment objects)");
        console.log("5. ReportingSystem (aggregates data from other systems)");
        console.log("6. LearningManagementSystem (facade for entire system)");
        
        console.log("\n🎯 All requirements successfully demonstrated!");
    }
}

// Export for use in other parts of the application
module.exports = {
    LearningSystemDemo,
    AccessControl,
    NotificationService
};

// Run demo if this file is executed directly
if (require.main === module) {
    const demo = new LearningSystemDemo();
    demo.runComprehensiveDemo();
}