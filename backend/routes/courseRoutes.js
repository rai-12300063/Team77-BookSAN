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
const router = express.Router();

// Public routes (no authentication required)
// GET /api/courses - Get all courses with filtering/pagination
router.get('/', getCourses);

// Protected routes (authentication required)
// GET /api/courses/enrolled/my - Get user's enrolled courses (must be before /:id route)
router.get('/enrolled/my', protect, getEnrolledCourses);

// POST /api/courses - Create a new course (instructor/admin only)
router.post('/', protect, requireInstructorOrAdmin, requirePermission('courses:write'), createCourse);

// GET /api/courses/:id - Get single course details
router.get('/:id', getCourse);

// POST /api/courses/:id/enroll - Enroll in a course
router.post('/:id/enroll', protect, requireAnyRole, enrollInCourse);

// POST /api/courses/:id/unenroll - Unenroll from a course
router.post('/:id/unenroll', protect, requireAnyRole, unenrollFromCourse);

// PUT /api/courses/:id - Update a course (instructor/admin only)
router.put('/:id', protect, requireInstructorOrAdmin, updateCourse);

// DELETE /api/courses/:id - Delete a course (instructor/admin only)
router.delete('/:id', protect, requireInstructorOrAdmin, deleteCourse);


module.exports = router;

