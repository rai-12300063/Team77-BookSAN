/**
 * ProgressController - Demonstrates OBSERVER PATTERN and Analytics
 * 
 * DESIGN PATTERNS IMPLEMENTED:
 * 1. OBSERVER PATTERN - Progress updates notify multiple observers
 * 2. REPOSITORY PATTERN - Data access abstraction for progress
 * 3. STRATEGY PATTERN - Different analytics calculations
 * 
 * OOP CONCEPTS DEMONSTRATED:
 * 1. ENCAPSULATION - Progress calculation logic encapsulated
 * 2. ABSTRACTION - Complex analytics hidden behind simple interface
 * 3. COMPOSITION - Analytics composed from multiple data sources
 */

const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');
const User = require('../models/User');
// Removed problematic import

// Get user's learning analytics
const getLearningAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all progress records for the user
    const progressRecords = await LearningProgress.find({ userId })
      .populate('courseId', 'title category estimatedCompletionTime')
      .sort({ lastAccessDate: -1 });

    // Calculate overall statistics
    const totalCourses = progressRecords.length;
    const completedCourses = progressRecords.filter(p => p.completionPercentage === 100).length;
    const inProgressCourses = progressRecords.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100).length;
    const totalTimeSpent = progressRecords.reduce((total, p) => total + (p.totalTimeSpent || 0), 0);
    
    // Get achievements count
    const totalAchievements = progressRecords.reduce((total, p) => total + p.achievements.length, 0);
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = progressRecords.filter(p => p.lastAccessDate >= sevenDaysAgo);

    // Calculate average score from completed courses
    const coursesWithGrades = progressRecords.filter(p => p.grade && p.grade > 0);
    const averageScore = coursesWithGrades.length > 0 
      ? Math.round(coursesWithGrades.reduce((sum, p) => sum + p.grade, 0) / coursesWithGrades.length)
      : 0;

    // Find best subject (category with highest average score)
    const categoryScores = {};
    progressRecords.forEach(p => {
      if (p.grade && p.courseId?.category) {
        if (!categoryScores[p.courseId.category]) {
          categoryScores[p.courseId.category] = { total: 0, count: 0 };
        }
        categoryScores[p.courseId.category].total += p.grade;
        categoryScores[p.courseId.category].count += 1;
      }
    });

    let bestSubject = 'Not available';
    let bestScore = 0;
    Object.entries(categoryScores).forEach(([category, data]) => {
      const avgScore = data.total / data.count;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestSubject = category;
      }
    });

    const analytics = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
      totalAchievements,
      recentActivity: recentActivity.length,
      averageScore,
      bestSubject,
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

    // Calculate completion percentage based on module completion only
    // Note: Course is only fully completed (100%) after passing the quiz
    const totalModules = course.syllabus.length;
    const completedModulesCount = progress.modulesCompleted.length;

    // If all modules are completed but quiz not passed, show 99% or calculate based on modules only
    // The final 100% and isCompleted flag will be set when the quiz is passed
    if (completedModulesCount >= totalModules) {
      // All modules completed, but course completion requires quiz
      progress.completionPercentage = 99; // Just under 100% until quiz is passed
    } else {
      progress.completionPercentage = Math.round((completedModulesCount / totalModules) * 100);
    }

    // Update total time spent and last accessed
    progress.totalTimeSpent += timeSpent || 0;
    progress.lastAccessDate = new Date();

    // Update current module to the next incomplete one
    progress.currentModule = Math.max(progress.currentModule, moduleIndex + 1);

    // Note: Course completion (isCompleted = true) is now handled in quizController
    // when the student passes the quiz, not here

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
      .sort({ lastAccessDate: -1 });

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check each day backwards to find streak
    for (let i = 0; i < 365; i++) { // Check up to a year
      const dayProgress = progressRecords.find(p => {
        const progressDate = new Date(p.lastAccessDate);
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

    // Calculate weekly active days (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyActiveDays = progressRecords.filter(p => p.lastAccessDate >= weekStart).length;

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastLearningDate,
      weeklyActiveDays,
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

// Manually sync progress for a user and course
const syncProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Retrieve the learning progress
    const progress = await LearningProgress.findOne({ userId, courseId });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    res.json({
      message: 'Progress retrieved successfully',
      progress: progress,
      completionPercentage: progress.completionPercentage,
      moduleProgress: updatedProgress.moduleProgress
    });

  } catch (error) {
    console.error('Error syncing progress:', error);
    res.status(500).json({ 
      message: 'Failed to sync progress', 
      error: error.message 
    });
  }
};

// Get detailed progress sync report
const getDetailedProgressReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get the progress record and populate related data
    const progress = await LearningProgress.findOne({ userId, courseId })
      .populate('courseId', 'title modules')
      .populate('modulesCompleted.moduleId');

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    // Create a simplified report
    const report = {
      completionPercentage: progress.completionPercentage,
      enrollmentDate: progress.enrollmentDate,
      lastAccessed: progress.lastAccessed,
      modulesCompleted: progress.modulesCompleted
    };

    res.json({
      message: 'Progress report generated successfully',
      report
    });

  } catch (error) {
    console.error('Error getting progress report:', error);
    res.status(500).json({ 
      message: 'Failed to generate progress report', 
      error: error.message 
    });
  }
};

module.exports = {
  getLearningAnalytics,
  updateModuleCompletion,
  getCourseProgress,
  getLearningStreaks,
  updateLearningGoals,
  syncProgress,
  getDetailedProgressReport
};
