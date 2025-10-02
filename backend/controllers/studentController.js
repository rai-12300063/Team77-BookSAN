const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');
const Task = require('../models/Task');
const { USER_ROLES } = require('../constants/roles');

const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            enrolledCourses,
            recentTasks,
            user,
            progressStats
        ] = await Promise.all([
            LearningProgress.find({ userId })
                .populate('courseId', 'title category difficulty instructor estimatedCompletionTime')
                .sort({ lastAccessDate: -1 })
                .limit(5),
            Task.find({ userId })
                .sort({ deadline: 1 })
                .limit(5),
            User.findById(userId),
            LearningProgress.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: null,
                        totalCourses: { $sum: 1 },
                        completedCourses: {
                            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
                        },
                        averageProgress: { $avg: '$completionPercentage' },
                        totalTimeSpent: { $sum: '$totalTimeSpent' },
                        totalAchievements: { $sum: { $size: '$achievements' } }
                    }
                }
            ])
        ]);

        const stats = progressStats[0] || {
            totalCourses: 0,
            completedCourses: 0,
            averageProgress: 0,
            totalTimeSpent: 0,
            totalAchievements: 0
        };

        const upcomingDeadlines = recentTasks.filter(task =>
            !task.completed && task.deadline && new Date(task.deadline) > new Date()
        );

        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    currentStreak: user.currentStreak || 0,
                    longestStreak: user.longestStreak || 0,
                    totalLearningHours: Math.round(stats.totalTimeSpent / 60) || 0,
                    learningGoals: user.learningGoals || {}
                },
                stats: {
                    totalCourses: stats.totalCourses,
                    completedCourses: stats.completedCourses,
                    inProgressCourses: stats.totalCourses - stats.completedCourses,
                    averageProgress: Math.round(stats.averageProgress || 0),
                    totalAchievements: stats.totalAchievements
                },
                recentCourses: enrolledCourses,
                upcomingDeadlines,
                recentAchievements: enrolledCourses
                    .flatMap(course => course.achievements || [])
                    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                    .slice(0, 3)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard',
            error: error.message
        });
    }
};

const getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status = 'all', category, difficulty } = req.query;

        let filter = { userId };

        if (status === 'completed') {
            filter.isCompleted = true;
        } else if (status === 'in-progress') {
            filter.isCompleted = false;
            filter.completionPercentage = { $gt: 0 };
        } else if (status === 'not-started') {
            filter.completionPercentage = 0;
        }

        let courses = await LearningProgress.find(filter)
            .populate('courseId')
            .sort({ lastAccessDate: -1 });

        if (category || difficulty) {
            courses = courses.filter(course => {
                const courseData = course.courseId;
                return (!category || courseData.category === category) &&
                       (!difficulty || courseData.difficulty === difficulty);
            });
        }

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching courses',
            error: error.message
        });
    }
};

const getCourseDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;

        const [course, progress] = await Promise.all([
            Course.findById(courseId)
                .populate('instructor.id', 'name email'),
            LearningProgress.findOne({ userId, courseId })
        ]);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (!progress) {
            return res.status(403).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        const courseWithProgress = {
            ...course.toObject(),
            progress: {
                completionPercentage: progress.completionPercentage,
                currentModule: progress.currentModule,
                modulesCompleted: progress.modulesCompleted,
                totalTimeSpent: progress.totalTimeSpent,
                lastAccessDate: progress.lastAccessDate,
                isCompleted: progress.isCompleted,
                grade: progress.grade,
                achievements: progress.achievements,
                bookmarks: progress.bookmarks,
                notes: progress.notes
            }
        };

        res.status(200).json({
            success: true,
            data: courseWithProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching course details',
            error: error.message
        });
    }
};

const updateProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;
        const { moduleIndex, timeSpent = 0, notes } = req.body;

        const progress = await LearningProgress.findOne({ userId, courseId });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress record not found'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (moduleIndex !== undefined) {
            if (moduleIndex >= course.syllabus.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid module index'
                });
            }

            const existingCompletion = progress.modulesCompleted.find(m => m.moduleIndex === moduleIndex);

            if (!existingCompletion) {
                progress.modulesCompleted.push({
                    moduleIndex,
                    completedAt: new Date(),
                    timeSpent: timeSpent
                });
            } else {
                existingCompletion.timeSpent += timeSpent;
            }

            const totalModules = course.syllabus.length;
            const completedModulesCount = progress.modulesCompleted.length;
            progress.completionPercentage = Math.round((completedModulesCount / totalModules) * 100);
            progress.currentModule = Math.max(progress.currentModule, moduleIndex + 1);

            if (progress.completionPercentage === 100 && !progress.isCompleted) {
                progress.isCompleted = true;
                progress.completionDate = new Date();

                const hasCompletionAchievement = progress.achievements.some(a => a.type === 'course_completed');
                if (!hasCompletionAchievement) {
                    progress.achievements.push({
                        type: 'course_completed',
                        description: `Completed ${course.title}`,
                        unlockedAt: new Date()
                    });
                }
            }
        }

        progress.totalTimeSpent += timeSpent;
        progress.lastAccessDate = new Date();

        if (notes !== undefined) {
            progress.notes = notes;
        }

        if (progress.totalTimeSpent >= 600) {
            const hasTimeAchievement = progress.achievements.some(a => a.type === 'study_warrior');
            if (!hasTimeAchievement) {
                progress.achievements.push({
                    type: 'study_warrior',
                    description: 'Spent 10+ hours learning',
                    unlockedAt: new Date()
                });
            }
        }

        await progress.save();

        const user = await User.findById(userId);
        user.totalLearningHours = (user.totalLearningHours || 0) + (timeSpent / 60);
        user.lastLearningDate = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Progress updated successfully',
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating progress',
            error: error.message
        });
    }
};

const addBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;
        const { moduleIndex, topic, note } = req.body;

        if (moduleIndex === undefined || !topic) {
            return res.status(400).json({
                success: false,
                message: 'Module index and topic are required'
            });
        }

        const progress = await LearningProgress.findOne({ userId, courseId });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress record not found'
            });
        }

        progress.bookmarks.push({
            moduleIndex,
            topic,
            note: note || '',
            createdAt: new Date()
        });

        await progress.save();

        res.status(201).json({
            success: true,
            message: 'Bookmark added successfully',
            data: progress.bookmarks[progress.bookmarks.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while adding bookmark',
            error: error.message
        });
    }
};

const removeBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;
        const bookmarkId = req.params.bookmarkId;

        const progress = await LearningProgress.findOne({ userId, courseId });
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress record not found'
            });
        }

        progress.bookmarks = progress.bookmarks.filter(
            bookmark => bookmark._id.toString() !== bookmarkId
        );

        await progress.save();

        res.status(200).json({
            success: true,
            message: 'Bookmark removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while removing bookmark',
            error: error.message
        });
    }
};

const getAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        const progressRecords = await LearningProgress.find({ userId })
            .populate('courseId', 'title');

        const allAchievements = progressRecords.flatMap(progress =>
            progress.achievements.map(achievement => ({
                ...achievement.toObject(),
                courseName: progress.courseId.title
            }))
        );

        const achievementStats = {
            total: allAchievements.length,
            courseCompletions: allAchievements.filter(a => a.type === 'course_completed').length,
            studyWarrior: allAchievements.filter(a => a.type === 'study_warrior').length,
            recent: allAchievements
                .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
                .slice(0, 5)
        };

        res.status(200).json({
            success: true,
            data: {
                achievements: allAchievements,
                stats: achievementStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching achievements',
            error: error.message
        });
    }
};

const updateLearningGoals = async (req, res) => {
    try {
        const userId = req.user.id;
        const { dailyGoal, weeklyGoal, monthlyGoal } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.learningGoals = {
            dailyGoal: dailyGoal || user.learningGoals?.dailyGoal || 30,
            weeklyGoal: weeklyGoal || user.learningGoals?.weeklyGoal || 300,
            monthlyGoal: monthlyGoal || user.learningGoals?.monthlyGoal || 1200
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Learning goals updated successfully',
            data: user.learningGoals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating learning goals',
            error: error.message
        });
    }
};

const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        const [user, enrolledCourses] = await Promise.all([
            User.findById(userId),
            LearningProgress.find({ userId }).populate('courseId')
        ]);

        const enrolledCourseIds = enrolledCourses.map(p => p.courseId._id);
        const userSkills = user.skillTags || [];
        const completedCategories = enrolledCourses
            .filter(p => p.isCompleted)
            .map(p => p.courseId.category);

        let filter = {
            _id: { $nin: enrolledCourseIds },
            isActive: true
        };

        if (userSkills.length > 0) {
            filter.$or = [
                { category: { $in: completedCategories } },
                { prerequisites: { $in: userSkills } }
            ];
        }

        const recommendations = await Course.find(filter)
            .populate('instructor.id', 'name')
            .sort({ enrollmentCount: -1, rating: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recommendations',
            error: error.message
        });
    }
};

module.exports = {
    getDashboard,
    getMyCourses,
    getCourseDetails,
    updateProgress,
    addBookmark,
    removeBookmark,
    getAchievements,
    updateLearningGoals,
    getRecommendations
};