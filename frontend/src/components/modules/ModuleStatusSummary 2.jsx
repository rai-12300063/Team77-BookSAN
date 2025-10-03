/**
 * ModuleStatusSummary.jsx - Displays overall module completion status for a course
 * Shows statistics and overview of all modules in a course
 */

import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const ModuleStatusSummary = ({ courseId, className = "" }) => {
    const [summary, setSummary] = useState({
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        lockedModules: 0,
        overallProgress: 0,
        recentActivity: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModulesSummary();
    }, [courseId]);

    const fetchModulesSummary = async () => {
        try {
            setLoading(true);
            const [modulesResponse, progressResponse] = await Promise.all([
                axios.get(`/api/modules/course/${courseId}`),
                axios.get(`/api/module-progress/course/${courseId}`).catch(() => ({ data: { moduleProgresses: [] } }))
            ]);

            const modules = modulesResponse.data.modules || [];
            const progresses = progressResponse.data.moduleProgresses || [];

            // Create progress map
            const progressMap = {};
            progresses.forEach(progress => {
                progressMap[progress.moduleId] = progress;
            });

            let completed = 0;
            let inProgress = 0;
            let locked = 0;
            let totalProgress = 0;
            let recentActivity = null;

            modules.forEach(module => {
                const progress = progressMap[module._id];
                
                if (!progress || progress.completionStatus === 'not_started') {
                    // Check if module is locked
                    const isLocked = module.prerequisites && module.prerequisites.length > 0 &&
                        module.prerequisites.some(prereqId => {
                            const prereqProgress = progressMap[prereqId];
                            return !prereqProgress || prereqProgress.completionStatus !== 'completed';
                        });
                    
                    if (isLocked) {
                        locked++;
                    }
                } else if (progress.completionStatus === 'in_progress') {
                    inProgress++;
                    totalProgress += (progress.completionPercentage || 0);
                    
                    // Track most recent activity
                    if (progress.lastActivityDate) {
                        const activityDate = new Date(progress.lastActivityDate);
                        if (!recentActivity || activityDate > recentActivity) {
                            recentActivity = activityDate;
                        }
                    }
                } else if (progress.completionStatus === 'completed') {
                    completed++;
                    totalProgress += 100;
                    
                    // Track most recent activity
                    if (progress.lastActivityDate) {
                        const activityDate = new Date(progress.lastActivityDate);
                        if (!recentActivity || activityDate > recentActivity) {
                            recentActivity = activityDate;
                        }
                    }
                }
            });

            const overallProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;

            setSummary({
                totalModules: modules.length,
                completedModules: completed,
                inProgressModules: inProgress,
                lockedModules: locked,
                overallProgress,
                recentActivity
            });

        } catch (error) {
            console.error('Error fetching modules summary:', error);
            setError('Failed to load module summary');
        } finally {
            setLoading(false);
        }
    };

    const formatLastActivity = (date) => {
        if (!date) return 'No recent activity';
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Active now';
        if (diffInHours < 24) return `Active ${diffInHours}h ago`;
        if (diffInHours < 48) return 'Active yesterday';
        return `Active ${date.toLocaleDateString()}`;
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Module Progress Overview</h3>
                <div className="text-sm text-gray-500">
                    {formatLastActivity(summary.recentActivity)}
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Course Progress</span>
                    <span className="font-semibold">{summary.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${summary.overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Modules */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{summary.totalModules}</div>
                    <div className="text-sm text-gray-600">Total Modules</div>
                </div>

                {/* Completed Modules */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="text-2xl font-bold text-green-700">{summary.completedModules}</div>
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                </div>

                {/* In Progress Modules */}
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-yellow-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <div className="text-2xl font-bold text-yellow-700">{summary.inProgressModules}</div>
                    </div>
                    <div className="text-sm text-yellow-600">In Progress</div>
                </div>

                {/* Locked Modules */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <div className="text-2xl font-bold text-gray-700">{summary.lockedModules}</div>
                    </div>
                    <div className="text-sm text-gray-500">Locked</div>
                </div>
            </div>

            {/* Progress Insights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-blue-800">
                            {summary.completedModules === summary.totalModules ? 
                                '🎉 Congratulations! You\'ve completed all modules!' :
                                summary.inProgressModules > 0 ?
                                `Keep going! You have ${summary.inProgressModules} module${summary.inProgressModules !== 1 ? 's' : ''} in progress.` :
                                summary.completedModules > 0 ?
                                'Great progress! Start your next module to continue learning.' :
                                'Ready to begin? Start your first module to begin this course.'
                            }
                        </div>
                        {summary.lockedModules > 0 && (
                            <div className="text-sm text-blue-600 mt-1">
                                Complete prerequisites to unlock {summary.lockedModules} more module{summary.lockedModules !== 1 ? 's' : ''}.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleStatusSummary;