// Basic test helpers to satisfy dependenciesconst jwt = require('jsonwebtoken');const jwt = require('jsonwebtoken');const jwt = require('jsonwebtoken');

module.exports = {

  setupTestDatabase: async () => {},const User = require('../../models/User');

  teardownTestDatabase: async () => {},

  generateTestData: async () => ({}),const Course = require('../../models/Course');const User = require('../../models/User');const User = require('../../models/User');

  makeAuthenticatedRequest: () => ({}),

  assertResponse: () => true,const mongoose = require('mongoose');

  createTestCourse: async () => ({}),

  createAuthenticatedUser: async () => ({})const Course = require('../../models/Course');const Course = require('../../models/Course');

};
/**

 * Test utilities for role-based integration testingconst mongoose = require('mongoose');const mongoose = require('mongoose');

 */



// Mock user data for different roles

const mockUsers = {/**/**

  admin: {

    name: 'Test Admin', * Test utilities for role-based integration testing * Test utilities for role-based integration testing

    email: 'admin@test.com',

    password: 'testpassword123', */ */

    role: 'admin'

  },

  instructor: {

    name: 'Test Instructor',// Mock user data for different roles// Mock user data for different roles

    email: 'instructor@test.com',

    password: 'testpassword123',const mockUsers = {const mockUsers = {

    role: 'instructor'

  },  admin: {  admin: {

  student: {

    name: 'Test Student',    name: 'Test Admin',    name: 'Test Admin',

    email: 'student@test.com',

    password: 'testpassword123',    email: 'admin@test.com',    email: 'admin@test.com',

    role: 'student'

  }    password: 'testpassword123',    password: 'testpassword123',

};

    role: 'admin'    role: 'admin'

// Test course data

const mockCourse = {  },  },

  title: 'Test Course Integration',

  description: 'A test course for integration testing',  instructor: {  instructor: {

  category: 'Programming',

  difficulty: 'Beginner',    name: 'Test Instructor',    name: 'Test Instructor',

  estimatedCompletionTime: 10,

  syllabus: [    email: 'instructor@test.com',    email: 'instructor@test.com',

    {

      title: 'Introduction',    password: 'testpassword123',    password: 'testpassword123',

      content: 'Course introduction',

      estimatedTime: 30,    role: 'instructor'    role: 'instructor'

      resources: []

    },  },  },

    {

      title: 'Basic Concepts',  student: {  student: {

      content: 'Learning the basics',

      estimatedTime: 60,    name: 'Test Student',    name: 'Test Student',

      resources: []

    }    email: 'student@test.com',    email: 'student@test.com',

  ],

  tags: ['test', 'programming'],    password: 'testpassword123',    password: 'testpassword123',

  status: 'published'

};    role: 'student'    role: 'student'



/**  }  }

 * Create and authenticate a user with a specific role

 */};};

const createAuthenticatedUser = async (userData = null, role = 'student') => {

  let finalUserData;

  

  if (userData && typeof userData === 'object') {// Test course data// Test course data

    finalUserData = userData;

  } else if (typeof userData === 'string') {const mockCourse = {const mockCourse = {

    role = userData;

    finalUserData = mockUsers[role];  title: 'Test Course Integration',  title: 'Test Course Integration',

  } else {

    finalUserData = mockUsers[role];  description: 'A test course for integration testing',  description: 'A test course for integration testing',

  }

    category: 'Programming',  category: 'Programming',

  if (!finalUserData) {

    throw new Error(`Invalid role or userData: ${role}`);  difficulty: 'Beginner',  difficulty: 'Beginner',

  }

  estimatedCompletionTime: 10,  estimatedCompletionTime: 10,

  const user = new User(finalUserData);

  await user.save();  syllabus: [  syllabus: [



  const token = jwt.sign(    {    {

    { id: user._id, role: user.role },

    process.env.JWT_SECRET || 'fallback_secret_for_testing',      title: 'Introduction',      title: 'Introduction',

    { expiresIn: '1h' }

  );      content: 'Course introduction',      content: 'Course introduction',



  return {      estimatedTime: 30,      estimatedTime: 30,

    user,

    token,      resources: []      resources: []

    authHeader: `Bearer ${token}`

  };    },    },

};

    {    {

/**

 * Create a test course      title: 'Basic Concepts',      title: 'Basic Concepts',

 */

const createTestCourse = async (customData = null, instructorId = null) => {      content: 'Learning the basics',      content: 'Learning the basics',

  let courseData;

        estimatedTime: 60,      estimatedTime: 60,

  if (customData && typeof customData === 'object') {

    courseData = { ...mockCourse, ...customData };      resources: []      resources: []

  } else if (typeof customData === 'string') {

    courseData = { ...mockCourse };    }    }

    courseData.instructor = customData;

  } else {  ],  ],

    courseData = { ...mockCourse };

    if (instructorId) {  tags: ['test', 'programming'],  tags: ['test', 'programming'],

      courseData.instructor = instructorId;

    }  status: 'published'  status: 'published'

  }

};};

  const course = new Course(courseData);

  await course.save();

  return course;

};/**/**



/** * Create and authenticate a user with a specific role * Create and authenticate a user with a specific role

 * Clean up test data

 */ */ */

const cleanupTestData = async () => {

  try {const createAuthenticatedUser = async (userData = null, role = 'student') => {const createAuthenticatedUser = async (userData = null, role = 'student') => {

    if (mongoose.connection.db) {

      await mongoose.connection.db.collection('moduleprogresses').deleteMany({});  let finalUserData;  let finalUserData;

      await mongoose.connection.db.collection('modules').deleteMany({});

      await mongoose.connection.db.collection('enrollments').deleteMany({});    

      await mongoose.connection.db.collection('courses').deleteMany({});

      await mongoose.connection.db.collection('users').deleteMany({});  if (userData && typeof userData === 'object') {  if (userData && typeof userData === 'object') {

    }

  } catch (error) {    // If userData is an object, use it directly    // If userData is an object, use it directly

    console.warn('Cleanup warning:', error.message);

  }    finalUserData = userData;    finalUserData = userData;

};

  } else if (typeof userData === 'string') {  } else if (typeof userData === 'string') {

/**

 * Setup test database connection    // If userData is a string, treat it as role    // If userData is a string, treat it as role

 */

const setupTestDatabase = async () => {    role = userData;    role = userData;

  if (mongoose.connection.readyState === 0) {

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_learning_tracker';    finalUserData = mockUsers[role];    finalUserData = mockUsers[role];

    await mongoose.connect(mongoUri, {

      useNewUrlParser: true,  } else {  } else {

      useUnifiedTopology: true,

    });    // Default behavior    // Default behavior

  }

};    finalUserData = mockUsers[role];    finalUserData = mockUsers[role];



/**  }  }

 * Teardown test database

 */    

const teardownTestDatabase = async () => {

  await cleanupTestData();  if (!finalUserData) {  if (!finalUserData) {

  if (mongoose.connection.readyState !== 0) {

    await mongoose.connection.close();    throw new Error(`Invalid role or userData: ${role}`);    throw new Error(`Invalid role or userData: ${role}`);

  }

};  }  }



/**

 * Generate test data for integration tests

 */  // Create user in database  // Create user in database

const generateTestData = async () => {

  const testData = {};  const user = new User(finalUserData);  const user = new User(finalUserData);



  testData.admin = await createAuthenticatedUser('admin');  await user.save();  await user.save();

  testData.instructor = await createAuthenticatedUser('instructor');

  testData.student = await createAuthenticatedUser('student');



  testData.course = await createTestCourse(testData.instructor.user._id);  // Generate JWT token  // Generate JWT token



  return testData;  const token = jwt.sign(  const token = jwt.sign(

};

    { id: user._id, role: user.role },    { id: user._id, role: user.role },

/**

 * Helper to make authenticated API requests    process.env.JWT_SECRET || 'fallback_secret_for_testing',    process.env.JWT_SECRET,

 */

const makeAuthenticatedRequest = (agent, token) => {    { expiresIn: '1h' }    { expiresIn: '1h' }

  return {

    get: (url) => agent.get(url).set('Authorization', `Bearer ${token}`),  );  );

    post: (url) => agent.post(url).set('Authorization', `Bearer ${token}`),

    put: (url) => agent.put(url).set('Authorization', `Bearer ${token}`),

    delete: (url) => agent.delete(url).set('Authorization', `Bearer ${token}`)

  };  return {  return {

};

    user,    user,

/**

 * Assert response status and structure    token,    token,

 */

const assertResponse = (response, expectedStatus, expectedKeys = []) => {    authHeader: `Bearer ${token}`    authHeader: `Bearer ${token}`

  if (response.status !== expectedStatus) {

    throw new Error(  };  };

      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.body)}`

    );};};

  }



  if (expectedKeys.length > 0) {

    expectedKeys.forEach(key => {/**/**

      if (!(key in response.body)) {

        throw new Error(`Expected response to contain key: ${key}`); * Create a test course * Create a test course

      }

    }); */ */

  }

const createTestCourse = async (customData = null, instructorId = null) => {const createTestCourse = async (customData = null, instructorId = null) => {

  return true;

};  let courseData;  let courseData;



module.exports = {    

  mockUsers,

  mockCourse,  if (customData && typeof customData === 'object') {  if (customData && typeof customData === 'object') {

  createAuthenticatedUser,

  createTestCourse,    // If customData is an object, merge with defaults    // If customData is an object, merge with defaults

  cleanupTestData,

  setupTestDatabase,    courseData = { ...mockCourse, ...customData };    courseData = { ...mockCourse, ...customData };

  teardownTestDatabase,

  generateTestData,  } else if (typeof customData === 'string') {  } else if (typeof customData === 'string') {

  makeAuthenticatedRequest,

  assertResponse    // If customData is a string, treat it as instructorId    // If customData is a string, treat it as instructorId

};
    courseData = { ...mockCourse };    courseData = { ...mockCourse };

    courseData.instructor = customData;    courseData.instructor = customData;

  } else {  } else {

    // Default behavior    // Default behavior

    courseData = { ...mockCourse };    courseData = { ...mockCourse };

    if (instructorId) {    if (instructorId) {

      courseData.instructor = instructorId;      courseData.instructor = instructorId;

    }    }

  }  }



  const course = new Course(courseData);  const course = new Course(courseData);

  await course.save();  await course.save();

  return course;  return course;

};};



/**/**

 * Clean up test data * Clean up test data

 */ */

const cleanupTestData = async () => {const cleanupTestData = async () => {

  try {  // Clean up in reverse order of dependencies

    // Clean up in reverse order of dependencies  await mongoose.connection.db.collection('enrollments').deleteMany({});

    if (mongoose.connection.db) {  await mongoose.connection.db.collection('courses').deleteMany({});

      await mongoose.connection.db.collection('moduleprogresses').deleteMany({});  await mongoose.connection.db.collection('users').deleteMany({});

      await mongoose.connection.db.collection('modules').deleteMany({});};

      await mongoose.connection.db.collection('enrollments').deleteMany({});

      await mongoose.connection.db.collection('courses').deleteMany({});/**

      await mongoose.connection.db.collection('users').deleteMany({}); * Setup test database connection

    } */

  } catch (error) {const setupTestDatabase = async () => {

    console.warn('Cleanup warning:', error.message);  if (mongoose.connection.readyState === 0) {

  }    await mongoose.connect(process.env.MONGO_URI, {

};      useNewUrlParser: true,

      useUnifiedTopology: true,

/**    });

 * Setup test database connection  }

 */};

const setupTestDatabase = async () => {

  if (mongoose.connection.readyState === 0) {/**

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test_learning_tracker'; * Teardown test database

    await mongoose.connect(mongoUri, { */

      useNewUrlParser: true,const teardownTestDatabase = async () => {

      useUnifiedTopology: true,  await cleanupTestData();

    });  if (mongoose.connection.readyState !== 0) {

  }    await mongoose.connection.close();

};  }

};

/**

 * Teardown test database/**

 */ * Generate test data for integration tests

const teardownTestDatabase = async () => { */

  await cleanupTestData();const generateTestData = async () => {

  if (mongoose.connection.readyState !== 0) {  const testData = {};

    await mongoose.connection.close();

  }  // Create users for each role

};  testData.admin = await createAuthenticatedUser('admin');

  testData.instructor = await createAuthenticatedUser('instructor');

/**  testData.student = await createAuthenticatedUser('student');

 * Generate test data for integration tests

 */  // Create test course assigned to instructor

const generateTestData = async () => {  testData.course = await createTestCourse(testData.instructor.user._id);

  const testData = {};

  return testData;

  // Create users for each role};

  testData.admin = await createAuthenticatedUser('admin');

  testData.instructor = await createAuthenticatedUser('instructor');/**

  testData.student = await createAuthenticatedUser('student'); * Helper to make authenticated API requests

 */

  // Create test course assigned to instructorconst makeAuthenticatedRequest = (agent, token) => {

  testData.course = await createTestCourse(testData.instructor.user._id);  return {

    get: (url) => agent.get(url).set('Authorization', `Bearer ${token}`),

  return testData;    post: (url) => agent.post(url).set('Authorization', `Bearer ${token}`),

};    put: (url) => agent.put(url).set('Authorization', `Bearer ${token}`),

    delete: (url) => agent.delete(url).set('Authorization', `Bearer ${token}`)

/**  };

 * Helper to make authenticated API requests};

 */

const makeAuthenticatedRequest = (agent, token) => {/**

  return { * Assert response status and structure

    get: (url) => agent.get(url).set('Authorization', `Bearer ${token}`), */

    post: (url) => agent.post(url).set('Authorization', `Bearer ${token}`),const assertResponse = (response, expectedStatus, expectedKeys = []) => {

    put: (url) => agent.put(url).set('Authorization', `Bearer ${token}`),  if (response.status !== expectedStatus) {

    delete: (url) => agent.delete(url).set('Authorization', `Bearer ${token}`)    throw new Error(

  };      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.body)}`

};    );

  }

/**

 * Assert response status and structure  if (expectedKeys.length > 0) {

 */    expectedKeys.forEach(key => {

const assertResponse = (response, expectedStatus, expectedKeys = []) => {      if (!(key in response.body)) {

  if (response.status !== expectedStatus) {        throw new Error(`Expected response to contain key: ${key}`);

    throw new Error(      }

      `Expected status ${expectedStatus}, got ${response.status}. Response: ${JSON.stringify(response.body)}`    });

    );  }

  }

  return true;

  if (expectedKeys.length > 0) {};

    expectedKeys.forEach(key => {

      if (!(key in response.body)) {/**

        throw new Error(`Expected response to contain key: ${key}`); * Test role-based access to specific endpoint

      } */

    });const testRoleAccess = async (agent, endpoint, method = 'GET', testData) => {

  }  const results = {};



  return true;  for (const [roleName, roleData] of Object.entries(testData)) {

};    if (roleName === 'course') continue;



/**    try {

 * Test role-based access to specific endpoint      const request = makeAuthenticatedRequest(agent, roleData.token);

 */      const response = await request[method.toLowerCase()](endpoint);

const testRoleAccess = async (agent, endpoint, method = 'GET', testData) => {

  const results = {};      results[roleName] = {

        status: response.status,

  for (const [roleName, roleData] of Object.entries(testData)) {        success: response.status < 400,

    if (roleName === 'course') continue;        body: response.body

      };

    try {    } catch (error) {

      const request = makeAuthenticatedRequest(agent, roleData.token);      results[roleName] = {

      const response = await request[method.toLowerCase()](endpoint);        status: error.status || 500,

        success: false,

      results[roleName] = {        error: error.message

        status: response.status,      };

        success: response.status < 400,    }

        body: response.body  }

      };

    } catch (error) {  return results;

      results[roleName] = {};

        status: error.status || 500,

        success: false,/**

        error: error.message * Validate that only specified roles can access an endpoint

      }; */

    }const validateRoleAccess = (results, allowedRoles) => {

  }  const allRoles = ['admin', 'instructor', 'student'];



  return results;  for (const role of allRoles) {

};    const isAllowed = allowedRoles.includes(role);

    const result = results[role];

/**

 * Validate that only specified roles can access an endpoint    if (isAllowed && !result.success) {

 */      throw new Error(`Role '${role}' should have access but got status ${result.status}`);

const validateRoleAccess = (results, allowedRoles) => {    }

  const allRoles = ['admin', 'instructor', 'student'];

    if (!isAllowed && result.success) {

  for (const role of allRoles) {      throw new Error(`Role '${role}' should NOT have access but got status ${result.status}`);

    const isAllowed = allowedRoles.includes(role);    }

    const result = results[role];  }



    if (isAllowed && !result.success) {  return true;

      throw new Error(`Role '${role}' should have access but got status ${result.status}`);};

    }

/**

    if (!isAllowed && result.success) { * Course enrollment helper

      throw new Error(`Role '${role}' should NOT have access but got status ${result.status}`); */

    }const enrollStudentInCourse = async (agent, studentToken, courseId) => {

  }  const request = makeAuthenticatedRequest(agent, studentToken);

  return await request.post(`/api/courses/${courseId}/enroll`);

  return true;};

};

/**

/** * Progress update helper

 * Course enrollment helper */

 */const updateCourseProgress = async (agent, studentToken, courseId, progress) => {

const enrollStudentInCourse = async (agent, studentToken, courseId) => {  const request = makeAuthenticatedRequest(agent, studentToken);

  const request = makeAuthenticatedRequest(agent, studentToken);  return await request.put(`/api/courses/${courseId}/progress`).send(progress);

  return await request.post(`/api/courses/${courseId}/enroll`);};

};

module.exports = {

/**  mockUsers,

 * Progress update helper  mockCourse,

 */  createAuthenticatedUser,

const updateCourseProgress = async (agent, studentToken, courseId, progress) => {  createTestCourse,

  const request = makeAuthenticatedRequest(agent, studentToken);  cleanupTestData,

  return await request.put(`/api/courses/${courseId}/progress`).send(progress);  setupTestDatabase,

};  teardownTestDatabase,

  generateTestData,

module.exports = {  makeAuthenticatedRequest,

  mockUsers,  assertResponse,

  mockCourse,  testRoleAccess,

  createAuthenticatedUser,  validateRoleAccess,

  createTestCourse,  enrollStudentInCourse,

  cleanupTestData,  updateCourseProgress

  setupTestDatabase,};
  teardownTestDatabase,
  generateTestData,
  makeAuthenticatedRequest,
  assertResponse,
  testRoleAccess,
  validateRoleAccess,
  enrollStudentInCourse,
  updateCourseProgress
};