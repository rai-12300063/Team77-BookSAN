const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    getEnrolledCourses,
    enrollStudentInCourse,
    unenrollStudentFromCourse,
    getCourseEnrollments
} = require('../controllers/courseController');
const { protect, requireInstructor, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes (no authentication required)
// GET /api/courses - Get all courses with filtering/pagination
router.get('/', protect, getCourses);

// Protected routes (authentication required)
// GET /api/courses/enrolled/my - Get user's enrolled courses (must be before /:id route)
router.get('/enrolled/my', protect, getEnrolledCourses);

// POST /api/courses - Create a new course (instructor/admin only)
router.post('/', protect, requireInstructor, createCourse);

// GET /api/courses/:id - Get single course details
router.get('/:id', protect, getCourse);

// GET /api/courses/:id/enrollments - Get course enrollments (admin/instructor)
router.get('/:id/enrollments', protect, requireInstructor, getCourseEnrollments);

// POST /api/courses/:id/enroll - Enroll in a course (self-enrollment for students)
router.post('/:id/enroll', protect, enrollInCourse);

// POST /api/courses/:id/unenroll - Unenroll from a course
router.post('/:id/unenroll', protect, unenrollFromCourse);

// POST /api/courses/enroll-student - Admin/Instructor enroll student
router.post('/enroll-student', protect, requireInstructor, enrollStudentInCourse);

// POST /api/courses/unenroll-student - Admin/Instructor unenroll student
router.post('/unenroll-student', protect, requireInstructor, unenrollStudentFromCourse);

// PUT /api/courses/:id - Update a course (instructor/admin only)
router.put('/:id', protect, requireInstructor, updateCourse);

// DELETE /api/courses/:id - Delete a course (admin only)
router.delete('/:id', protect, requireAdmin, deleteCourse);

module.exports = router;

