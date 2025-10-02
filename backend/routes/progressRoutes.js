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

// @route   GET /api/progress/learning-goals
// @desc    Get learning goals progress
// @access  Private
router.get('/learning-goals', (req, res) => {
  // Calculate learning goals based on user progress
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = new Date(dayStart.getTime() - (dayStart.getDay() * 24 * 60 * 60 * 1000));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Mock data for now - in production, this would calculate from actual user progress
  const dailyCompleted = Math.floor(Math.random() * 25) + 5; // 5-30 min
  const weeklyCompleted = Math.floor(Math.random() * 180) + 60; // 60-240 min
  const monthlyCompleted = Math.floor(Math.random() * 600) + 200; // 200-800 min
  
  const learningGoals = {
    daily: {
      target: 30,
      completed: dailyCompleted,
      percentage: Math.round((dailyCompleted / 30) * 100)
    },
    weekly: {
      target: 300,
      completed: weeklyCompleted,
      percentage: Math.round((weeklyCompleted / 300) * 100)
    },
    monthly: {
      target: 1200,
      completed: monthlyCompleted,
      percentage: Math.round((monthlyCompleted / 1200) * 100)
    }
  };
  
  res.json(learningGoals);
});

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
