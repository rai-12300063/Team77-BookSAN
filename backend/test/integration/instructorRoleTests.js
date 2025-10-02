const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server');
const {
  setupTestDatabase,
  teardownTestDatabase,
  generateTestData,
  makeAuthenticatedRequest,
  assertResponse,
  createTestCourse,
  enrollStudentInCourse
} = require('../utils/testHelpers');

describe('Instructor Role Integration Tests', () => {
  let testData;
  let agent;

  before(async () => {
    await setupTestDatabase();
    agent = request.agent(app);
    testData = await generateTestData();
  });

  after(async () => {
    await teardownTestDatabase();
  });

  describe('Instructor Dashboard Access', () => {
    it('should allow instructor to access their dashboard', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/dashboard');

      assertResponse(response, 200, ['totalStudents', 'totalCourses']);
    });

    it('should provide instructor-specific dashboard data', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/dashboard');

      expect(response.body).to.have.property('totalStudents');
      expect(response.body).to.have.property('totalCourses');
      expect(response.body).to.have.property('avgCompletion');
      expect(response.body.totalStudents).to.be.a('number');
    });
  });

  describe('Course Management', () => {
    it('should allow instructor to create a new course', async () => {
      const courseData = {
        title: 'Instructor Created Course',
        description: 'A course created by instructor for testing',
        category: 'Programming',
        difficulty: 'Intermediate',
        estimatedCompletionTime: 20,
        syllabus: [
          {
            title: 'Module 1',
            content: 'Introduction to concepts',
            estimatedTime: 60
          }
        ],
        tags: ['test', 'instructor'],
        status: 'draft'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.post('/api/courses').send(courseData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('title', courseData.title);
      expect(response.body).to.have.property('instructor');
    });

    it('should allow instructor to view their courses', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/courses');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow instructor to update their course', async () => {
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated description',
        status: 'published'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .put(`/api/courses/${testData.course._id}`)
        .send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('title', updateData.title);
    });

    it('should allow instructor to delete their course', async () => {
      // Create a course specifically for deletion
      const courseToDelete = await createTestCourse(testData.instructor.user._id);

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.delete(`/api/courses/${courseToDelete._id}`);

      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('should prevent instructor from modifying other instructors courses', async () => {
      // Create another instructor's course
      const otherInstructor = {
        name: 'Other Instructor',
        email: 'other@instructor.com',
        password: 'password123',
        role: 'instructor'
      };

      const User = require('../../models/User');
      const otherInstructorUser = new User(otherInstructor);
      await otherInstructorUser.save();

      const otherCourse = await createTestCourse(otherInstructorUser._id);

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .put(`/api/courses/${otherCourse._id}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).to.equal(403);
    });
  });

  describe('Student Management', () => {
    it('should allow instructor to view students in their courses', async () => {
      // First enroll the test student in instructor's course
      await enrollStudentInCourse(agent, testData.student.token, testData.course._id);

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/students');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow instructor to view student progress in their courses', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/courses/${testData.course._id}/students`);

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow instructor to view detailed student analytics', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/students/${testData.student.user._id}/analytics`);

      // Should either return analytics or a 404 if student not in instructor's courses
      expect(response.status).to.be.oneOf([200, 404]);
    });

    it('should deny access to students not in instructor courses', async () => {
      // Create another student not enrolled in instructor's courses
      const { createAuthenticatedUser } = require('../utils/testHelpers');
      const otherStudent = await createAuthenticatedUser('student');

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/students/${otherStudent.user._id}/analytics`);

      expect(response.status).to.equal(403);
    });
  });

  describe('Analytics and Reporting', () => {
    it('should allow instructor to view course analytics', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/courses/${testData.course._id}/analytics`);

      assertResponse(response, 200, ['enrollmentCount', 'completionRate']);
    });

    it('should allow instructor to view teaching analytics', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/analytics');

      assertResponse(response, 200);
      expect(response.body).to.have.property('totalStudents');
      expect(response.body).to.have.property('coursePerformance');
    });

    it('should provide grade book functionality', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/courses/${testData.course._id}/gradebook`);

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });
  });

  describe('Access Restrictions', () => {
    it('should deny access to admin routes', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/admin/users');

      expect(response.status).to.equal(403);
    });

    it('should deny access to system-wide analytics', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/admin/analytics');

      expect(response.status).to.equal(403);
    });

    it('should deny user management operations', async () => {
      const userData = {
        name: 'Unauthorized User',
        email: 'unauthorized@test.com',
        role: 'admin'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.post('/api/admin/users').send(userData);

      expect(response.status).to.equal(403);
    });

    it('should deny access to student-only routes', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/students/dashboard');

      expect(response.status).to.equal(403);
    });
  });

  describe('Course Publishing and Status', () => {
    it('should allow instructor to publish their draft course', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .put(`/api/courses/${testData.course._id}/publish`)
        .send({ status: 'published' });

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow instructor to unpublish their course', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .put(`/api/courses/${testData.course._id}/publish`)
        .send({ status: 'draft' });

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow instructor to archive completed course', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .put(`/api/courses/${testData.course._id}/archive`)
        .send({ status: 'archived' });

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  describe('Communication Features', () => {
    it('should allow instructor to send announcements to course students', async () => {
      const announcementData = {
        title: 'Important Update',
        message: 'Please check the new assignment',
        courseId: testData.course._id
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest
        .post('/api/instructors/announcements')
        .send(announcementData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow instructor to view student questions/feedback', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get(`/api/instructors/courses/${testData.course._id}/feedback`);

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });
  });

  describe('Profile and Settings', () => {
    it('should allow instructor to view their profile', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/auth/profile');

      assertResponse(response, 200, ['name', 'email', 'role']);
      expect(response.body.role).to.equal('instructor');
    });

    it('should allow instructor to update their profile', async () => {
      const updateData = {
        name: 'Updated Instructor Name',
        bio: 'Experienced educator and programmer'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.put('/api/auth/profile').send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should deny role modification', async () => {
      const updateData = {
        role: 'admin'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.put('/api/auth/profile').send(updateData);

      if (response.status === 200) {
        expect(response.body.role).to.equal('instructor');
      } else {
        expect(response.status).to.equal(403);
      }
    });
  });

  describe('Data Security and Isolation', () => {
    it('should only see own courses in course list', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/courses');

      assertResponse(response, 200);
      response.body.forEach(course => {
        expect(course.instructor.toString()).to.equal(testData.instructor.user._id.toString());
      });
    });

    it('should only see students from own courses', async () => {
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const response = await instructorRequest.get('/api/instructors/students');

      assertResponse(response, 200);
      // All returned students should be enrolled in instructor's courses
      expect(response.body).to.be.an('array');
    });
  });
});