/**
 * Progress Synchronization Service
 * Handles synchronization between module progress and course progress
 * Implements real-time updates when module progress changes
 */

const LearningProgress = require('../models/LearningProgress');
const ModuleProgress = require('../models/ModuleProgress');
const Module = require('../models/Module');
const Course = require('../models/Course');

class ProgressSyncService {
    /**
     * Synchronize module progress with course progress
     * Called whenever a module progress is updated
     */
    static async syncModuleWithCourse(userId, courseId, moduleId = null) {
        try {
            console.log(`🔄 Syncing progress for user ${userId}, course ${courseId}`);
            
            // Get all module progresses for this user and course
            const moduleProgresses = await ModuleProgress.find({ 
                userId, 
                courseId 
            }).populate('moduleId');

            // Get or create learning progress record
            let learningProgress = await LearningProgress.findOne({ userId, courseId });
            if (!learningProgress) {
                learningProgress = new LearningProgress({
                    userId,
                    courseId,
                    enrollmentDate: new Date()
                });
            }

            // Get total modules for this course
            const totalModules = await Module.countDocuments({ courseId });
            
            // Calculate completion statistics
            const completedModules = moduleProgresses.filter(mp => mp.isCompleted).length;
            const inProgressModules = moduleProgresses.filter(mp => mp.status === 'in-progress').length;
            
            // Update basic progress metrics
            learningProgress.moduleProgress.totalModules = totalModules;
            learningProgress.moduleProgress.completedModules = completedModules;
            learningProgress.completionPercentage = totalModules > 0 ? 
                Math.round((completedModules / totalModules) * 100) : 0;

            // Update current module
            const currentInProgressModule = moduleProgresses.find(mp => 
                mp.status === 'in-progress' && mp.lastAccessedAt
            );
            
            if (currentInProgressModule) {
                learningProgress.moduleProgress.currentModuleId = currentInProgressModule.moduleId._id;
                learningProgress.currentModule = currentInProgressModule.moduleId.moduleNumber || 0;
            }

            // Calculate time spent across all modules
            const totalTimeSpent = moduleProgresses.reduce((total, mp) => 
                total + (mp.totalTimeSpent || 0), 0
            );
            learningProgress.totalTimeSpent = totalTimeSpent;

            // Calculate average module score
            const scoredModules = moduleProgresses.filter(mp => 
                mp.moduleAssessment && mp.moduleAssessment.bestScorePercentage > 0
            );
            
            if (scoredModules.length > 0) {
                const averageScore = scoredModules.reduce((sum, mp) => 
                    sum + mp.moduleAssessment.bestScorePercentage, 0) / scoredModules.length;
                learningProgress.moduleProgress.averageModuleScore = Math.round(averageScore);
                learningProgress.grade = Math.round(averageScore);
            }

            // Update modules completed array for backward compatibility
            learningProgress.modulesCompleted = moduleProgresses
                .filter(mp => mp.isCompleted)
                .map(mp => ({
                    moduleId: mp.moduleId._id,
                    moduleIndex: mp.moduleId.moduleNumber - 1,
                    completedAt: mp.completedAt,
                    timeSpent: Math.round((mp.totalTimeSpent || 0) / 60), // convert to minutes
                    score: mp.moduleAssessment?.bestScorePercentage || 0,
                    attempts: mp.moduleAssessment?.totalAttempts || 1
                }));

            // Check if course is completed
            const isCompleted = completedModules === totalModules && totalModules > 0;
            if (isCompleted && !learningProgress.isCompleted) {
                learningProgress.isCompleted = true;
                learningProgress.completionDate = new Date();
                
                // Trigger course completion achievements
                await this.triggerCourseCompletionRewards(learningProgress);
            }

            // Identify struggling modules
            await this.identifyStrugglingModules(learningProgress, moduleProgresses);

            // Update last access date
            learningProgress.lastAccessDate = new Date();

            // Save the updated learning progress
            await learningProgress.save();

            console.log(`✅ Progress synced: ${completedModules}/${totalModules} modules completed`);
            
            return learningProgress;

        } catch (error) {
            console.error('❌ Error syncing module with course progress:', error);
            throw error;
        }
    }

    /**
     * Sync specific module completion
     */
    static async syncModuleCompletion(userId, courseId, moduleId, completionData = {}) {
        try {
            console.log(`🎯 Syncing module completion: ${moduleId}`);
            
            // Update the module progress
            const moduleProgress = await ModuleProgress.findOne({ 
                userId, 
                courseId, 
                moduleId 
            });

            if (moduleProgress) {
                moduleProgress.isCompleted = true;
                moduleProgress.completedAt = new Date();
                moduleProgress.status = 'completed';
                
                // Add completion data if provided
                if (completionData.timeSpent) {
                    moduleProgress.totalTimeSpent += completionData.timeSpent;
                }
                if (completionData.score) {
                    moduleProgress.moduleAssessment.bestScorePercentage = Math.max(
                        moduleProgress.moduleAssessment.bestScorePercentage || 0,
                        completionData.score
                    );
                }

                await moduleProgress.save();
            }

            // Sync with course progress
            return await this.syncModuleWithCourse(userId, courseId, moduleId);

        } catch (error) {
            console.error('❌ Error syncing module completion:', error);
            throw error;
        }
    }

    /**
     * Identify modules where student is struggling
     */
    static async identifyStrugglingModules(learningProgress, moduleProgresses) {
        try {
            const strugglingModules = [];

            for (const mp of moduleProgresses) {
                let isStruggling = false;
                let reason = '';

                // High attempt count
                if (mp.moduleAssessment.totalAttempts > 3) {
                    isStruggling = true;
                    reason = 'Multiple assessment attempts';
                }

                // Low scores
                if (mp.moduleAssessment.bestScorePercentage > 0 && 
                    mp.moduleAssessment.bestScorePercentage < 60) {
                    isStruggling = true;
                    reason = reason ? `${reason}, Low assessment scores` : 'Low assessment scores';
                }

                // Taking too long (more than 2x estimated time)
                const estimatedTime = mp.moduleId?.estimatedDuration || 0;
                if (estimatedTime > 0 && mp.totalTimeSpent > estimatedTime * 2) {
                    isStruggling = true;
                    reason = reason ? `${reason}, Extended time spent` : 'Extended time spent';
                }

                // In progress for too long (more than 7 days)
                if (mp.status === 'in-progress' && mp.startedAt) {
                    const daysSinceStart = (Date.now() - mp.startedAt) / (1000 * 60 * 60 * 24);
                    if (daysSinceStart > 7) {
                        isStruggling = true;
                        reason = reason ? `${reason}, Long duration without completion` : 'Long duration without completion';
                    }
                }

                if (isStruggling) {
                    // Check if already identified
                    const existingStruggle = learningProgress.moduleProgress.strugglingModules.find(
                        sm => sm.moduleId.toString() === mp.moduleId._id.toString()
                    );

                    if (!existingStruggle) {
                        strugglingModules.push({
                            moduleId: mp.moduleId._id,
                            reason,
                            detectedAt: new Date()
                        });
                    }
                }
            }

            // Add new struggling modules
            learningProgress.moduleProgress.strugglingModules.push(...strugglingModules);

            // Remove modules that are no longer struggling (completed with good scores)
            learningProgress.moduleProgress.strugglingModules = 
                learningProgress.moduleProgress.strugglingModules.filter(sm => {
                    const mp = moduleProgresses.find(p => 
                        p.moduleId._id.toString() === sm.moduleId.toString()
                    );
                    return !(mp?.isCompleted && mp.moduleAssessment?.bestScorePercentage >= 70);
                });

        } catch (error) {
            console.error('❌ Error identifying struggling modules:', error);
        }
    }

    /**
     * Trigger rewards and achievements for course completion
     */
    static async triggerCourseCompletionRewards(learningProgress) {
        try {
            console.log(`🏆 Triggering course completion rewards`);
            
            // Add course completion achievement
            if (!learningProgress.achievements.some(a => a.type === 'course-completion')) {
                learningProgress.achievements.push({
                    type: 'course-completion',
                    unlockedAt: new Date(),
                    description: 'Successfully completed the entire course'
                });
            }

            // Perfect course achievement (all modules > 90%)
            if (learningProgress.moduleProgress.averageModuleScore >= 90) {
                learningProgress.achievements.push({
                    type: 'perfect-course',
                    unlockedAt: new Date(),
                    description: 'Completed course with excellent performance'
                });
            }

            // Speed learner achievement
            const course = await Course.findById(learningProgress.courseId);
            if (course && learningProgress.totalTimeSpent < course.estimatedCompletionTime * 0.75) {
                learningProgress.achievements.push({
                    type: 'speed-learner',
                    unlockedAt: new Date(),
                    description: 'Completed course faster than expected'
                });
            }

            // Set certificate eligibility
            if (learningProgress.moduleProgress.averageModuleScore >= 70) {
                learningProgress.certificateIssued = true;
                learningProgress.certificateId = `CERT-${Date.now()}-${learningProgress.userId}`;
            }

        } catch (error) {
            console.error('❌ Error triggering course completion rewards:', error);
        }
    }

    /**
     * Sync progress for all users in a course (admin function)
     */
    static async syncAllUsersInCourse(courseId) {
        try {
            console.log(`🔄 Syncing progress for all users in course ${courseId}`);
            
            const learningProgresses = await LearningProgress.find({ courseId });
            const results = [];

            for (const lp of learningProgresses) {
                try {
                    const result = await this.syncModuleWithCourse(lp.userId, courseId);
                    results.push({ userId: lp.userId, success: true });
                } catch (error) {
                    console.error(`❌ Failed to sync for user ${lp.userId}:`, error);
                    results.push({ userId: lp.userId, success: false, error: error.message });
                }
            }

            return results;

        } catch (error) {
            console.error('❌ Error syncing all users in course:', error);
            throw error;
        }
    }

    /**
     * Get progress synchronization report
     */
    static async getProgressSyncReport(userId, courseId) {
        try {
            const learningProgress = await LearningProgress.findOne({ userId, courseId });
            const moduleProgresses = await ModuleProgress.find({ userId, courseId })
                .populate('moduleId');
            const totalModules = await Module.countDocuments({ courseId });

            return {
                summary: {
                    totalModules,
                    completedModules: learningProgress?.moduleProgress.completedModules || 0,
                    inProgressModules: moduleProgresses.filter(mp => mp.status === 'in-progress').length,
                    notStartedModules: totalModules - moduleProgresses.length,
                    averageScore: learningProgress?.moduleProgress.averageModuleScore || 0,
                    totalTimeSpent: learningProgress?.totalTimeSpent || 0,
                    isCompleted: learningProgress?.isCompleted || false
                },
                struggles: learningProgress?.moduleProgress.strugglingModules || [],
                achievements: learningProgress?.achievements || [],
                lastSyncedAt: learningProgress?.lastAccessDate || null
            };

        } catch (error) {
            console.error('❌ Error getting progress sync report:', error);
            throw error;
        }
    }
}

module.exports = ProgressSyncService;