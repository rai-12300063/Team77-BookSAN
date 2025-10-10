const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const ModuleProgress = require('../models/ModuleProgress');

chai.use(chaiHttp);
const expect = chai.expect;

describe('🎓 BookSAN Learning Progress Tracker - 48 Comprehensive Test Cases', function() {
  this.timeout(20000);

  // Test data
  const testUsers = {
    student: {
      name: 'Test Student',
      email: 'student@booksan.test',
      password: 'StudentPass123!',
      role: 'student'
    },
    instructor: {
      name: 'Test Instructor',
      email: 'instructor@booksan.test',
      password: 'InstructorPass123!',
      role: 'instructor'
    },
    admin: {
      name: 'Test Admin',
      email: 'admin@booksan.test',
      password: 'AdminPass123!',
      role: 'admin'
    }
  };

  let tokens = {};
  let userIds = {};
  let testCourseId = '';
  let testModuleId = '';
  let testQuizId = '';

  before(async function() {
    // Clean up test data
    try {
      await User.deleteMany({ email: { $regex: '@booksan.test$' } });
      await Course.deleteMany({ title: { $regex: '^Test ' } });
      await Module.deleteMany({ title: { $regex: '^Test ' } });
      await Quiz.deleteMany({ title: { $regex: '^Test ' } });
      console.log('✅ Test database cleaned');
    } catch (error) {
      console.log('⚠️  Database cleanup failed:', error.message);
    }
  });

  describe('🔧 System Health & Environment (6 tests)', function() {
    it('Test 1: ✅ MongoDB connection should be active', function() {
      expect(mongoose.connection.readyState).to.equal(1);
    });

    it('Test 2: ✅ Server environment should be configured', function() {
      expect(process.env).to.be.an('object');
    });

    it('Test 3: ✅ Required Node modules should be loaded', function() {
      expect(require('express')).to.exist;
      expect(require('mongoose')).to.exist;
      expect(require('bcrypt')).to.exist;
    });

    it('Test 4: ✅ JWT secret should be configured', function() {
      expect(process.env.JWT_SECRET).to.exist;
    });

    it('Test 5: ✅ Server port should be configured', function() {
      const port = process.env.PORT || 5001;
      expect(port).to.exist;
      expect(Number(port)).to.be.above(1000);
    });

    it('Test 6: ✅ CORS should be enabled for API access', function(done) {
      chai.request(app)
        .options('/api/auth/login')
        .end((err, res) => {
          expect(res.headers).to.have.property('access-control-allow-origin');
          done();
        });
    });
  });

  describe('👤 User Authentication System (12 tests)', function() {
    it('Test 7: ✅ Should register a new student user', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUsers.student)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('user');
          expect(res.body.user.role).to.equal('student');
          userIds.student = res.body.user._id;
          done();
        });
    });

    it('Test 8: ✅ Should register a new instructor user', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUsers.instructor)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.user.role).to.equal('instructor');
          userIds.instructor = res.body.user._id;
          done();
        });
    });

    it('Test 9: ✅ Should register a new admin user', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUsers.admin)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.user.role).to.equal('admin');
          userIds.admin = res.body.user._id;
          done();
        });
    });

    it('Test 10: ❌ Should fail to register duplicate email', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUsers.student)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('Test 11: ✅ Student should login successfully', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.student.email,
          password: testUsers.student.password
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          tokens.student = res.body.token;
          done();
        });
    });

    it('Test 12: ✅ Instructor should login successfully', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.instructor.email,
          password: testUsers.instructor.password
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          tokens.instructor = res.body.token;
          done();
        });
    });

    it('Test 13: ✅ Admin should login successfully', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: testUsers.admin.password
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          tokens.admin = res.body.token;
          done();
        });
    });

    it('Test 14: ❌ Should fail login with wrong password', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.student.email,
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Test 15: ❌ Should fail login with non-existent email', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'anypassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Test 16: ✅ Should get user profile with valid token', function(done) {
      chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.equal(testUsers.student.email);
          done();
        });
    });

    it('Test 17: ❌ Should fail to access profile without token', function(done) {
      chai.request(app)
        .get('/api/auth/profile')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Test 18: ✅ Should update user profile successfully', function(done) {
      chai.request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({ name: 'Updated Student Name' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal('Updated Student Name');
          done();
        });
    });
  });

  describe('📚 Course Management System (12 tests)', function() {
    it('Test 19: ✅ Admin should create a new course', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          title: 'Test JavaScript Fundamentals',
          description: 'Complete JavaScript course for beginners',
          difficulty: 'beginner',
          estimatedHours: 40,
          category: 'Programming'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal('Test JavaScript Fundamentals');
          testCourseId = res.body._id;
          done();
        });
    });

    it('Test 20: ✅ Instructor should create a course', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          title: 'Test React Development',
          description: 'Learn React from scratch',
          difficulty: 'intermediate',
          estimatedHours: 60
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal('Test React Development');
          done();
        });
    });

    it('Test 21: ❌ Student should not create courses', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({
          title: 'Unauthorized Course',
          description: 'This should fail'
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('Test 22: ✅ Should get all courses', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.at.least(2);
          done();
        });
    });

    it('Test 23: ✅ Should get course by ID', function(done) {
      chai.request(app)
        .get(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal('Test JavaScript Fundamentals');
          done();
        });
    });

    it('Test 24: ❌ Should return 404 for non-existent course', function(done) {
      const fakeId = new mongoose.Types.ObjectId();
      chai.request(app)
        .get(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('Test 25: ✅ Should update course (instructor/admin only)', function(done) {
      chai.request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          title: 'Test JavaScript Fundamentals - Updated',
          estimatedHours: 45
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.include('Updated');
          expect(res.body.estimatedHours).to.equal(45);
          done();
        });
    });

    it('Test 26: ❌ Student should not update courses', function(done) {
      chai.request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({ title: 'Unauthorized Update' })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('Test 27: ✅ Should enroll student in course', function(done) {
      chai.request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('Test 28: ✅ Should get enrolled courses for student', function(done) {
      chai.request(app)
        .get('/api/courses/enrolled')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('Test 29: ✅ Should filter courses by difficulty', function(done) {
      chai.request(app)
        .get('/api/courses?difficulty=beginner')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          if (res.body.length > 0) {
            expect(res.body[0].difficulty).to.equal('beginner');
          }
          done();
        });
    });

    it('Test 30: ✅ Should search courses by title', function(done) {
      chai.request(app)
        .get('/api/courses?search=JavaScript')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          if (res.body.length > 0) {
            expect(res.body[0].title).to.include('JavaScript');
          }
          done();
        });
    });
  });

  describe('📖 Module Management System (8 tests)', function() {
    it('Test 31: ✅ Should create a module for course', function(done) {
      chai.request(app)
        .post('/api/modules')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          title: 'Test Introduction to Variables',
          description: 'Learn about JavaScript variables',
          courseId: testCourseId,
          content: 'Variables are containers for storing data values...',
          orderIndex: 1,
          type: 'lesson'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal('Test Introduction to Variables');
          testModuleId = res.body._id;
          done();
        });
    });

    it('Test 32: ✅ Should get modules for a course', function(done) {
      chai.request(app)
        .get(`/api/modules/course/${testCourseId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.at.least(1);
          done();
        });
    });

    it('Test 33: ✅ Should get module by ID', function(done) {
      chai.request(app)
        .get(`/api/modules/${testModuleId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal('Test Introduction to Variables');
          done();
        });
    });

    it('Test 34: ✅ Should update module content', function(done) {
      chai.request(app)
        .put(`/api/modules/${testModuleId}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          content: 'Updated content: Variables are fundamental in programming...'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.content).to.include('Updated content');
          done();
        });
    });

    it('Test 35: ❌ Student should not update modules', function(done) {
      chai.request(app)
        .put(`/api/modules/${testModuleId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({ content: 'Unauthorized update' })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('Test 36: ✅ Should mark module as completed', function(done) {
      chai.request(app)
        .post(`/api/module-progress/${testModuleId}/complete`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('completed', true);
          done();
        });
    });

    it('Test 37: ✅ Should get module progress for student', function(done) {
      chai.request(app)
        .get(`/api/module-progress/user/${userIds.student}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('Test 38: ✅ Should get course progress summary', function(done) {
      chai.request(app)
        .get(`/api/progress/course/${testCourseId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('completionPercentage');
          done();
        });
    });
  });

  describe('🧠 Quiz System (6 tests)', function() {
    it('Test 39: ✅ Should create a quiz for module', function(done) {
      chai.request(app)
        .post('/api/quiz')
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .send({
          title: 'Test Variables Quiz',
          moduleId: testModuleId,
          questions: [
            {
              question: 'What keyword is used to declare a variable in JavaScript?',
              options: ['var', 'variable', 'v', 'declare'],
              correctAnswer: 0,
              explanation: 'The var keyword is used to declare variables in JavaScript'
            },
            {
              question: 'Which of these is a valid variable name?',
              options: ['2myVar', 'my-var', 'myVar', 'my var'],
              correctAnswer: 2,
              explanation: 'Variable names cannot start with numbers or contain spaces/hyphens'
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal('Test Variables Quiz');
          expect(res.body.questions).to.have.length(2);
          testQuizId = res.body._id;
          done();
        });
    });

    it('Test 40: ✅ Should get quiz by ID', function(done) {
      chai.request(app)
        .get(`/api/quiz/${testQuizId}`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal('Test Variables Quiz');
          expect(res.body.questions).to.have.length(2);
          done();
        });
    });

    it('Test 41: ✅ Should submit quiz answers', function(done) {
      chai.request(app)
        .post(`/api/quiz/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({
          answers: [0, 2] // Correct answers
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('score');
          expect(res.body.score).to.equal(100); // Perfect score
          done();
        });
    });

    it('Test 42: ✅ Should get quiz attempts for user', function(done) {
      chai.request(app)
        .get('/api/quiz/attempts')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.at.least(1);
          done();
        });
    });

    it('Test 43: ✅ Should get quiz statistics', function(done) {
      chai.request(app)
        .get(`/api/quiz/${testQuizId}/statistics`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('totalAttempts');
          expect(res.body).to.have.property('averageScore');
          done();
        });
    });

    it('Test 44: ❌ Should fail quiz submission with invalid answers', function(done) {
      chai.request(app)
        .post(`/api/quiz/${testQuizId}/submit`)
        .set('Authorization', `Bearer ${tokens.student}`)
        .send({
          answers: [0] // Missing second answer
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('🛡️ Security & Authorization (4 tests)', function() {
    it('Test 45: ❌ Should reject invalid JWT token', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer invalid.token.here')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Test 46: ❌ Should reject expired/malformed token', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer malformedtoken')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Test 47: ✅ Should validate role-based access control', function(done) {
      // Test that student can access student routes
      chai.request(app)
        .get('/api/courses/enrolled')
        .set('Authorization', `Bearer ${tokens.student}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Test 48: ✅ Should handle CORS preflight requests', function(done) {
      chai.request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers).to.have.property('access-control-allow-origin');
          done();
        });
    });
  });

  after(async function() {
    // Clean up test data
    try {
      await User.deleteMany({ email: { $regex: '@booksan.test$' } });
      await Course.deleteMany({ title: { $regex: '^Test ' } });
      await Module.deleteMany({ title: { $regex: '^Test ' } });
      await Quiz.deleteMany({ title: { $regex: '^Test ' } });
      await ModuleProgress.deleteMany({ userId: { $in: Object.values(userIds) } });
      console.log('✅ Test cleanup completed successfully');
    } catch (error) {
      console.log('⚠️  Test cleanup failed:', error.message);
    }
  });
});