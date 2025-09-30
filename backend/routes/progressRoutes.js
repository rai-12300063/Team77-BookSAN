const express = require('express');
const router = express.Router();
const {
  getLearningAnalytics,
  updateModuleCompletion,
  getCourseProgress,
  getLearningStreaks,
  updateLearningGoals,
  syncProgress,
  getDetailedProgressReport
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   GET /api/progress/analytics
// @desc    Get user's learning analytics and statistics
// @access  Private
router.get('/analytics', getLearningAnalytics);

// @route   PUT /api/progress/module
// @desc    Update module completion for a course
// @access  Private
router.put('/module', updateModuleCompletion);

// @route   GET /api/progress/course/:courseId
// @desc    Get progress for a specific course
// @access  Private
router.get('/course/:courseId', getCourseProgress);

// @route   GET /api/progress/streaks
// @desc    Get learning streaks and habits
// @access  Private
router.get('/streaks', getLearningStreaks);

// @route   PUT /api/progress/goals
// @desc    Update learning goals
// @access  Private
router.put('/goals', updateLearningGoals);

// @route   POST /api/progress/course/:courseId/sync
// @desc    Manually sync module progress with course progress
// @access  Private
router.post('/course/:courseId/sync', syncProgress);

// @route   GET /api/progress/course/:courseId/detailed-report
// @desc    Get detailed progress synchronization report
// @access  Private
router.get('/course/:courseId/detailed-report', getDetailedProgressReport);

module.exports = router;
