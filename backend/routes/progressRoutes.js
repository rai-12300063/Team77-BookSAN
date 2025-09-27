const express = require('express');
const router = express.Router();
const {
  getLearningAnalytics,
  updateModuleCompletion,
  getCourseProgress,
  getLearningStreaks,
  updateLearningGoals
} = require('../controllers/progressController');
const { protect, requireAnyRole, requirePermission } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(requireAnyRole);

// @route   GET /api/progress/analytics
// @desc    Get user's learning analytics and statistics
// @access  Private
router.get('/analytics', requirePermission('progress:read'), getLearningAnalytics);

// @route   PUT /api/progress/module
// @desc    Update module completion for a course
// @access  Private
router.put('/module', requirePermission('progress:write'), updateModuleCompletion);

// @route   GET /api/progress/course/:courseId
// @desc    Get progress for a specific course
// @access  Private
router.get('/course/:courseId', requirePermission('progress:read'), getCourseProgress);

// @route   GET /api/progress/streaks
// @desc    Get learning streaks and habits
// @access  Private
router.get('/streaks', requirePermission('progress:read'), getLearningStreaks);

// @route   PUT /api/progress/goals
// @desc    Update learning goals
// @access  Private
router.put('/goals', requirePermission('progress:write'), updateLearningGoals);

module.exports = router;
