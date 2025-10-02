const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server');
const {
  setupTestDatabase,
  teardownTestDatabase,
  generateTestData,
  makeAuthenticatedRequest,
  assertResponse,
  enrollStudentInCourse,
  updateCourseProgress
} = require('../utils/testHelpers');

describe('Student Role Integration Tests', () => {
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

  describe('Student Dashboard Access', () => {
    it('should allow student to access their dashboard', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/dashboard');

      assertResponse(response, 200, ['totalCourses', 'completedCourses']);
    });

    it('should provide student-specific dashboard data', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/dashboard');

      expect(response.body).to.have.property('totalCourses');
      expect(response.body).to.have.property('completedCourses');
      expect(response.body).to.have.property('totalTimeSpent');
      expect(response.body.totalCourses).to.be.a('number');
    });
  });

  describe('Course Access and Enrollment', () => {
    it('should allow student to view available courses', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/courses');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow student to enroll in a course', async () => {
      const response = await enrollStudentInCourse(
        agent,
        testData.student.token,
        testData.course._id
      );

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('message');
    });

    it('should allow student to view their enrolled courses', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/courses');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow student to access enrolled course details', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get(`/api/students/courses/${testData.course._id}`);

      assertResponse(response, 200, ['title', 'description', 'syllabus']);
    });
  });

  describe('Progress Tracking', () => {
    it('should allow student to update their progress', async () => {
      const progressData = {
        moduleIndex: 0,
        completed: true,
        timeSpent: 30
      };

      const response = await updateCourseProgress(
        agent,
        testData.student.token,
        testData.course._id,
        progressData
      );

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow student to view their progress', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/progress/my');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow student to view progress analytics', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/progress/analytics');

      assertResponse(response, 200, ['totalTimeSpent', 'coursesInProgress']);
    });
  });

  describe('Learning Features', () => {
    it('should allow student to bookmark content', async () => {
      const bookmarkData = {
        moduleIndex: 0,
        note: 'Important concept'
      };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest
        .post(`/api/students/courses/${testData.course._id}/bookmarks`)
        .send(bookmarkData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow student to view their achievements', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/achievements');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow student to update learning goals', async () => {
      const goalsData = {
        goals: ['Complete JavaScript course', 'Learn React basics']
      };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest
        .put('/api/students/learning-goals')
        .send(goalsData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should provide course recommendations', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/recommendations');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });
  });

  describe('Access Restrictions', () => {
    it('should deny access to admin routes', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/admin/users');

      expect(response.status).to.equal(403);
    });

    it('should deny access to instructor routes', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/instructors/courses');

      expect(response.status).to.equal(403);
    });

    it('should deny course creation', async () => {
      const courseData = {
        title: 'Unauthorized Course',
        description: 'Should not be created',
        category: 'Test'
      };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.post('/api/courses').send(courseData);

      expect(response.status).to.equal(403);
    });

    it('should deny access to system analytics', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/admin/analytics');

      expect(response.status).to.equal(403);
    });
  });

  describe('Profile Management', () => {
    it('should allow student to view their profile', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/auth/profile');

      assertResponse(response, 200, ['name', 'email', 'role']);
      expect(response.body.role).to.equal('student');
    });

    it('should allow student to update their profile', async () => {
      const updateData = {
        name: 'Updated Student Name',
        learningPreferences: {
          preferredLearningTime: 'evening',
          learningPace: 'fast'
        }
      };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.put('/api/auth/profile').send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should deny role modification', async () => {
      const updateData = {
        role: 'admin'
      };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.put('/api/auth/profile').send(updateData);

      // Should either ignore role change or deny the request
      if (response.status === 200) {
        expect(response.body.role).to.equal('student');
      } else {
        expect(response.status).to.equal(403);
      }
    });
  });

  describe('Data Security', () => {
    it('should only see own data in student dashboard', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/dashboard');

      assertResponse(response, 200);
      // Verify no other students' data is visible
      expect(response.body).to.not.have.property('allStudents');
      expect(response.body).to.not.have.property('systemStats');
    });

    it('should only access own enrollments', async () => {
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const response = await studentRequest.get('/api/students/courses');

      assertResponse(response, 200);
      // Verify response only contains student's own enrollments
      if (response.body.length > 0) {
        response.body.forEach(enrollment => {
          expect(enrollment).to.have.property('studentId');
          expect(enrollment.studentId.toString()).to.equal(testData.student.user._id.toString());
        });
      }
    });
  });
});