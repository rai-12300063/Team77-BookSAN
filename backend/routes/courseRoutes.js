const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    getEnrolledCourses
} = require('../controllers/courseController');
const { protect, requireInstructorOrAdmin, requirePermission, requireAnyRole } = require('../middleware/authMiddleware');
const {
    logApiAccess,
    requireOwnResourceOrRole,
    validateResourceOwnership
} = require('../middleware/permissionMiddleware');
const router = express.Router();

// Public routes (no authentication required)
// GET /api/courses - Get all courses with filtering/pagination
router.get('/', logApiAccess, getCourses);

// Protected routes (authentication required)
// GET /api/courses/enrolled/my - Get user's enrolled courses (must be before /:id route)
router.get('/enrolled/my', protect, requireAnyRole, requirePermission('courses:read'), logApiAccess, getEnrolledCourses);

// POST /api/courses - Create a new course (instructor/admin only)
router.post('/', protect, requireInstructorOrAdmin, requirePermission('courses:write'), logApiAccess, createCourse);

// GET /api/courses/:id - Get single course details
router.get('/:id', logApiAccess, getCourse);

// POST /api/courses/:id/enroll - Enroll in a course
router.post('/:id/enroll', protect, requireAnyRole, requirePermission('courses:read'), logApiAccess, enrollInCourse);

// POST /api/courses/:id/unenroll - Unenroll from a course
router.post('/:id/unenroll', protect, requireAnyRole, requirePermission('courses:read'), validateResourceOwnership('enrollment'), logApiAccess, unenrollFromCourse);

// PUT /api/courses/:id - Update a course (instructor/admin only)
router.put('/:id', protect, requireInstructorOrAdmin, requirePermission('courses:write'), requireOwnResourceOrRole('course', ['admin']), logApiAccess, updateCourse);

// DELETE /api/courses/:id - Delete a course (instructor/admin only)
router.delete('/:id', protect, requireInstructorOrAdmin, requirePermission('courses:delete'), requireOwnResourceOrRole('course', ['admin']), logApiAccess, deleteCourse);


module.exports = router;

