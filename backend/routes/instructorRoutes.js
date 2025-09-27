const express = require('express');
const {
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStudents,
    getStudentProgress,
    updateStudentGrade,
    getCourseAnalytics,
    getMyStudents
} = require('../controllers/instructorController');
const { protect, requireInstructorOrAdmin, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireInstructorOrAdmin);

router.route('/courses')
    .get(requirePermission('courses:read'), getMyCourses)
    .post(requirePermission('courses:write'), createCourse);

router.route('/courses/:id')
    .put(requirePermission('courses:write'), updateCourse)
    .delete(requirePermission('courses:delete'), deleteCourse);

router.get('/courses/:id/students', requirePermission('students:read'), getCourseStudents);

router.get('/courses/:id/analytics', requirePermission('analytics:view'), getCourseAnalytics);

router.route('/courses/:courseId/students/:studentId')
    .get(requirePermission('students:progress:view'), getStudentProgress)
    .put(requirePermission('progress:write'), updateStudentGrade);

router.get('/students', requirePermission('students:read'), getMyStudents);

module.exports = router;