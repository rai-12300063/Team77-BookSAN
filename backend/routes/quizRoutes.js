const express = require('express');
const {
  getCourseQuizzes,
  getQuiz,
  startQuizAttempt,
  saveQuizProgress,
  submitQuizAttempt,
  getQuizResults,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes
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

// Get a specific quiz (for taking)
router.get('/:quizId',
  requirePermission('quiz:read'),
  logApiAccess,
  getQuiz
);

// Start a new quiz attempt
router.post('/:quizId/attempt',
  requirePermission('quiz:take'),
  logApiAccess,
  startQuizAttempt
);

// Save quiz progress (pause functionality)
router.put('/attempt/:attemptId/progress',
  requirePermission('quiz:take'),
  logApiAccess,
  saveQuizProgress
);

// Submit quiz attempt
router.post('/attempt/:attemptId/submit',
  requirePermission('quiz:take'),
  logApiAccess,
  submitQuizAttempt
);

// Get quiz results
router.get('/attempt/:attemptId/results',
  requirePermission('quiz:read'),
  logApiAccess,
  getQuizResults
);

// ========== ADMIN ROUTES ==========

// Get all quizzes (admin management)
router.get('/admin/all',
  requirePermission('quiz:write'),
  logApiAccess,
  getAllQuizzes
);

// Create new quiz in a course
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

module.exports = router;