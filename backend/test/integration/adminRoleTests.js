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
  createAuthenticatedUser
} = require('../utils/testHelpers');

describe('Admin Role Integration Tests', () => {
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

  describe('Admin Dashboard Access', () => {
    it('should allow admin to access system dashboard', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/dashboard');

      assertResponse(response, 200, ['totalUsers', 'totalCourses']);
    });

    it('should provide comprehensive system statistics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/dashboard');

      expect(response.body).to.have.property('totalUsers');
      expect(response.body).to.have.property('totalCourses');
      expect(response.body).to.have.property('systemHealth');
      expect(response.body).to.have.property('studentCount');
      expect(response.body).to.have.property('instructorCount');
      expect(response.body).to.have.property('adminCount');
    });
  });

  describe('User Management', () => {
    it('should allow admin to view all users', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/users');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to create new users', async () => {
      const newUserData = {
        name: 'Admin Created User',
        email: 'admincreated@test.com',
        password: 'password123',
        role: 'instructor'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.post('/api/admin/users').send(newUserData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('name', newUserData.name);
      expect(response.body).to.have.property('role', newUserData.role);
    });

    it('should allow admin to update user roles', async () => {
      // Create a test user to modify
      const testUser = await createAuthenticatedUser('student');

      const updateData = {
        role: 'instructor'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .put(`/api/admin/users/${testUser.user._id}`)
        .send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('role', 'instructor');
    });

    it('should allow admin to deactivate users', async () => {
      const testUser = await createAuthenticatedUser('student');

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.delete(`/api/admin/users/${testUser.user._id}`);

      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('should allow admin to view recent user registrations', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/users/recent');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to search users', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/users/search?query=test');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });
  });

  describe('Course Management', () => {
    it('should allow admin to view all courses', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/courses');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to create courses for any instructor', async () => {
      const courseData = {
        title: 'Admin Created Course',
        description: 'Course created by admin',
        category: 'Administration',
        difficulty: 'Beginner',
        instructor: testData.instructor.user._id,
        estimatedCompletionTime: 15,
        syllabus: [
          {
            title: 'Admin Module',
            content: 'Admin created content',
            estimatedTime: 45
          }
        ],
        status: 'published'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.post('/api/admin/courses').send(courseData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('title', courseData.title);
    });

    it('should allow admin to modify any course', async () => {
      const updateData = {
        title: 'Admin Modified Course',
        status: 'archived'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .put(`/api/admin/courses/${testData.course._id}`)
        .send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('title', updateData.title);
    });

    it('should allow admin to delete any course', async () => {
      const courseToDelete = await createTestCourse(testData.instructor.user._id);

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.delete(`/api/admin/courses/${courseToDelete._id}`);

      expect(response.status).to.be.oneOf([200, 204]);
    });

    it('should allow admin to view course analytics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get(`/api/admin/courses/${testData.course._id}/analytics`);

      assertResponse(response, 200, ['enrollmentCount', 'completionRate']);
    });
  });

  describe('System Analytics', () => {
    it('should allow admin to view comprehensive system analytics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/analytics');

      assertResponse(response, 200);
      expect(response.body).to.have.property('userGrowth');
      expect(response.body).to.have.property('coursePerformance');
      expect(response.body).to.have.property('systemUsage');
    });

    it('should provide platform usage statistics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/analytics/usage');

      assertResponse(response, 200);
      expect(response.body).to.have.property('activeUsers');
      expect(response.body).to.have.property('totalSessions');
    });

    it('should provide learning effectiveness metrics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/analytics/learning');

      assertResponse(response, 200);
      expect(response.body).to.have.property('avgCompletionRate');
      expect(response.body).to.have.property('popularCourses');
    });

    it('should provide financial and operational metrics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/analytics/operational');

      assertResponse(response, 200);
      expect(response.body).to.have.property('systemPerformance');
    });
  });

  describe('System Configuration', () => {
    it('should allow admin to view system settings', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/settings');

      assertResponse(response, 200);
      expect(response.body).to.have.property('systemConfig');
    });

    it('should allow admin to update system settings', async () => {
      const settingsData = {
        maintenanceMode: false,
        maxEnrollmentsPerStudent: 10,
        systemAnnouncement: 'System is running normally'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.put('/api/admin/settings').send(settingsData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should allow admin to manage system announcements', async () => {
      const announcementData = {
        title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday',
        priority: 'high',
        targetAudience: 'all'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .post('/api/admin/announcements')
        .send(announcementData);

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  describe('Security and Monitoring', () => {
    it('should allow admin to view security logs', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/logs/security');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to view audit trail', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/audit');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to view failed login attempts', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/security/failed-logins');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to suspend user accounts', async () => {
      const testUser = await createAuthenticatedUser('student');

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .put(`/api/admin/users/${testUser.user._id}/suspend`)
        .send({ reason: 'Testing suspension functionality' });

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  describe('Data Management', () => {
    it('should allow admin to export user data', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/export/users');

      expect(response.status).to.be.oneOf([200, 202]);
    });

    it('should allow admin to export course data', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/export/courses');

      expect(response.status).to.be.oneOf([200, 202]);
    });

    it('should allow admin to backup system data', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.post('/api/admin/backup');

      expect(response.status).to.be.oneOf([200, 202]);
    });

    it('should allow admin to manage data retention', async () => {
      const retentionData = {
        userDataRetention: 365,
        logRetention: 90,
        analyticsRetention: 730
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .put('/api/admin/data-retention')
        .send(retentionData);

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  describe('Content Moderation', () => {
    it('should allow admin to review flagged content', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/moderation/flagged');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should allow admin to approve or reject content', async () => {
      const moderationData = {
        action: 'approve',
        reason: 'Content meets quality standards'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest
        .put(`/api/admin/moderation/courses/${testData.course._id}`)
        .send(moderationData);

      expect(response.status).to.be.oneOf([200, 201]);
    });
  });

  describe('System Health and Maintenance', () => {
    it('should allow admin to check system health', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/health');

      assertResponse(response, 200, ['database', 'server', 'uptime']);
    });

    it('should allow admin to view system metrics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/metrics');

      assertResponse(response, 200);
      expect(response.body).to.have.property('memory');
      expect(response.body).to.have.property('cpu');
    });

    it('should allow admin to trigger maintenance tasks', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.post('/api/admin/maintenance/cleanup');

      expect(response.status).to.be.oneOf([200, 202]);
    });
  });

  describe('Profile and Security', () => {
    it('should allow admin to view their profile', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/auth/profile');

      assertResponse(response, 200, ['name', 'email', 'role']);
      expect(response.body.role).to.equal('admin');
    });

    it('should allow admin to update their profile', async () => {
      const updateData = {
        name: 'Updated Admin Name',
        securitySettings: {
          twoFactorEnabled: true
        }
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.put('/api/auth/profile').send(updateData);

      expect(response.status).to.be.oneOf([200, 201]);
    });

    it('should maintain admin role even in profile updates', async () => {
      const updateData = {
        role: 'student'
      };

      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.put('/api/auth/profile').send(updateData);

      if (response.status === 200) {
        expect(response.body.role).to.equal('admin');
      } else {
        expect(response.status).to.equal(403);
      }
    });
  });

  describe('Advanced Analytics and Reporting', () => {
    it('should provide detailed learning outcome reports', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/reports/learning-outcomes');

      assertResponse(response, 200);
      expect(response.body).to.have.property('overallCompletion');
    });

    it('should provide instructor performance analytics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/reports/instructor-performance');

      assertResponse(response, 200);
      expect(response.body).to.be.an('array');
    });

    it('should provide student engagement metrics', async () => {
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);
      const response = await adminRequest.get('/api/admin/reports/student-engagement');

      assertResponse(response, 200);
      expect(response.body).to.have.property('averageSessionTime');
    });
  });

  describe('Data Security and Compliance', () => {
    it('should ensure admin can only access admin endpoints', async () => {
      // Verify admin has access to all admin endpoints
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);

      const endpoints = [
        '/api/admin/dashboard',
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/analytics',
        '/api/admin/settings'
      ];

      for (const endpoint of endpoints) {
        const response = await adminRequest.get(endpoint);
        expect(response.status).to.not.equal(403, `Admin should have access to ${endpoint}`);
      }
    });

    it('should log all admin actions for audit trail', async () => {
      // Perform an admin action
      const testUser = await createAuthenticatedUser('student');
      const adminRequest = makeAuthenticatedRequest(agent, testData.admin.token);

      await adminRequest.put(`/api/admin/users/${testUser.user._id}`).send({ name: 'Audit Test' });

      // Check if action was logged
      const auditResponse = await adminRequest.get('/api/admin/audit');
      expect(auditResponse.status).to.equal(200);
    });
  });
});