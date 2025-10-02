const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Course = require('../../models/Course');
const mongoose = require('mongoose');

/**
 * Test utilities for role-based integration testing
 */

// Mock user data for different roles
const mockUsers = {
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'testpassword123',
    role: 'admin'
  },
  instructor: {
    name: 'Test Instructor',
    email: 'instructor@test.com',
    password: 'testpassword123',
    role: 'instructor'
  },
  student: {
    name: 'Test Student',
    email: 'student@test.com',
    password: 'testpassword123',
    role: 'student'
  }
};

// Test course data
const mockCourse = {
  title: 'Test Course Integration',
  description: 'A test course for integration testing',
  category: 'Programming',
  difficulty: 'Beginner',
  estimatedCompletionTime: 10,
  syllabus: [
    {
      title: 'Introduction',
      content: 'Course introduction',
      estimatedTime: 30,
      resources: []
    },
    {
      title: 'Basic Concepts',
      content: 'Learning the basics',
      estimatedTime: 60,
      resources: []
    }
  ],
  tags: ['test', 'programming'],
  status: 'published'
};

/**
 * Create and authenticate a user with a specific role
 */
const createAuthenticatedUser = async (role = 'student') => {
  const userData = mockUsers[role];
  if (!userData) {
    throw new Error(`Invalid role: ${role}`);
  }

  // Create user in database
  const user = new User(userData);
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    user,
    token,
    authHeader: `Bearer ${token}`
  };
};

/**
 * Create a test course
 */
const createTestCourse = async (instructorId = null) => {
  const courseData = { ...mockCourse };
  if (instructorId) {
    courseData.instructor = instructorId;
  }

  const course = new Course(courseData);
  await course.save();
  return course;
};

/**
 * Clean up test data
 */
const cleanupTestData = async () => {
  // Clean up in reverse order of dependencies
  await mongoose.connection.db.collection('enrollments').deleteMany({});
  await mongoose.connection.db.collection('courses').deleteMany({});
  await mongoose.connection.db.collection('users').deleteMany({});
};

/**
 * Setup test database connection
 */
const setupTestDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

/**
 * Teardown test database
 */
const teardownTestDatabase = async () => {
  await cleanupTestData();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

/**
 * Generate test data for integration tests
 */
const generateTestData = async () => {
  const testData = {};

  // Create users for each role
  testData.admin = await createAuthenticatedUser('admin');
  testData.instructor = await createAuthenticatedUser('instructor');
  testData.student = await createAuthenticatedUser('student');

  // Create test course assigned to instructor
  testData.course = await createTestCourse(testData.instructor.user._id);

  return testData;
};

/**
 * Helper to make authenticated API requests
 */
const makeAuthenticatedRequest = (agent, token) => {
  return {
    get: (url) => agent.get(url).set('Authorization', `Bearer ${token}`),
    post: (url) => agent.post(url).set('Authorization', `Bearer ${token}`),
    put: (url) => agent.put(url).set('Authorization', `Bearer ${token}`),
    delete: (url) => agent.delete(url).set('Authorization', `Bearer ${token}`)
  };
};

/**
 * Assert response status and structure
 */
const assertResponse = (response, expectedStatus, expectedKeys = []) => {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.body)}`
    );
  }

  if (expectedKeys.length > 0) {
    expectedKeys.forEach(key => {
      if (!(key in response.body)) {
        throw new Error(`Expected response to contain key: ${key}`);
      }
    });
  }

  return true;
};

/**
 * Test role-based access to specific endpoint
 */
const testRoleAccess = async (agent, endpoint, method = 'GET', testData) => {
  const results = {};

  for (const [roleName, roleData] of Object.entries(testData)) {
    if (roleName === 'course') continue;

    try {
      const request = makeAuthenticatedRequest(agent, roleData.token);
      const response = await request[method.toLowerCase()](endpoint);

      results[roleName] = {
        status: response.status,
        success: response.status < 400,
        body: response.body
      };
    } catch (error) {
      results[roleName] = {
        status: error.status || 500,
        success: false,
        error: error.message
      };
    }
  }

  return results;
};

/**
 * Validate that only specified roles can access an endpoint
 */
const validateRoleAccess = (results, allowedRoles) => {
  const allRoles = ['admin', 'instructor', 'student'];

  for (const role of allRoles) {
    const isAllowed = allowedRoles.includes(role);
    const result = results[role];

    if (isAllowed && !result.success) {
      throw new Error(`Role '${role}' should have access but got status ${result.status}`);
    }

    if (!isAllowed && result.success) {
      throw new Error(`Role '${role}' should NOT have access but got status ${result.status}`);
    }
  }

  return true;
};

/**
 * Course enrollment helper
 */
const enrollStudentInCourse = async (agent, studentToken, courseId) => {
  const request = makeAuthenticatedRequest(agent, studentToken);
  return await request.post(`/api/courses/${courseId}/enroll`);
};

/**
 * Progress update helper
 */
const updateCourseProgress = async (agent, studentToken, courseId, progress) => {
  const request = makeAuthenticatedRequest(agent, studentToken);
  return await request.put(`/api/courses/${courseId}/progress`).send(progress);
};

module.exports = {
  mockUsers,
  mockCourse,
  createAuthenticatedUser,
  createTestCourse,
  cleanupTestData,
  setupTestDatabase,
  teardownTestDatabase,
  generateTestData,
  makeAuthenticatedRequest,
  assertResponse,
  testRoleAccess,
  validateRoleAccess,
  enrollStudentInCourse,
  updateCourseProgress
};