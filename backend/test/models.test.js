const chai = require('chai');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');

const expect = chai.expect;

describe('📋 Model Validation Tests', function() {
  this.timeout(5000);

  describe('👤 User Model', function() {
    it('✅ should create a valid user', async function() {
      const validUser = new User({
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'validpassword123',
        role: 'student'
      });

      const savedUser = await validUser.save();
      expect(savedUser).to.have.property('_id');
      expect(savedUser.email).to.equal('valid@example.com');
      expect(savedUser.role).to.equal('student');

      // Cleanup
      await User.findByIdAndDelete(savedUser._id);
    });

    it('❌ should fail to create user without required email', async function() {
      const invalidUser = new User({
        name: 'No Email User',
        password: 'password123',
        role: 'student'
      });

      try {
        await invalidUser.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('email');
      }
    });

    it('❌ should fail to create user with invalid email', async function() {
      const invalidUser = new User({
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'password123',
        role: 'student'
      });

      try {
        await invalidUser.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('❌ should fail to create user with invalid role', async function() {
      const invalidUser = new User({
        name: 'Invalid Role User',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalidrole'
      });

      try {
        await invalidUser.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('role');
      }
    });

    it('✅ should accept valid roles', async function() {
      const roles = ['student', 'instructor', 'admin'];
      
      for (let role of roles) {
        const user = new User({
          name: `${role} User`,
          email: `${role}@example.com`,
          password: 'password123',
          role: role
        });

        const savedUser = await user.save();
        expect(savedUser.role).to.equal(role);
        
        // Cleanup
        await User.findByIdAndDelete(savedUser._id);
      }
    });
  });

  describe('📚 Course Model', function() {
    it('✅ should create a valid course', async function() {
      const validCourse = new Course({
        title: 'Valid Test Course',
        description: 'This is a valid test course',
        difficulty: 'beginner',
        estimatedHours: 10
      });

      const savedCourse = await validCourse.save();
      expect(savedCourse).to.have.property('_id');
      expect(savedCourse.title).to.equal('Valid Test Course');
      expect(savedCourse.difficulty).to.equal('beginner');

      // Cleanup
      await Course.findByIdAndDelete(savedCourse._id);
    });

    it('❌ should fail to create course without required title', async function() {
      const invalidCourse = new Course({
        description: 'Course without title',
        difficulty: 'beginner'
      });

      try {
        await invalidCourse.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('title');
      }
    });

    it('❌ should fail to create course with invalid difficulty', async function() {
      const invalidCourse = new Course({
        title: 'Invalid Difficulty Course',
        description: 'Course with invalid difficulty',
        difficulty: 'impossible'
      });

      try {
        await invalidCourse.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('difficulty');
      }
    });

    it('✅ should accept valid difficulty levels', async function() {
      const difficulties = ['beginner', 'intermediate', 'advanced'];
      
      for (let difficulty of difficulties) {
        const course = new Course({
          title: `${difficulty} Course`,
          description: `A ${difficulty} level course`,
          difficulty: difficulty,
          estimatedHours: 5
        });

        const savedCourse = await course.save();
        expect(savedCourse.difficulty).to.equal(difficulty);
        
        // Cleanup
        await Course.findByIdAndDelete(savedCourse._id);
      }
    });

    it('✅ should set default values correctly', async function() {
      const courseWithDefaults = new Course({
        title: 'Default Values Course',
        description: 'Testing default values'
      });

      const savedCourse = await courseWithDefaults.save();
      expect(savedCourse.difficulty).to.equal('beginner'); // Default value
      expect(savedCourse.isActive).to.equal(true); // Default value
      expect(savedCourse.enrollmentCount).to.equal(0); // Default value

      // Cleanup
      await Course.findByIdAndDelete(savedCourse._id);
    });
  });

  describe('📖 Module Model', function() {
    let testCourseId;

    before(async function() {
      // Create a test course for module tests
      const testCourse = new Course({
        title: 'Test Course for Modules',
        description: 'Course for testing modules'
      });
      const savedCourse = await testCourse.save();
      testCourseId = savedCourse._id;
    });

    after(async function() {
      // Cleanup test course
      await Course.findByIdAndDelete(testCourseId);
    });

    it('✅ should create a valid module', async function() {
      const validModule = new Module({
        title: 'Valid Test Module',
        description: 'This is a valid test module',
        courseId: testCourseId,
        content: 'Test module content',
        orderIndex: 1
      });

      const savedModule = await validModule.save();
      expect(savedModule).to.have.property('_id');
      expect(savedModule.title).to.equal('Valid Test Module');
      expect(savedModule.courseId.toString()).to.equal(testCourseId.toString());

      // Cleanup
      await Module.findByIdAndDelete(savedModule._id);
    });

    it('❌ should fail to create module without required title', async function() {
      const invalidModule = new Module({
        description: 'Module without title',
        courseId: testCourseId,
        content: 'Test content'
      });

      try {
        await invalidModule.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('title');
      }
    });

    it('❌ should fail to create module without courseId', async function() {
      const invalidModule = new Module({
        title: 'Module without course',
        description: 'Module without courseId',
        content: 'Test content'
      });

      try {
        await invalidModule.save();
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
        expect(error.errors).to.have.property('courseId');
      }
    });

    it('✅ should set default values correctly', async function() {
      const moduleWithDefaults = new Module({
        title: 'Default Values Module',
        courseId: testCourseId,
        content: 'Test content'
      });

      const savedModule = await moduleWithDefaults.save();
      expect(savedModule.isActive).to.equal(true); // Default value
      expect(savedModule.orderIndex).to.equal(0); // Default value

      // Cleanup
      await Module.findByIdAndDelete(savedModule._id);
    });
  });
});