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
router.get('/learning-goals', async (req, res) => {
  try {
    const userId = req.user.id;
    const LearningProgress = require('../models/LearningProgress');
    
    // Calculate time periods
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(dayStart);
    weekStart.setDate(dayStart.getDate() - dayStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get user's learning progress for different time periods
    const [dailyProgress, weeklyProgress, monthlyProgress] = await Promise.all([
      LearningProgress.find({ 
        userId, 
        lastAccessDate: { $gte: dayStart } 
      }),
      LearningProgress.find({ 
        userId, 
        lastAccessDate: { $gte: weekStart } 
      }),
      LearningProgress.find({ 
        userId, 
        lastAccessDate: { $gte: monthStart } 
      })
    ]);
    
    // Calculate actual time spent
    const dailyCompleted = dailyProgress.reduce((total, p) => {
      // Calculate time spent today only
      const lastAccess = new Date(p.lastAccessDate);
      if (lastAccess >= dayStart) {
        return total + (p.totalTimeSpent || 0);
      }
      return total;
    }, 0);
    
    const weeklyCompleted = weeklyProgress.reduce((total, p) => total + (p.totalTimeSpent || 0), 0);
    const monthlyCompleted = monthlyProgress.reduce((total, p) => total + (p.totalTimeSpent || 0), 0);
    
    const learningGoals = {
      daily: {
        target: 30, // 30 minutes
        completed: Math.round(dailyCompleted),
        percentage: Math.min(100, Math.round((dailyCompleted / 30) * 100))
      },
      weekly: {
        target: 300, // 5 hours
        completed: Math.round(weeklyCompleted),
        percentage: Math.min(100, Math.round((weeklyCompleted / 300) * 100))
      },
      monthly: {
        target: 1200, // 20 hours
        completed: Math.round(monthlyCompleted),
        percentage: Math.min(100, Math.round((monthlyCompleted / 1200) * 100))
      }
    };
    
    res.json(learningGoals);
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
