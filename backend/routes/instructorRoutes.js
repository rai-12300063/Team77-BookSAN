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
const {
    logApiAccess,
    requireCourseInstructor,
    requireOwnResourceOrRole
} = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireInstructorOrAdmin);
router.use(logApiAccess);

router.route('/courses')
    .get(requirePermission('courses:read'), getMyCourses)
    .post(requirePermission('courses:write'), createCourse);

router.route('/courses/:id')
    .put(requirePermission('courses:write'), requireCourseInstructor, updateCourse)
    .delete(requirePermission('courses:delete'), requireCourseInstructor, deleteCourse);

router.get('/courses/:id/students', requirePermission('students:read'), requireCourseInstructor, getCourseStudents);

router.get('/courses/:id/analytics', requirePermission('analytics:view'), requireCourseInstructor, getCourseAnalytics);

router.route('/courses/:courseId/students/:studentId')
    .get(requirePermission('students:progress:view'), requireCourseInstructor, getStudentProgress)
    .put(requirePermission('progress:write'), requireCourseInstructor, updateStudentGrade);

router.get('/students', requirePermission('students:read'), getMyStudents);

// Student enrollment management routes - TODO: Implement these controllers
// router.get('/available-students', requirePermission('students:read'), getAvailableStudents);
// router.post('/courses/:courseId/enroll', requirePermission('enrollment:write'), requireCourseInstructor, enrollStudent);
// router.delete('/courses/:courseId/students/:studentId', requirePermission('enrollment:delete'), requireCourseInstructor, removeStudent);

module.exports = router;