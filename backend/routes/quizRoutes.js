const express = require('express');
const {
  getCourseQuizzes,
  getQuiz,
  submitQuizAttempt,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizForEdit,
  getInstructorQuizzes,
  createInstructorQuiz,
  updateInstructorQuiz,
  deleteInstructorQuiz,
  getInstructorCourses,
  getAllCoursesForAdmin
} = require('../controllers/quizController');
const { protect, requirePermission, requireAnyRole } = require('../middleware/authMiddleware');
const { logApiAccess } = require('../middleware/permissionMiddleware');

const router = express.Router();

// All quiz routes require authentication
router.use(protect);
router.use(requireAnyRole);

// Get all quizzes for a course
router.get('/course/:courseId',
  requirePermission('quiz:read'),
  logApiAccess,
  getCourseQuizzes
);

router.get('/:quizId',
  requirePermission('quiz:read'),
  logApiAccess,
  getQuiz
);

router.post('/:quizId/submit',
  requirePermission('quiz:take'),
  logApiAccess,
  submitQuizAttempt
);

// ========== ADMIN ROUTES ==========

// Get all courses for admin (no restrictions)
router.get('/admin/courses',
  requirePermission('quiz:write'),
  logApiAccess,
  getAllCoursesForAdmin
);

// Get all quizzes (admin management)
router.get('/admin/all',
  requirePermission('quiz:write'),
  logApiAccess,
  getAllQuizzes
);

// Get a specific quiz for editing (admin - no module completion check)
router.get('/admin/:quizId',
  requirePermission('quiz:write'),
  logApiAccess,
  getQuizForEdit
);

// Create new quiz in a course (admin can create in ANY course)
router.post('/admin/course/:courseId',
  requirePermission('quiz:write'),
  logApiAccess,
  createQuiz
);

// Update existing quiz
router.put('/admin/:quizId',
  requirePermission('quiz:write'),
  logApiAccess,
  updateQuiz
);

// Delete quiz
router.delete('/admin/:quizId',
  requirePermission('quiz:delete'),
  logApiAccess,
  deleteQuiz
);

// ========== INSTRUCTOR ROUTES ==========

// Get a specific quiz for editing (instructor - no module completion check)
router.get('/instructor/:quizId',
  requirePermission('quiz:write'),
  logApiAccess,
  getQuizForEdit
);

// Get instructor's courses for quiz creation
router.get('/instructor/courses',
  requirePermission('quiz:write'),
  logApiAccess,
  getInstructorCourses
);

// Get quizzes for instructor's courses
router.get('/instructor/my-quizzes',
  requirePermission('quiz:write'),
  logApiAccess,
  getInstructorQuizzes
);

// Create new quiz in instructor's assigned course
router.post('/instructor/course/:courseId',
  requirePermission('quiz:write'),
  logApiAccess,
  createInstructorQuiz
);

// Update quiz in instructor's assigned course
router.put('/instructor/:quizId',
  requirePermission('quiz:write'),
  logApiAccess,
  updateInstructorQuiz
);

// Delete quiz in instructor's assigned course
router.delete('/instructor/:quizId',
  requirePermission('quiz:write'),
  logApiAccess,
  deleteInstructorQuiz
);

module.exports = router;