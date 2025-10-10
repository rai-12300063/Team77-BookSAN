const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');

chai.use(chaiHttp);
const expect = chai.expect;

describe('BookSAN Learning Progress Tracker - API Tests', function() {
  // Increase timeout for database operations
  this.timeout(10000);

  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123',
    role: 'student'
  };

  const testAdmin = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'admin'
  };

  let userToken = '';
  let adminToken = '';
  let testUserId = '';
  let testCourseId = '';

  before(async function() {
    // Clean up test data before running tests
    try {
      await User.deleteMany({ email: { $in: [testUser.email, testAdmin.email] } });
      await Course.deleteMany({ title: 'Test Course' });
      console.log('✅ Test database cleaned');
    } catch (error) {
      console.log('⚠️  Database cleanup failed:', error.message);
    }
  });

  describe('🔧 System Health Checks', function() {
    it('✅ should connect to MongoDB', function(done) {
      expect(mongoose.connection.readyState).to.equal(1);
      done();
    });

    it('✅ should have server running', function(done) {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(404); // Expected since no root route
          done();
        });
    });
  });

  describe('👤 User Authentication', function() {
    it('✅ should register a new student user', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', testUser.email);
          testUserId = res.body.user._id;
          done();
        });
    });

    it('✅ should register a new admin user', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testAdmin)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.user).to.have.property('role', 'admin');
          done();
        });
    });

    it('❌ should fail to register user with duplicate email', function(done) {
      chai.request(app)
        .post('/api/auth/register')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('✅ should login with correct credentials', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          userToken = res.body.token;
          done();
        });
    });

    it('✅ should login admin with correct credentials', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          adminToken = res.body.token;
          done();
        });
    });

    it('❌ should fail login with incorrect password', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('❌ should fail login with non-existent email', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('📚 Course Management', function() {
    it('✅ should create a new course (admin only)', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Course',
          description: 'This is a test course for automated testing',
          difficulty: 'beginner',
          estimatedHours: 10
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('title', 'Test Course');
          testCourseId = res.body._id;
          done();
        });
    });

    it('❌ should fail to create course without admin token', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Course',
          description: 'This should fail',
          difficulty: 'beginner'
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('✅ should get all courses', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          done();
        });
    });

    it('✅ should get specific course by ID', function(done) {
      chai.request(app)
        .get(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('title', 'Test Course');
          done();
        });
    });

    it('❌ should fail to get non-existent course', function(done) {
      const fakeId = new mongoose.Types.ObjectId();
      chai.request(app)
        .get(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('🔐 Protected Routes', function() {
    it('❌ should fail to access protected route without token', function(done) {
      chai.request(app)
        .get('/api/courses')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('❌ should fail to access protected route with invalid token', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', 'Bearer invalidtoken')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('✅ should access protected route with valid token', function(done) {
      chai.request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('📊 User Profile Management', function() {
    it('✅ should get user profile', function(done) {
      chai.request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('email', testUser.email);
          expect(res.body).to.have.property('role', 'student');
          done();
        });
    });

    it('✅ should update user profile', function(done) {
      chai.request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Test User'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name', 'Updated Test User');
          done();
        });
    });
  });

  after(async function() {
    // Clean up test data after running tests
    try {
      await User.deleteMany({ email: { $in: [testUser.email, testAdmin.email] } });
      await Course.deleteMany({ title: 'Test Course' });
      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.log('⚠️  Test cleanup failed:', error.message);
    }
  });
});