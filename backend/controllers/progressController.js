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

    // Get course to find module index
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the module index in the course syllabus
    const moduleIndex = course.syllabus.findIndex(module => module._id.toString() === moduleId);
    if (moduleIndex === -1) {
      return res.status(400).json({ message: 'Module not found in course' });
    }

    // Check if module is already completed
    const existingCompletion = progress.modulesCompleted.find(m => m.moduleIndex === moduleIndex);
    
    if (!existingCompletion) {
      // Add new completion
      progress.modulesCompleted.push({
        moduleIndex,
        completedAt: new Date(),
        timeSpent: timeSpent || 0
      });
    } else {
      // Update existing completion time
      existingCompletion.timeSpent += timeSpent || 0;
    }

    // Calculate completion percentage
    const totalModules = course.syllabus.length;
    const completedModulesCount = progress.modulesCompleted.length;
    progress.completionPercentage = Math.round((completedModulesCount / totalModules) * 100);

    // Update total time spent and last accessed
    progress.totalTimeSpent += timeSpent || 0;
    progress.lastAccessDate = new Date();

    // Update current module to the next incomplete one
    progress.currentModule = Math.max(progress.currentModule, moduleIndex + 1);

    // Check for course completion
    if (progress.completionPercentage === 100) {
      progress.isCompleted = true;
      progress.completionDate = new Date();
      
      // Add course completion achievement if not already present
      const hasCompletionAchievement = progress.achievements.some(a => a.type === 'course_completed');
      if (!hasCompletionAchievement) {
        progress.achievements.push({
          type: 'course_completed',
          description: `Completed ${course.title}`
        });
      }
    }

    // Check for time-based achievements
    if (progress.totalTimeSpent >= 600) { // 10 hours
      const hasTimeAchievement = progress.achievements.some(a => a.type === 'study_warrior');
      if (!hasTimeAchievement) {
        progress.achievements.push({
          type: 'study_warrior',
          description: 'Spent 10+ hours learning'
        });
      }
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
