/**
 * Simplified Learning Management Controllers
 * Demonstrates how the simplified MVC framework works with real learning management features
 */

const { BaseController, MVCFactory } = require('../services/SimplifiedMVC');
const { ValidationFactory, LMSBusinessRules } = require('../services/ValidationStrategies');

/**
 * User Controller - Manages user operations with simplified MVC
 */
class SimplifiedUserController extends BaseController {
    constructor(userService, userModel) {
        super();
        this.userService = userService;
        this.userModel = userModel;
        
        // Set up validation strategies for different endpoints
        this.setValidator('/api/users', ValidationFactory.createSchemaValidator('USER_CREATION'));
        
        // Add business rule validation
        const businessRules = ValidationFactory.createBusinessRuleValidator([
            LMSBusinessRules.emailNotExists(userModel)
        ]);
        
        this.setValidator('/api/users/register', 
            ValidationFactory.createCompositeValidator([
                ValidationFactory.createSchemaValidator('USER_CREATION'),
                businessRules
            ])
        );
    }

    async execute(req, res) {
        const { method, path } = req;
        
        switch (`${method} ${path}`) {
            case 'POST /api/users':
                return await this.createUser(req.body);
            
            case 'GET /api/users/:id':
                return await this.getUser(req.params.id);
            
            case 'PUT /api/users/:id':
                return await this.updateUser(req.params.id, req.body);
            
            case 'DELETE /api/users/:id':
                return await this.deleteUser(req.params.id);
            
            case 'GET /api/users':
                return await this.listUsers(req.query);
            
            default:
                throw new Error(`Unsupported operation: ${method} ${path}`);
        }
    }

    async createUser(userData) {
        // Use service layer with strategy pattern
        return await this.userService.execute('create', userData, {
            strategy: 'default_creation',
            sendWelcomeEmail: true
        });
    }

    async getUser(userId) {
        return await this.userService.execute('get', { id: userId });
    }

    async updateUser(userId, updates) {
        return await this.userService.execute('update', { id: userId, ...updates });
    }

    async deleteUser(userId) {
        return await this.userService.execute('delete', { id: userId });
    }

    async listUsers(filters) {
        return await this.userService.execute('list', filters, {
            strategy: 'paginated_list'
        });
    }

    // Override template methods for specific behavior
    async preProcess(req, res) {
        await super.preProcess(req, res);
        
        // Add user-specific preprocessing
        if (req.body && req.body.email) {
            req.body.email = req.body.email.toLowerCase().trim();
        }
        
        console.log(`🔐 Processing user request: ${req.method} ${req.path}`);
    }

    async authorize(req, res) {
        // Simple authorization logic
        const { method, path } = req;
        
        if (method === 'DELETE') {
            // Only admins can delete users
            if (!req.user || req.user.role !== 'admin') {
                const error = new Error('Admin access required');
                error.status = 403;
                throw error;
            }
        }
        
        return true;
    }

    async postProcess(result, req, res) {
        // Remove sensitive information from response
        if (result && result.password) {
            delete result.password;
        }
        
        if (Array.isArray(result)) {
            result = result.map(user => {
                const { password, ...safeUser } = user;
                return safeUser;
            });
        }
        
        return result;
    }
}

/**
 * Course Controller - Manages course operations
 */
class SimplifiedCourseController extends BaseController {
    constructor(courseService, courseModel, userModel) {
        super();
        this.courseService = courseService;
        this.courseModel = courseModel;
        this.userModel = userModel;
        
        // Set up validations
        this.setValidator('/api/courses', 
            ValidationFactory.createCompositeValidator([
                ValidationFactory.createSchemaValidator('COURSE_CREATION'),
                ValidationFactory.createBusinessRuleValidator([
                    LMSBusinessRules.instructorExists(userModel)
                ])
            ])
        );
    }

    async execute(req, res) {
        const { method, path } = req;
        
        switch (`${method} ${path}`) {
            case 'POST /api/courses':
                return await this.createCourse(req.body);
            
            case 'GET /api/courses/:id':
                return await this.getCourse(req.params.id);
            
            case 'PUT /api/courses/:id':
                return await this.updateCourse(req.params.id, req.body);
            
            case 'DELETE /api/courses/:id':
                return await this.deleteCourse(req.params.id);
            
            case 'GET /api/courses':
                return await this.listCourses(req.query);
            
            case 'POST /api/courses/:id/enroll':
                return await this.enrollUser(req.params.id, req.body.userId);
            
            default:
                throw new Error(`Unsupported operation: ${method} ${path}`);
        }
    }

    async createCourse(courseData) {
        return await this.courseService.execute('create', courseData, {
            strategy: 'full_course_creation',
            createDefaultModules: true
        });
    }

    async getCourse(courseId) {
        return await this.courseService.execute('get', { id: courseId }, {
            includeModules: true,
            includeProgress: true
        });
    }

    async updateCourse(courseId, updates) {
        return await this.courseService.execute('update', { id: courseId, ...updates });
    }

    async deleteCourse(courseId) {
        return await this.courseService.execute('delete', { id: courseId });
    }

    async listCourses(filters) {
        return await this.courseService.execute('list', filters, {
            strategy: 'filtered_list',
            includeStats: true
        });
    }

    async enrollUser(courseId, userId) {
        return await this.courseService.execute('enroll', { courseId, userId }, {
            strategy: 'enrollment_with_notifications'
        });
    }

    async authorize(req, res) {
        const { method, path } = req;
        
        // Instructors can only modify their own courses
        if (['PUT', 'DELETE'].includes(method) && path.includes('/api/courses/')) {
            const courseId = req.params.id;
            const course = await this.courseModel.findById(courseId);
            
            if (req.user.role === 'instructor' && course.instructorId !== req.user.id) {
                const error = new Error('Can only modify your own courses');
                error.status = 403;
                throw error;
            }
        }
        
        return true;
    }
}

/**
 * Progress Controller - Manages learning progress
 */
class SimplifiedProgressController extends BaseController {
    constructor(progressService) {
        super();
        this.progressService = progressService;
        
        this.setValidator('/api/progress', ValidationFactory.createSchemaValidator('PROGRESS_UPDATE'));
    }

    async execute(req, res) {
        const { method, path } = req;
        
        switch (`${method} ${path}`) {
            case 'POST /api/progress':
                return await this.updateProgress(req.body);
            
            case 'GET /api/progress/user/:userId':
                return await this.getUserProgress(req.params.userId, req.query);
            
            case 'GET /api/progress/course/:courseId':
                return await this.getCourseProgress(req.params.courseId, req.query);
            
            case 'GET /api/progress/analytics':
                return await this.getAnalytics(req.query);
            
            default:
                throw new Error(`Unsupported operation: ${method} ${path}`);
        }
    }

    async updateProgress(progressData) {
        return await this.progressService.execute('update', progressData, {
            strategy: 'progress_with_milestones',
            notifyObservers: true
        });
    }

    async getUserProgress(userId, filters) {
        return await this.progressService.execute('getUserProgress', { userId, ...filters });
    }

    async getCourseProgress(courseId, filters) {
        return await this.progressService.execute('getCourseProgress', { courseId, ...filters });
    }

    async getAnalytics(filters) {
        return await this.progressService.execute('analytics', filters, {
            strategy: 'comprehensive_analytics'
        });
    }
}

/**
 * Assessment Controller - Manages assessments and submissions
 */
class SimplifiedAssessmentController extends BaseController {
    constructor(assessmentService) {
        super();
        this.assessmentService = assessmentService;
        
        this.setValidator('/api/assessments/submit', 
            ValidationFactory.createSchemaValidator('ASSESSMENT_SUBMISSION'));
    }

    async execute(req, res) {
        const { method, path } = req;
        
        switch (`${method} ${path}`) {
            case 'POST /api/assessments':
                return await this.createAssessment(req.body);
            
            case 'GET /api/assessments/:id':
                return await this.getAssessment(req.params.id);
            
            case 'POST /api/assessments/:id/submit':
                return await this.submitAssessment(req.params.id, req.body);
            
            case 'GET /api/assessments/:id/results':
                return await this.getResults(req.params.id, req.query);
            
            default:
                throw new Error(`Unsupported operation: ${method} ${path}`);
        }
    }

    async createAssessment(assessmentData) {
        return await this.assessmentService.execute('create', assessmentData, {
            strategy: 'adaptive_assessment'
        });
    }

    async getAssessment(assessmentId) {
        return await this.assessmentService.execute('get', { id: assessmentId });
    }

    async submitAssessment(assessmentId, submission) {
        return await this.assessmentService.execute('submit', { 
            assessmentId, 
            ...submission 
        }, {
            strategy: 'auto_grading',
            provideFeedback: true
        });
    }

    async getResults(assessmentId, filters) {
        return await this.assessmentService.execute('getResults', { 
            assessmentId, 
            ...filters 
        });
    }
}

// Register controllers with the factory
MVCFactory.registerController('user', SimplifiedUserController);
MVCFactory.registerController('course', SimplifiedCourseController);
MVCFactory.registerController('progress', SimplifiedProgressController);
MVCFactory.registerController('assessment', SimplifiedAssessmentController);

module.exports = {
    SimplifiedUserController,
    SimplifiedCourseController,
    SimplifiedProgressController,
    SimplifiedAssessmentController
};