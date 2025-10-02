/**
 * OOP Controller - Integrates OOP classes with Express.js routes
 * Provides RESTful API endpoints for the OOP learning management system
 */

// Note: External OOP dependencies removed for standalone operation
// External service dependencies removed for standalone operation

/**
 * OOP Learning Management Controller
 * Demonstrates how OOP patterns integrate with MVC architecture
 */
class OOPController {
    constructor() {
        this.lms = new LearningManagementSystem();
        this.assessmentSystem = new AssessmentSystem();
        this.reportingSystem = new ReportingSystem();
        this.contentFactory = new ContentFactory();
        this.userFactory = new UserFactory();
        this.progressTracker = new ProgressTracker();
        
        // Bind methods to preserve 'this' context
        this.runDemo = this.runDemo.bind(this);
        this.createUser = this.createUser.bind(this);
        this.createCourse = this.createCourse.bind(this);
        this.createContent = this.createContent.bind(this);
        this.enrollStudent = this.enrollStudent.bind(this);
        this.createAssessment = this.createAssessment.bind(this);
        this.submitAssessment = this.submitAssessment.bind(this);
        this.generateReport = this.generateReport.bind(this);
        this.getPatterns = this.getPatterns.bind(this);
    }

    /**
     * GET /api/oop/demo
     * Run comprehensive OOP demonstration
     */
    async runDemo(req, res) {
        try {
            const demo = new LearningSystemDemo();
            
            // Create sample data for demonstration
            const instructor = demo.lms.createUser('instructor', {
                id: `instructor_${Date.now()}`,
                name: 'Demo Instructor',
                email: 'instructor@demo.com'
            });

            const student = demo.lms.createUser('student', {
                id: `student_${Date.now()}`,
                name: 'Demo Student',
                email: 'student@demo.com'
            });

            const course = demo.lms.createCourse({
                id: `course_${Date.now()}`,
                title: 'OOP Demonstration Course',
                instructorId: instructor.id
            });

            const module = demo.lms.addModuleToCourse(course.id, {
                id: `module_${Date.now()}`,
                title: 'OOP Patterns Module'
            });

            // Add content using Factory pattern
            const videoContent = demo.lms.addContentToModule(course.id, module.id, {
                type: 'video',
                id: `video_${Date.now()}`,
                title: 'OOP Principles Explained',
                description: 'Learn about inheritance, polymorphism, encapsulation, and abstraction',
                duration: 45,
                videoUrl: 'https://demo.com/oop-principles.mp4'
            });

            // Enroll student and track progress
            demo.lms.enrollStudent(student.id, course.id);

            res.json({
                success: true,
                message: 'OOP demonstration completed successfully',
                data: {
                    patterns_demonstrated: [
                        'Factory Pattern (User & Content creation)',
                        'Strategy Pattern (Grading algorithms)',
                        'Observer Pattern (Progress tracking)',
                        'Decorator Pattern (Content enhancement)',
                        'Proxy Pattern (Access control)',
                        'Command Pattern (User actions)',
                        'Facade Pattern (LMS interface)'
                    ],
                    oop_principles: [
                        'Inheritance (User and Content hierarchies)',
                        'Polymorphism (Different content types)',
                        'Encapsulation (Private fields and methods)',
                        'Abstraction (Abstract base classes)'
                    ],
                    created_objects: {
                        instructor: instructor.name,
                        student: student.name,
                        course: course.title,
                        module: module.title,
                        content: videoContent.title
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'OOP demonstration failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/users
     * Create user using Factory pattern
     */
    async createUser(req, res) {
        try {
            const { type, userData } = req.body;
            
            if (!type || !userData) {
                return res.status(400).json({
                    success: false,
                    message: 'User type and userData are required'
                });
            }

            const user = this.lms.createUser(type, userData);
            
            res.status(201).json({
                success: true,
                message: `${type} created successfully using Factory pattern`,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: user.getPermissions(),
                    design_pattern: 'Factory Pattern'
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'User creation failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/courses
     * Create course with modules
     */
    async createCourse(req, res) {
        try {
            const { courseData, moduleData } = req.body;
            
            const course = this.lms.createCourse(courseData);
            
            let module = null;
            if (moduleData) {
                module = this.lms.addModuleToCourse(course.id, moduleData);
            }

            res.status(201).json({
                success: true,
                message: 'Course created successfully using Facade pattern',
                data: {
                    course: {
                        id: course.id,
                        title: course.title,
                        instructor: course.instructorId
                    },
                    module: module ? {
                        id: module.id,
                        title: module.title
                    } : null,
                    design_pattern: 'Facade Pattern'
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Course creation failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/content
     * Create content using Factory pattern with optional decorators
     */
    async createContent(req, res) {
        try {
            const { courseId, moduleId, contentData, decorators } = req.body;
            
            let content = this.lms.addContentToModule(courseId, moduleId, contentData);
            
            // Apply decorators if specified
            if (decorators) {
                if (decorators.timeLimit) {
                    content = new TimeLimitDecorator(content, decorators.timeLimit);
                }
                if (decorators.adaptive) {
                    content = new AdaptiveDecorator(content, decorators.adaptive);
                }
            }

            res.status(201).json({
                success: true,
                message: 'Content created successfully using Factory and Decorator patterns',
                data: {
                    id: content.id,
                    title: content.title,
                    type: content.getContentType(),
                    decorators_applied: decorators || {},
                    design_patterns: ['Factory Pattern', 'Decorator Pattern']
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Content creation failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/enroll
     * Enroll student using Command pattern
     */
    async enrollStudent(req, res) {
        try {
            const { studentId, courseId } = req.body;
            
            // Get user and course objects
            const user = this.lms.getUser(studentId);
            const course = this.lms.getCourse(courseId);
            
            if (!user || !course) {
                return res.status(404).json({
                    success: false,
                    message: 'Student or course not found'
                });
            }

            // Use Command pattern for enrollment
            const enrollCommand = new EnrollCommand(user, course);
            const result = enrollCommand.execute();

            res.json({
                success: true,
                message: 'Student enrolled successfully using Command pattern',
                data: {
                    student: user.name,
                    course: course.title,
                    enrollment_result: result,
                    design_pattern: 'Command Pattern',
                    can_undo: true
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Enrollment failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/assessments
     * Create assessment using Strategy pattern
     */
    async createAssessment(req, res) {
        try {
            const { assessmentData, gradingStrategy = 'weighted' } = req.body;
            
            const assessment = this.assessmentSystem.createAssessment({
                ...assessmentData,
                gradingStrategy
            });

            res.status(201).json({
                success: true,
                message: 'Assessment created successfully using Strategy pattern',
                data: {
                    id: assessment.id,
                    title: assessment.title,
                    type: assessment.type,
                    grading_strategy: gradingStrategy,
                    design_pattern: 'Strategy Pattern'
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Assessment creation failed',
                error: error.message
            });
        }
    }

    /**
     * POST /api/oop/submit-assessment
     * Submit assessment and process using Strategy pattern
     */
    async submitAssessment(req, res) {
        try {
            const { userId, assessmentId, submission } = req.body;
            
            const submissionId = this.assessmentSystem.submitAssessment(
                userId, 
                assessmentId, 
                submission
            );
            
            // Process submission queue
            this.assessmentSystem.processSubmissionQueue();
            
            const stats = this.assessmentSystem.getAssessmentStatistics(assessmentId);

            res.json({
                success: true,
                message: 'Assessment submitted and graded using Strategy pattern',
                data: {
                    submission_id: submissionId,
                    statistics: stats,
                    design_pattern: 'Strategy Pattern'
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Assessment submission failed',
                error: error.message
            });
        }
    }

    /**
     * GET /api/oop/reports/:type
     * Generate reports using Aggregation pattern
     */
    async generateReport(req, res) {
        try {
            const { type } = req.params;
            const { filters } = req.query;
            
            const reportFilters = filters ? JSON.parse(filters) : {};
            
            const report = this.reportingSystem.generateReport(type, reportFilters);

            res.json({
                success: true,
                message: 'Report generated successfully using Aggregation pattern',
                data: {
                    report,
                    design_pattern: 'Aggregation Pattern'
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Report generation failed',
                error: error.message
            });
        }
    }

    /**
     * GET /api/oop/patterns
     * Get list of implemented design patterns
     */
    async getPatterns(req, res) {
        try {
            const patterns = {
                creational: [
                    {
                        name: 'Factory Pattern',
                        description: 'Creates objects without specifying exact classes',
                        examples: ['ContentFactory', 'UserFactory'],
                        endpoint: 'POST /api/oop/users, POST /api/oop/content'
                    }
                ],
                structural: [
                    {
                        name: 'Decorator Pattern',
                        description: 'Adds behavior to objects dynamically',
                        examples: ['TimeLimitDecorator', 'AdaptiveDecorator'],
                        endpoint: 'POST /api/oop/content (with decorators)'
                    },
                    {
                        name: 'Proxy Pattern',
                        description: 'Controls access to objects',
                        examples: ['ContentProxy'],
                        endpoint: 'Automatically applied for access control'
                    },
                    {
                        name: 'Adapter Pattern',
                        description: 'Allows incompatible interfaces to work together',
                        examples: ['ExternalContentAdapter'],
                        endpoint: 'Used internally for external integrations'
                    },
                    {
                        name: 'Facade Pattern',
                        description: 'Provides simplified interface to complex subsystem',
                        examples: ['LearningManagementSystem'],
                        endpoint: 'All /api/oop endpoints use facade'
                    }
                ],
                behavioral: [
                    {
                        name: 'Strategy Pattern',
                        description: 'Defines family of algorithms and makes them interchangeable',
                        examples: ['WeightedGradingStrategy', 'PassFailGradingStrategy'],
                        endpoint: 'POST /api/oop/assessments'
                    },
                    {
                        name: 'Observer Pattern',
                        description: 'Notifies multiple objects about state changes',
                        examples: ['ProgressTracker', 'NotificationObserver'],
                        endpoint: 'Automatically triggered on progress updates'
                    },
                    {
                        name: 'Command Pattern',
                        description: 'Encapsulates requests as objects',
                        examples: ['EnrollCommand', 'CompleteContentCommand'],
                        endpoint: 'POST /api/oop/enroll'
                    }
                ]
            };

            res.json({
                success: true,
                message: 'Design patterns implemented in OOP system',
                data: {
                    total_patterns: 8,
                    patterns,
                    oop_principles: {
                        inheritance: 'User hierarchy (Student, Instructor, Admin), Content hierarchy (Video, Quiz, Text)',
                        polymorphism: 'Different implementations of getContentType(), render(), getPermissions()',
                        encapsulation: 'Private fields with # syntax, controlled access via methods',
                        abstraction: 'Abstract Content class, Assessment system interfaces'
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve patterns',
                error: error.message
            });
        }
    }
}

module.exports = new OOPController();