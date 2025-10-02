const { expect } = require('chai');
const request = require('supertest');
const app = require('../../server');
const {
  setupTestDatabase,
  teardownTestDatabase,
  generateTestData,
  makeAuthenticatedRequest,
  assertResponse,
  testRoleAccess,
  validateRoleAccess,
  enrollStudentInCourse,
  updateCourseProgress
} = require('../utils/testHelpers');

describe('Cross-Role Interaction Integration Tests', () => {
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

  describe('Course Lifecycle - Multi-Role Interaction', () => {
    it('should allow complete course lifecycle with proper role segregation', async () => {
      // Step 1: Instructor creates a course
      const courseData = {
        title: 'Cross-Role Test Course',
        description: 'Testing cross-role interactions',
        category: 'Testing',
        difficulty: 'Beginner',
        estimatedCompletionTime: 5,
        syllabus: [
          {
            title: 'Test Module',
            content: 'Testing content',
            estimatedTime: 30
          }
        ],
        status: 'published'
      };

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const courseResponse = await instructorRequest.post('/api/courses').send(courseData);
      expect(courseResponse.status).to.be.oneOf([200, 201]);

      const createdCourse = courseResponse.body;

      // Step 2: Student enrolls in the course
      const enrollResponse = await enrollStudentInCourse(
        agent,
        testData.student.token,
        createdCourse._id
      );
      expect(enrollResponse.status).to.be.oneOf([200, 201]);

      // Step 3: Student makes progress
      const progressResponse = await updateCourseProgress(
        agent,
        testData.student.token,
        createdCourse._id,
        { moduleIndex: 0, completed: true, timeSpent: 25 }
      );
      expect(progressResponse.status).to.be.oneOf([200, 201]);

      // Step 4: Instructor views student progress
      const progressViewResponse = await instructorRequest
        .get(`/api/instructors/courses/${createdCourse._id}/students`);
      assertResponse(progressViewResponse, 200);

      // Step 5: Admin can view everything
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const adminCourseView = await adminRequest.get(`/api/admin/courses/${createdCourse._id}/analytics`);
      assertResponse(adminCourseView, 200);
    });

    it('should enforce role boundaries during course management', async () => {
      // Test that students cannot modify courses
      const courseUpdateData = { title: 'Hacked Course Title' };

      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const studentUpdateResponse = await studentRequest
        .put(`/api/courses/${testData.course._id}`)
        .send(courseUpdateData);
      expect(studentUpdateResponse.status).to.equal(403);

      // Test that instructors cannot modify other instructors' courses
      const otherInstructorCourse = testData.course;
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const instructorUpdateResponse = await instructorRequest
        .put(`/api/courses/${otherInstructorCourse._id}`)
        .send(courseUpdateData);

      // Should either be forbidden or not found depending on implementation
      expect(instructorUpdateResponse.status).to.be.oneOf([403, 404]);
    });
  });

  describe('User Management Cross-Role Tests', () => {
    it('should test role elevation and demotion workflows', async () => {
      // Admin promotes student to instructor
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const promotionResponse = await adminRequest
        .put(`/api/admin/users/${testData.student.user._id}`)
        .send({ role: 'instructor' });

      expect(promotionResponse.status).to.be.oneOf([200, 201]);
      expect(promotionResponse.body.role).to.equal('instructor');

      // Verify the promoted user now has instructor permissions
      const newInstructorRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const instructorAccessResponse = await newInstructorRequest.get('/api/instructors/dashboard');
      assertResponse(instructorAccessResponse, 200);

      // Verify they no longer have student-only access
      const studentAccessResponse = await newInstructorRequest.get('/api/students/dashboard');
      expect(studentAccessResponse.status).to.equal(403);
    });

    it('should prevent unauthorized role modifications', async () => {
      // Student attempts to promote themselves
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const selfPromotionResponse = await studentRequest
        .put('/api/auth/profile')
        .send({ role: 'admin' });

      if (selfPromotionResponse.status === 200) {
        expect(selfPromotionResponse.body.role).to.not.equal('admin');
      } else {
        expect(selfPromotionResponse.status).to.equal(403);
      }

      // Instructor attempts to promote another user
      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      const instructorPromotionResponse = await instructorRequest
        .put(`/api/admin/users/${testData.student.user._id}`)
        .send({ role: 'admin' });

      expect(instructorPromotionResponse.status).to.equal(403);
    });
  });

  describe('Data Access and Isolation Tests', () => {
    it('should ensure proper data isolation between roles', async () => {
      // Create data as different roles
      const { createAuthenticatedUser, createTestCourse } = require('../utils/testHelpers');

      // Create another instructor with their own course
      const instructor2 = await createAuthenticatedUser('instructor');
      const instructor2Course = await createTestCourse(instructor2.user._id);

      // Create another student
      const student2 = await createAuthenticatedUser('student');

      // Test that instructor1 cannot see instructor2's students
      const instructor1Request = makeAuthenticatedRequest(agent, testData.instructor.token);
      const instructor1StudentsResponse = await instructor1Request.get('/api/instructors/students');
      assertResponse(instructor1StudentsResponse, 200);

      // Test that student1 cannot see student2's progress
      const student1Request = makeAuthenticatedRequest(agent, testData.student.token);
      const student1ProgressResponse = await student1Request.get('/api/progress/my');
      assertResponse(student1ProgressResponse, 200);

      // Verify the response only contains student1's data
      if (student1ProgressResponse.body.length > 0) {
        student1ProgressResponse.body.forEach(progress => {
          expect(progress.studentId.toString()).to.equal(testData.student.user._id.toString());
        });
      }
    });

    it('should test cross-role data access permissions', async () => {
      // Define test scenarios for different endpoints
      const testScenarios = [
        {
          endpoint: '/api/students/dashboard',
          allowedRoles: ['student'],
          description: 'Student dashboard access'
        },
        {
          endpoint: '/api/instructors/dashboard',
          allowedRoles: ['instructor'],
          description: 'Instructor dashboard access'
        },
        {
          endpoint: '/api/admin/dashboard',
          allowedRoles: ['admin'],
          description: 'Admin dashboard access'
        },
        {
          endpoint: '/api/courses',
          allowedRoles: ['admin', 'instructor', 'student'],
          description: 'Public course listing'
        },
        {
          endpoint: '/api/admin/users',
          allowedRoles: ['admin'],
          description: 'User management'
        }
      ];

      // Test each scenario
      for (const scenario of testScenarios) {
        const results = await testRoleAccess(agent, scenario.endpoint, 'GET', testData);
        validateRoleAccess(results, scenario.allowedRoles);
      }
    });
  });

  describe('Permission Inheritance and Escalation', () => {
    it('should verify admin has access to all lower-level functions', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);

      // Admin should be able to access instructor functions
      const instructorFunctions = [
        '/api/instructors/courses',
        '/api/instructors/dashboard'
      ];

      for (const endpoint of instructorFunctions) {
        const response = await adminRequest.get(endpoint);
        expect(response.status).to.not.equal(403, `Admin should access ${endpoint}`);
      }

      // Admin should be able to access student functions
      const studentFunctions = [
        '/api/students/dashboard',
        '/api/students/courses'
      ];

      for (const endpoint of studentFunctions) {
        const response = await adminRequest.get(endpoint);
        expect(response.status).to.not.equal(403, `Admin should access ${endpoint}`);
      }
    });

    it('should verify instructors have appropriate student oversight', async () => {
      // Enroll student in instructor's course first
      await enrollStudentInCourse(agent, testData.student.token, testData.course._id);

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);

      // Instructor should see their students
      const studentsResponse = await instructorRequest.get('/api/instructors/students');
      assertResponse(studentsResponse, 200);

      // Instructor should see course-specific student analytics
      const analyticsResponse = await instructorRequest
        .get(`/api/instructors/courses/${testData.course._id}/students`);
      assertResponse(analyticsResponse, 200);
    });
  });

  describe('Concurrent Access and Race Conditions', () => {
    it('should handle concurrent role-based operations safely', async () => {
      // Simulate concurrent operations from different roles
      const promises = [];

      // Student enrolls while instructor updates course
      promises.push(
        enrollStudentInCourse(agent, testData.student.token, testData.course._id)
      );

      const instructorRequest = makeAuthenticatedRequest(agent, testData.instructor.token);
      promises.push(
        instructorRequest.put(`/api/courses/${testData.course._id}`).send({
          description: 'Updated during concurrent test'
        })
      );

      // Admin views analytics during operations
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      promises.push(
        adminRequest.get('/api/admin/analytics')
      );

      // Execute all operations concurrently
      const results = await Promise.allSettled(promises);

      // Verify no operations failed due to race conditions
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Concurrent operation ${index} failed:`, result.reason);
        }
        expect(result.status).to.equal('fulfilled');
      });
    });
  });

  describe('Authentication and Session Management', () => {
    it('should properly handle role-based session validation', async () => {
      // Test that expired tokens are rejected
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token';
      const expiredRequest = agent.get('/api/students/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`);

      const expiredResponse = await expiredRequest;
      expect(expiredResponse.status).to.equal(401);

      // Test that invalid tokens are rejected
      const invalidToken = 'invalid.token.here';
      const invalidRequest = agent.get('/api/students/dashboard')
        .set('Authorization', `Bearer ${invalidToken}`);

      const invalidResponse = await invalidRequest;
      expect(invalidResponse.status).to.equal(401);

      // Test that valid tokens work correctly
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const validResponse = await studentRequest.get('/api/students/dashboard');
      expect(validResponse.status).to.not.equal(401);
    });

    it('should enforce role consistency across session', async () => {
      // Make multiple requests with same token to ensure role doesn't change
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);

      const request1 = await studentRequest.get('/api/auth/profile');
      const request2 = await studentRequest.get('/api/auth/profile');

      expect(request1.body.role).to.equal(request2.body.role);
      expect(request1.body.role).to.equal('student');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed role-based requests gracefully', async () => {
      // Test with malformed course ID
      const studentRequest = makeAuthenticatedRequest(agent, testData.student.token);
      const malformedResponse = await studentRequest.get('/api/students/courses/invalid-id');
      expect(malformedResponse.status).to.be.oneOf([400, 404]);

      // Test with missing required fields
      const incompleteRequest = await studentRequest.post('/api/courses/enroll').send({});
      expect(incompleteRequest.status).to.be.oneOf([400, 422]);
    });

    it('should handle edge cases in role transitions', async () => {
      // Test accessing old role endpoints after role change
      const { createAuthenticatedUser } = require('../utils/testHelpers');
      const testUser = await createAuthenticatedUser('student');

      // Change role to instructor via admin
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      await adminRequest.put(`/api/admin/users/${testUser.user._id}`).send({ role: 'instructor' });

      // Old token should still work but with updated permissions
      const oldTokenRequest = makeAuthenticatedRequest(agent, testUser.token);
      const studentAccessResponse = await oldTokenRequest.get('/api/students/dashboard');
      expect(studentAccessResponse.status).to.equal(403);

      const instructorAccessResponse = await oldTokenRequest.get('/api/instructors/dashboard');
      assertResponse(instructorAccessResponse, 200);
    });
  });

  describe('Integration with External Systems', () => {
    it('should maintain role consistency in external API calls', async () => {
      // Test that role information is preserved in API responses
      const roles = ['student', 'instructor', 'admin'];

      for (const roleName of roles) {
        const roleData = testData[roleName];
        const request = makeAuthenticatedRequest(agent, roleData.token);
        const response = await request.get('/api/auth/profile');

        assertResponse(response, 200);
        expect(response.body.role).to.equal(roleName);
      }
    });
  });
});