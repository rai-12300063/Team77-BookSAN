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
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

// Get all quizzes for a course
router.get('/course/:courseId',
  
  
  getCourseQuizzes
);

router.get('/:quizId',
  
  
  getQuiz
);

router.post('/:quizId/submit',
  
  
  submitQuizAttempt
);

// ========== ADMIN ROUTES ==========

// Get all courses for admin (no restrictions)
router.get('/admin/courses',
  
  
  getAllCoursesForAdmin
);

// Get all quizzes (admin management)
router.get('/admin/all',
  
  
  getAllQuizzes
);

// Get a specific quiz for editing (admin - no module completion check)
router.get('/admin/:quizId',
  
  
  getQuizForEdit
);

// Create new quiz in a course (admin can create in ANY course)
router.post('/admin/course/:courseId',
  
  
  createQuiz
);

// Update existing quiz
router.put('/admin/:quizId',
  
  
  updateQuiz
);

// Delete quiz
router.delete('/admin/:quizId',
  
  
  deleteQuiz
);

// ========== INSTRUCTOR ROUTES ==========

// Get a specific quiz for editing (instructor - no module completion check)
router.get('/instructor/:quizId',
  
  
  getQuizForEdit
);

// Get instructor's courses for quiz creation
router.get('/instructor/courses',
  
  
  getInstructorCourses
);

// Get quizzes for instructor's courses
router.get('/instructor/my-quizzes',
  
  
  getInstructorQuizzes
);

// Create new quiz in instructor's assigned course
router.post('/instructor/course/:courseId',
  
  
  createInstructorQuiz
);

// Update quiz in instructor's assigned course
router.put('/instructor/:quizId',
  
  
  updateInstructorQuiz
);

// Delete quiz in instructor's assigned course
router.delete('/instructor/:quizId',
  
  
  deleteInstructorQuiz
);

module.exports = router;