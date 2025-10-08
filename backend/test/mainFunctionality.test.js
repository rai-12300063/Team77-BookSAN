const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { expect } = chai;

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const LearningProgress = require('../models/LearningProgress');
const ModuleProgress = require('../models/ModuleProgress');

// Import controllers
const authController = require('../controllers/authController');
const courseController = require('../controllers/courseController');
const moduleController = require('../controllers/moduleController');
const quizController = require('../controllers/quizController');
const progressController = require('../controllers/progressController');
const studentController = require('../controllers/studentController');
const instructorController = require('../controllers/instructorController');
const adminController = require('../controllers/adminController');

// Configure chai
chai.use(chaiHttp);

// Mock Express
const mockReq = (data = {}) => {
  return { 
    body: data.body || {}, 
    params: data.params || {}, 
    query: data.query || {},
    user: data.user || null,
    headers: data.headers || {}
  };
};

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

describe('Online Learning Progress Tracker - Main Functionalities', function() {

  // Hook to run before all tests in this block
  before(async function() {
    // Establish a separate test database connection or use a mock
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Tests should be run in a test environment to avoid data loss!');
    }
    
    // Set up test data if needed
    console.log('Setting up test environment...');
  });

  // Hook to run after all tests in this block
  after(async function() {
    // Clean up test data, close connections, etc.
    console.log('Cleaning up test environment...');
    sinon.restore();
  });

  // Hook to run before each test
  beforeEach(function() {
    // Reset stubs, spies, etc.
    sinon.restore();
  });

  // 1. AUTH CONTROLLER TESTS
  describe('Authentication Controller', function() {
    describe('User Registration', function() {
      it('should register a new user with valid data', async function() {
        // Arrange
        const req = mockReq({
          body: {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
            role: 'student'
          }
        });
        const res = mockRes();
        
        // Mock User.findOne to simulate email doesn't exist yet
        sinon.stub(User, 'findOne').resolves(null);
        
        // Mock User.create to simulate successful creation
        sinon.stub(User, 'create').resolves({
          _id: '123456789',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student'
        });
        
        // Mock JWT token generation
        sinon.stub(jwt, 'sign').returns('test-token');
        
        // Act
        await authController.registerUser(req, res);
        
        // Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.property('token');
        expect(responseData).to.have.property('user');
      });

      it('should return error when trying to register with existing email', async function() {
        // Arrange
        const req = mockReq({
          body: {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Password123'
          }
        });
        const res = mockRes();
        
        // Mock User.findOne to simulate email already exists
        sinon.stub(User, 'findOne').resolves({
          _id: '987654321',
          email: 'existing@example.com'
        });
        
        // Act
        await authController.registerUser(req, res);
        
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.message).to.include('already exists');
      });

      it('should validate required fields during registration', async function() {
        // Arrange
        const req = mockReq({
          body: {
            // Missing required fields
            name: 'Incomplete User'
            // email and password missing
          }
        });
        const res = mockRes();
        
        // Act
        await authController.registerUser(req, res);
        
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });

    describe('User Login', function() {
      it('should login user with correct credentials and return token', async function() {
        // Arrange
        const req = mockReq({
          body: {
            email: 'user@example.com',
            password: 'correctPassword'
          }
        });
        const res = mockRes();
        
        // Mock User.findOne
        sinon.stub(User, 'findOne').resolves({
          _id: '123456789',
          email: 'user@example.com',
          name: 'Valid User',
          password: 'hashedPassword',
          role: 'student',
          matchPassword: sinon.stub().resolves(true)
        });
        
        // Mock JWT token generation
        sinon.stub(jwt, 'sign').returns('login-test-token');
        
        // Act
        await authController.loginUser(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.property('token', 'login-test-token');
      });

      it('should reject login with incorrect email', async function() {
        // Arrange
        const req = mockReq({
          body: {
            email: 'nonexistent@example.com',
            password: 'anyPassword'
          }
        });
        const res = mockRes();
        
        // Mock User.findOne to return null (user not found)
        sinon.stub(User, 'findOne').resolves(null);
        
        // Act
        await authController.loginUser(req, res);
        
        // Assert
        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.message).to.include('Invalid');
      });

      it('should reject login with incorrect password', async function() {
        // Arrange
        const req = mockReq({
          body: {
            email: 'user@example.com',
            password: 'wrongPassword'
          }
        });
        const res = mockRes();
        
        // Mock User.findOne
        sinon.stub(User, 'findOne').resolves({
          _id: '123456789',
          email: 'user@example.com',
          password: 'hashedCorrectPassword',
          matchPassword: sinon.stub().resolves(false) // Password doesn't match
        });
        
        // Act
        await authController.loginUser(req, res);
        
        // Assert
        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });

    describe('Get User Profile', function() {
      it('should return user profile when authenticated', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: '123456789' }
        });
        const res = mockRes();
        
        // Mock User.findById
        sinon.stub(User, 'findById').resolves({
          _id: '123456789',
          name: 'Profile User',
          email: 'profile@example.com',
          role: 'student',
          toObject: () => ({
            _id: '123456789',
            name: 'Profile User',
            email: 'profile@example.com',
            role: 'student'
          })
        });
        
        // Act
        await authController.getUserProfile(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.name).to.equal('Profile User');
      });

      it('should return error if user not found', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'nonexistentId' }
        });
        const res = mockRes();
        
        // Mock User.findById to return null
        sinon.stub(User, 'findById').resolves(null);
        
        // Act
        await authController.getUserProfile(req, res);
        
        // Assert
        expect(res.status.calledWith(404)).to.be.true;
      });
    });
  });

  // 2. COURSE CONTROLLER TESTS
  describe('Course Controller', function() {
    describe('Get Courses', function() {
      it('should get all courses with pagination', async function() {
        // Arrange
        const req = mockReq({
          query: { page: 1, limit: 10 }
        });
        const res = mockRes();
        
        // Mock data
        const mockCourses = [
          { _id: 'course1', title: 'Course 1', description: 'Description 1' },
          { _id: 'course2', title: 'Course 2', description: 'Description 2' }
        ];
        
        // Mock Course.find
        const countStub = sinon.stub().resolves(20);
        const limitStub = sinon.stub().returns({ skip: sinon.stub().returns({ exec: sinon.stub().resolves(mockCourses) }) });
        const sortStub = sinon.stub().returns({ limit: limitStub });
        const findStub = sinon.stub(Course, 'find').returns({ sort: sortStub, countDocuments: countStub });
        
        // Act
        await courseController.getCourses(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.courses).to.have.lengthOf(2);
        expect(responseData.totalPages).to.equal(2);
      });

      it('should filter courses by category', async function() {
        // Arrange
        const req = mockReq({
          query: { category: 'programming' }
        });
        const res = mockRes();
        
        // Mock Course.find
        const mockCourses = [
          { _id: 'course1', title: 'Programming 101', category: 'programming' }
        ];
        
        const countStub = sinon.stub().resolves(1);
        const limitStub = sinon.stub().returns({ skip: sinon.stub().returns({ exec: sinon.stub().resolves(mockCourses) }) });
        const sortStub = sinon.stub().returns({ limit: limitStub });
        const findStub = sinon.stub(Course, 'find').returns({ sort: sortStub, countDocuments: countStub });
        
        // Act
        await courseController.getCourses(req, res);
        
        // Assert
        expect(findStub.calledWith(sinon.match({ category: 'programming' }))).to.be.true;
        expect(res.status.calledWith(200)).to.be.true;
      });
    });

    describe('Get Course by ID', function() {
      it('should get a specific course by ID', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { id: courseId }
        });
        const res = mockRes();
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          title: 'Test Course',
          description: 'Test Description',
          modules: ['module1', 'module2'],
          populate: function() { return this; }
        });
        
        // Act
        await courseController.getCourseById(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });

      it('should return 404 when course is not found', async function() {
        // Arrange
        const req = mockReq({
          params: { id: 'nonexistentCourse' }
        });
        const res = mockRes();
        
        // Mock Course.findById to return null
        sinon.stub(Course, 'findById').resolves(null);
        
        // Act
        await courseController.getCourseById(req, res);
        
        // Assert
        expect(res.status.calledWith(404)).to.be.true;
      });
    });

    describe('Create Course', function() {
      it('should create a new course when user is instructor or admin', async function() {
        // Arrange
        const req = mockReq({
          body: {
            title: 'New Course',
            description: 'Course Description',
            category: 'technology'
          },
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.create
        sinon.stub(Course, 'create').resolves({
          _id: 'newCourse123',
          title: 'New Course',
          description: 'Course Description',
          instructor: 'instructor123'
        });
        
        // Act
        await courseController.createCourse(req, res);
        
        // Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });

      it('should prevent students from creating courses', async function() {
        // Arrange
        const req = mockReq({
          body: {
            title: 'Unauthorized Course',
            description: 'Description'
          },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Act
        await courseController.createCourse(req, res);
        
        // Assert
        expect(res.status.calledWith(403)).to.be.true;
      });
    });
  });

  // 3. MODULE CONTROLLER TESTS
  describe('Module Controller', function() {
    describe('Get Modules for Course', function() {
      it('should get all modules for a specific course', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { courseId }
        });
        const res = mockRes();
        
        // Mock data
        const mockModules = [
          { _id: 'module1', title: 'Module 1', content: 'Content 1' },
          { _id: 'module2', title: 'Module 2', content: 'Content 2' }
        ];
        
        // Mock Module.find
        sinon.stub(Module, 'find').resolves(mockModules);
        
        // Act
        await moduleController.getModulesByCourse(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.lengthOf(2);
      });
    });

    describe('Create Module', function() {
      it('should allow instructors to create modules for their courses', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { courseId },
          body: {
            title: 'New Module',
            content: 'Module Content',
            order: 1
          },
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          instructor: 'instructor123'
        });
        
        // Mock Module.create
        sinon.stub(Module, 'create').resolves({
          _id: 'newModule123',
          title: 'New Module',
          content: 'Module Content',
          course: courseId,
          order: 1
        });
        
        // Mock Course.updateOne
        sinon.stub(Course, 'updateOne').resolves({ nModified: 1 });
        
        // Act
        await moduleController.createModule(req, res);
        
        // Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });

      it('should prevent unauthorized users from creating modules', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { courseId },
          body: {
            title: 'Unauthorized Module',
            content: 'Content'
          },
          user: { _id: 'otherInstructor', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.findById - different instructor
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          instructor: 'instructor123' // Different from req.user._id
        });
        
        // Act
        await moduleController.createModule(req, res);
        
        // Assert
        expect(res.status.calledWith(403)).to.be.true;
      });
    });
  });

  // 4. QUIZ CONTROLLER TESTS
  describe('Quiz Controller', function() {
    describe('Create Quiz', function() {
      it('should create a quiz for a module', async function() {
        // Arrange
        const moduleId = 'module123';
        const req = mockReq({
          params: { moduleId },
          body: {
            title: 'Test Quiz',
            description: 'Quiz Description',
            timeLimit: 30,
            questions: [
              {
                text: 'Question 1?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 0
              }
            ]
          },
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Module.findById
        sinon.stub(Module, 'findById').resolves({
          _id: moduleId,
          course: 'course123'
        });
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: 'course123',
          instructor: 'instructor123'
        });
        
        // Mock Quiz.create
        sinon.stub(Quiz, 'create').resolves({
          _id: 'quiz123',
          title: 'Test Quiz',
          module: moduleId,
          questions: [{ text: 'Question 1?' }]
        });
        
        // Mock Module.updateOne
        sinon.stub(Module, 'updateOne').resolves({ nModified: 1 });
        
        // Act
        await quizController.createQuiz(req, res);
        
        // Assert
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });

    describe('Submit Quiz Attempt', function() {
      it('should process a student quiz submission and calculate score', async function() {
        // Arrange
        const quizId = 'quiz123';
        const req = mockReq({
          params: { quizId },
          body: {
            answers: [0, 1, 2] // Student answers
          },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock Quiz.findById
        sinon.stub(Quiz, 'findById').resolves({
          _id: quizId,
          questions: [
            { correctAnswer: 0 },
            { correctAnswer: 1 },
            { correctAnswer: 0 } // This one is wrong in submission
          ],
          module: 'module123'
        });
        
        // Mock QuizAttempt.create
        const quizAttemptStub = sinon.stub(mongoose.model('QuizAttempt'), 'create').resolves({
          _id: 'attempt123',
          quiz: quizId,
          student: 'student123',
          score: 2, // 2 out of 3 correct
          answers: [0, 1, 2]
        });
        
        // Mock ModuleProgress.findOneAndUpdate
        sinon.stub(ModuleProgress, 'findOneAndUpdate').resolves({
          _id: 'progress123',
          module: 'module123',
          student: 'student123',
          quizCompleted: true,
          quizScore: 2/3
        });
        
        // Act
        await quizController.submitQuizAttempt(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.property('score');
      });
    });
  });

  // 5. PROGRESS CONTROLLER TESTS
  describe('Progress Controller', function() {
    describe('Start Module', function() {
      it('should mark a module as started for a student', async function() {
        // Arrange
        const moduleId = 'module123';
        const req = mockReq({
          params: { moduleId },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock Module.findById
        sinon.stub(Module, 'findById').resolves({
          _id: moduleId,
          course: 'course123'
        });
        
        // Mock LearningProgress.findOne
        sinon.stub(LearningProgress, 'findOne').resolves({
          _id: 'progress123',
          student: 'student123',
          course: 'course123',
          enrollmentDate: new Date(),
          lastAccessDate: new Date()
        });
        
        // Mock ModuleProgress.findOneAndUpdate
        sinon.stub(ModuleProgress, 'findOneAndUpdate').resolves({
          _id: 'moduleProgress123',
          module: moduleId,
          student: 'student123',
          started: true,
          startDate: new Date()
        });
        
        // Act
        await progressController.startModule(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });

    describe('Complete Module', function() {
      it('should mark a module as completed for a student', async function() {
        // Arrange
        const moduleId = 'module123';
        const req = mockReq({
          params: { moduleId },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock Module.findById
        sinon.stub(Module, 'findById').resolves({
          _id: moduleId,
          course: 'course123'
        });
        
        // Mock ModuleProgress.findOneAndUpdate
        sinon.stub(ModuleProgress, 'findOneAndUpdate').resolves({
          _id: 'moduleProgress123',
          module: moduleId,
          student: 'student123',
          completed: true,
          completionDate: new Date()
        });
        
        // Mock LearningProgress.findOneAndUpdate
        sinon.stub(LearningProgress, 'findOneAndUpdate').resolves({
          _id: 'progress123',
          student: 'student123',
          course: 'course123',
          progress: 0.5 // 50% completed
        });
        
        // Act
        await progressController.completeModule(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });

    describe('Get Student Progress', function() {
      it('should get progress summary for a student across all courses', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock LearningProgress.find
        sinon.stub(LearningProgress, 'find').resolves([
          { 
            course: { _id: 'course1', title: 'Course 1' },
            progress: 0.75,
            completedModules: 3,
            totalModules: 4
          },
          {
            course: { _id: 'course2', title: 'Course 2' },
            progress: 0.5,
            completedModules: 2,
            totalModules: 4
          }
        ]);
        
        // Act
        await progressController.getStudentProgress(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.lengthOf(2);
      });
    });
  });

  // 6. STUDENT CONTROLLER TESTS
  describe('Student Controller', function() {
    describe('Enroll in Course', function() {
      it('should enroll a student in a course', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { id: courseId },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          title: 'Test Course',
          modules: ['module1', 'module2']
        });
        
        // Mock LearningProgress.findOne (to check if already enrolled)
        sinon.stub(LearningProgress, 'findOne').resolves(null);
        
        // Mock LearningProgress.create
        sinon.stub(LearningProgress, 'create').resolves({
          _id: 'progress123',
          student: 'student123',
          course: courseId,
          enrollmentDate: new Date()
        });
        
        // Act
        await studentController.enrollInCourse(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });

      it('should prevent duplicate enrollment', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { id: courseId },
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          title: 'Test Course'
        });
        
        // Mock LearningProgress.findOne (already enrolled)
        sinon.stub(LearningProgress, 'findOne').resolves({
          _id: 'existingProgress',
          student: 'student123',
          course: courseId
        });
        
        // Act
        await studentController.enrollInCourse(req, res);
        
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.message).to.include('already enrolled');
      });
    });

    describe('Get Enrolled Courses', function() {
      it('should get all courses a student is enrolled in', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'student123', role: 'student' }
        });
        const res = mockRes();
        
        // Mock LearningProgress.find with populated courses
        sinon.stub(LearningProgress, 'find').resolves([
          { 
            course: {
              _id: 'course1',
              title: 'Course 1',
              description: 'Description 1'
            },
            progress: 0.5
          },
          {
            course: {
              _id: 'course2',
              title: 'Course 2',
              description: 'Description 2'
            },
            progress: 0.25
          }
        ]);
        
        // Act
        await studentController.getEnrolledCourses(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.lengthOf(2);
      });
    });
  });

  // 7. INSTRUCTOR CONTROLLER TESTS
  describe('Instructor Controller', function() {
    describe('Get Instructor Courses', function() {
      it('should get all courses created by an instructor', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.find
        sinon.stub(Course, 'find').resolves([
          { _id: 'course1', title: 'Course 1', description: 'Description 1' },
          { _id: 'course2', title: 'Course 2', description: 'Description 2' }
        ]);
        
        // Act
        await instructorController.getInstructorCourses(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.lengthOf(2);
      });
    });

    describe('Get Course Students', function() {
      it('should get all students enrolled in a specific course', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { courseId },
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.findById
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          instructor: 'instructor123'
        });
        
        // Mock LearningProgress.find with populated student info
        sinon.stub(LearningProgress, 'find').resolves([
          {
            student: { _id: 'student1', name: 'Student One', email: 'student1@example.com' },
            progress: 0.75
          },
          {
            student: { _id: 'student2', name: 'Student Two', email: 'student2@example.com' },
            progress: 0.5
          }
        ]);
        
        // Act
        await instructorController.getCourseStudents(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData).to.have.lengthOf(2);
      });

      it('should prevent unauthorized access to student data', async function() {
        // Arrange
        const courseId = 'course123';
        const req = mockReq({
          params: { courseId },
          user: { _id: 'otherInstructor', role: 'instructor' }
        });
        const res = mockRes();
        
        // Mock Course.findById (different instructor)
        sinon.stub(Course, 'findById').resolves({
          _id: courseId,
          instructor: 'instructor123' // Not matching req.user._id
        });
        
        // Act
        await instructorController.getCourseStudents(req, res);
        
        // Assert
        expect(res.status.calledWith(403)).to.be.true;
      });
    });
  });

  // 8. ADMIN CONTROLLER TESTS
  describe('Admin Controller', function() {
    describe('Get All Users', function() {
      it('should get all users when admin is authenticated', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'admin123', role: 'admin' },
          query: { page: 1, limit: 10 }
        });
        const res = mockRes();
        
        // Mock users data
        const mockUsers = [
          { _id: 'user1', name: 'User One', email: 'user1@example.com', role: 'student' },
          { _id: 'user2', name: 'User Two', email: 'user2@example.com', role: 'instructor' },
          { _id: 'user3', name: 'User Three', email: 'user3@example.com', role: 'admin' }
        ];
        
        // Mock User.find
        const countStub = sinon.stub().resolves(3);
        const limitStub = sinon.stub().returns({ skip: sinon.stub().returns({ exec: sinon.stub().resolves(mockUsers) }) });
        const sortStub = sinon.stub().returns({ limit: limitStub });
        const findStub = sinon.stub(User, 'find').returns({ sort: sortStub, countDocuments: countStub });
        
        // Act
        await adminController.getAllUsers(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        const responseData = res.json.getCall(0).args[0];
        expect(responseData.users).to.have.lengthOf(3);
      });

      it('should deny access to non-admin users', async function() {
        // Arrange
        const req = mockReq({
          user: { _id: 'instructor123', role: 'instructor' }
        });
        const res = mockRes();
        
        // Act
        await adminController.getAllUsers(req, res);
        
        // Assert
        expect(res.status.calledWith(403)).to.be.true;
      });
    });

    describe('Update User Role', function() {
      it('should allow admin to update user roles', async function() {
        // Arrange
        const userId = 'user123';
        const req = mockReq({
          params: { id: userId },
          body: { role: 'instructor' },
          user: { _id: 'admin123', role: 'admin' }
        });
        const res = mockRes();
        
        // Mock User.findById
        sinon.stub(User, 'findById').resolves({
          _id: userId,
          name: 'Target User',
          email: 'target@example.com',
          role: 'student'
        });
        
        // Mock User.findByIdAndUpdate
        sinon.stub(User, 'findByIdAndUpdate').resolves({
          _id: userId,
          name: 'Target User',
          email: 'target@example.com',
          role: 'instructor' // Updated role
        });
        
        // Act
        await adminController.updateUserRole(req, res);
        
        // Assert
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
      });
    });
  });
});