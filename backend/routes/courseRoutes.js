/**
 * CourseRoutes - Demonstrates DECORATOR and MIDDLEWARE PATTERN
 * 
 * DESIGN PATTERNS IMPLEMENTED:
 * 1. DECORATOR PATTERN - Route protection through middleware layers
 * 2. MIDDLEWARE PATTERN - Chain of responsibility for request processing
 * 3. FACADE PATTERN - Simple route definitions hiding complex logic
 * 
 * OOP CONCEPTS DEMONSTRATED:
 * 1. COMPOSITION - Routes composed of middleware + controllers
 * 2. SEPARATION OF CONCERNS - Routes, auth, validation separated
 * 3. SINGLE RESPONSIBILITY - Each route handles one endpoint
 */

const express = require('express');
const {
    getCourses,        // STRATEGY: Different behavior per role
    getCourse,         // REPOSITORY: Data access abstraction
    createCourse,      // FACTORY: Creates course instances
    updateCourse,      // FACADE: Complex update operations
    deleteCourse,      // FACADE: Complex deletion with cleanup
    enrollInCourse,    // FACADE: Multi-step enrollment process
    unenrollFromCourse,
    getEnrolledCourses,
    enrollStudentInCourse,
    unenrollStudentFromCourse,
    getCourseEnrollments
} = require('../controllers/courseController');
const { protect, requireAnyRole, requirePermission, adminOnly } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const router = express.Router();

// *** DECORATOR PATTERN EXAMPLES ***
// Routes are "decorated" with middleware that adds functionality

// DECORATOR: protect middleware adds authentication
// STRATEGY PATTERN: getCourses behaves differently per user role
router.get('/', protect, getCourses);

// MULTIPLE DECORATORS: Authentication + role-specific access
// MIDDLEWARE PATTERN: protect → getEnrolledCourses chain
router.get('/enrolled/my', protect, getEnrolledCourses);

// DECORATOR CHAIN: protect → requireAnyRole → createCourse
// FACTORY PATTERN: createCourse creates different course types
// CHAIN OF RESPONSIBILITY: Each middleware can stop or continue
router.post('/', protect, requireAnyRole(['instructor', 'admin']), createCourse);

// GET /api/courses/:id - Get single course details
router.get('/:id', protect, validateObjectId('id'), getCourse);

// GET /api/courses/:id/enrollments - Get course enrollments (admin/instructor)
router.get('/:id/enrollments', protect, validateObjectId('id'), requireAnyRole(['instructor', 'admin']), getCourseEnrollments);

// POST /api/courses/:id/enroll - Enroll in a course (self-enrollment for students)
router.post('/:id/enroll', protect, validateObjectId('id'), enrollInCourse);

// POST /api/courses/:id/unenroll - Unenroll from a course
router.post('/:id/unenroll', protect, validateObjectId('id'), unenrollFromCourse);

// POST /api/courses/enroll-student - Admin/Instructor enroll student
router.post('/enroll-student', protect, requireAnyRole(['instructor', 'admin']), enrollStudentInCourse);

// POST /api/courses/unenroll-student - Admin/Instructor unenroll student
router.post('/unenroll-student', protect, requireAnyRole(['instructor', 'admin']), unenrollStudentFromCourse);

// PUT /api/courses/:id - Update a course (instructor/admin only)
router.put('/:id', protect, validateObjectId('id'), requireAnyRole(['instructor', 'admin']), updateCourse);

// DELETE /api/courses/:id - Delete a course (admin only)
router.delete('/:id', protect, validateObjectId('id'), adminOnly, deleteCourse);

module.exports = router;

