const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');
const User = require('../models/User');

// Get user's learning analytics
const getLearningAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all progress records for the user
    const progressRecords = await LearningProgress.find({ userId })
      .populate('courseId', 'title category estimatedCompletionTime')
      .sort({ lastAccessed: -1 });

    // Calculate overall statistics
    const totalCourses = progressRecords.length;
    const completedCourses = progressRecords.filter(p => p.completionPercentage === 100).length;
    const inProgressCourses = progressRecords.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100).length;
    const totalTimeSpent = progressRecords.reduce((total, p) => total + p.timeSpent, 0);
    
    // Get achievements count
    const totalAchievements = progressRecords.reduce((total, p) => total + p.achievements.length, 0);
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = progressRecords.filter(p => p.lastAccessed >= sevenDaysAgo);

    const analytics = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
      totalAchievements,
      recentActivity: recentActivity.length,
      progressRecords: progressRecords.slice(0, 10) // Latest 10 courses
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update module completion
const updateModuleCompletion = async (req, res) => {
  try {
    const { courseId, moduleId, timeSpent } = req.body;
    const userId = req.user.id;

    let progress = await LearningProgress.findOne({ userId, courseId });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    // Update module completion
    const moduleIndex = progress.completedModules.findIndex(m => m.moduleId === moduleId);
    if (moduleIndex === -1) {
      progress.completedModules.push({
        moduleId,
        completedAt: new Date(),
        timeSpent: timeSpent || 0
      });
    } else {
      progress.completedModules[moduleIndex].timeSpent += timeSpent || 0;
    }

    // Get course to calculate completion percentage
    const course = await Course.findById(courseId);
    if (course) {
      const totalModules = course.syllabus.length;
      const completedModulesCount = progress.completedModules.length;
      progress.completionPercentage = Math.round((completedModulesCount / totalModules) * 100);
    }

    // Update time spent and last accessed
    progress.timeSpent += timeSpent || 0;
    progress.lastAccessed = new Date();

    // Check for new achievements
    if (progress.completionPercentage === 100 && !progress.achievements.includes('course_completed')) {
      progress.achievements.push('course_completed');
    }
    if (progress.timeSpent >= 600 && !progress.achievements.includes('study_warrior')) { // 10 hours
      progress.achievements.push('study_warrior');
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error('Error updating module completion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress for a specific course
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await LearningProgress.findOne({ userId, courseId })
      .populate('courseId', 'title syllabus estimatedCompletionTime');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get learning streaks and habits
const getLearningStreaks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get progress records to analyze learning patterns
    const progressRecords = await LearningProgress.find({ userId })
      .sort({ lastAccessed: -1 });

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check each day backwards to find streak
    for (let i = 0; i < 365; i++) { // Check up to a year
      const dayProgress = progressRecords.find(p => {
        const progressDate = new Date(p.lastAccessed);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === checkDate.getTime();
      });

      if (dayProgress) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Update user's current streak
    user.currentStreak = currentStreak;
    if (currentStreak > user.longestStreak) {
      user.longestStreak = currentStreak;
    }
    await user.save();

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      learningGoals: user.learningGoals
    });
  } catch (error) {
    console.error('Error fetching learning streaks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update learning goals
const updateLearningGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dailyGoal, weeklyGoal, monthlyGoal } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.learningGoals = {
      dailyGoal: dailyGoal || user.learningGoals?.dailyGoal || 30,
      weeklyGoal: weeklyGoal || user.learningGoals?.weeklyGoal || 300,
      monthlyGoal: monthlyGoal || user.learningGoals?.monthlyGoal || 1200
    };

    await user.save();
    res.json({ message: 'Learning goals updated successfully', learningGoals: user.learningGoals });
  } catch (error) {
    console.error('Error updating learning goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLearningAnalytics,
  updateModuleCompletion,
  getCourseProgress,
  getLearningStreaks,
  updateLearningGoals
};
