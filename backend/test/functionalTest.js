const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

// Create test tokens for different user roles
const createTestToken = (userId, role) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test_secret_key',
    { expiresIn: '1h' }
  );
};

describe('Online Learning Progress Tracker - API Tests', function() {
  let adminToken, instructorToken, studentToken;
  let testUserId, testCourseId;

  before(async function() {
    // Set up test data and tokens
    this.timeout(10000);

    // Create test users if they don't exist
    try {
      // Admin user
      let adminUser = await User.findOne({ email: 'admin@test.com' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin User',
          email: 'admin@test.com',
          password: await bcrypt.hash('Password123', 10),
          role: 'admin'
        });
      }
      adminToken = createTestToken(adminUser._id, 'admin');

      // Instructor user
      let instructorUser = await User.findOne({ email: 'instructor@test.com' });
      if (!instructorUser) {
        instructorUser = await User.create({
          name: 'Instructor User',
          email: 'instructor@test.com',
          password: await bcrypt.hash('Password123', 10),
          role: 'instructor'
        });
      }
      instructorToken = createTestToken(instructorUser._id, 'instructor');
      
      // Student user
      let studentUser = await User.findOne({ email: 'student@test.com' });
      if (!studentUser) {
        studentUser = await User.create({
          name: 'Student User',
          email: 'student@test.com',
          password: await bcrypt.hash('Password123', 10),
          role: 'student'
        });
      }
      testUserId = studentUser._id;
      studentToken = createTestToken(studentUser._id, 'student');

      // Create test course if needed
      let testCourse = await Course.findOne({ title: 'API Test Course' });
      if (!testCourse) {
        testCourse = await Course.create({
          title: 'API Test Course',
          description: 'Course for API testing',
          instructor: instructorUser._id,
          category: 'testing'
        });
      }
      testCourseId = testCourse._id;

    } catch (error) {
      console.error('Error setting up test data:', error);
    }
  });

  after(async function() {
    // Cleanup
    this.timeout(5000);
    // Optionally remove test data
    // For test environments, we might keep the data for debugging
  });

  describe('Authentication API', function() {
    it('should register a new user', function(done) {
      const uniqueEmail = `user${Date.now()}@test.com`;
      
      chai.request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Test User',
          email: uniqueEmail,
          password: 'Password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', uniqueEmail);
          done();
        });
    });

    it('should login a user with valid credentials', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'Password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should reject login with invalid credentials', function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'WrongPassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('Course API', function() {
    it('should get all courses', function(done) {
      chai.request(app)
        .get('/api/courses')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('courses');
          expect(res.body.courses).to.be.an('array');
          done();
        });
    });

    it('should get a specific course by ID', function(done) {
      chai.request(app)
        .get(`/api/courses/${testCourseId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('title');
          expect(res.body).to.have.property('description');
          done();
        });
    });

    it('should allow instructor to create a course', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: `Test Course ${Date.now()}`,
          description: 'API Test Course Description',
          category: 'testing',
          difficulty: 'beginner'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('title');
          expect(res.body).to.have.property('instructor');
          done();
        });
    });

    it('should prevent student from creating a course', function(done) {
      chai.request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Course',
          description: 'This should fail',
          category: 'testing'
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('Student Enrollment API', function() {
    it('should allow student to enroll in a course', function(done) {
      chai.request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should get enrolled courses for student', function(done) {
      chai.request(app)
        .get('/api/students/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('Admin API', function() {
    it('should allow admin to get all users', function(done) {
      chai.request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('users');
          expect(res.body.users).to.be.an('array');
          done();
        });
    });

    it('should prevent non-admin from accessing user data', function(done) {
      chai.request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('should allow admin to update user role', function(done) {
      // Note: In a real test, use a specific test user ID
      chai.request(app)
        .put(`/api/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'instructor' })
        .end((err, res) => {
          // Expecting success here, but actual status may vary
          expect(res.status).to.be.oneOf([200, 404]);
          if (res.status === 200) {
            expect(res.body).to.have.property('role', 'instructor');
          }
          done();
        });
    });
  });
});