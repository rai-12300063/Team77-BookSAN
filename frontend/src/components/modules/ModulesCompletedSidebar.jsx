/**
 * ModulesCompletedSidebar.jsx - Sidebar component showing modules completed across all courses
 * Displays user's module completion progress with quick navigation
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';

const ModulesCompletedSidebar = ({ className = "" }) => {
    const [moduleStats, setModuleStats] = useState({
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        recentlyCompleted: [],
        courseProgress: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchModuleStats();
    }, []);

    const fetchModuleStats = async () => {
        try {
            setLoading(true);
            
            // Get enrolled courses first
            const enrolledResponse = await axios.get('/api/courses/enrolled/my');
            const enrolledCourses = enrolledResponse.data || [];

            if (enrolledCourses.length === 0) {
                setModuleStats({
                    totalModules: 0,
                    completedModules: 0,
                    inProgressModules: 0,
                    recentlyCompleted: [],
                    courseProgress: []
                });
                return;
            }

            // Fetch module progress for each enrolled course
            const courseProgressPromises = enrolledCourses.map(async (enrollment) => {
                const courseId = enrollment.courseId._id;
                const courseTitle = enrollment.courseId.title;
                
                try {
                    const [modulesResponse, progressResponse] = await Promise.all([
                        axios.get(`/api/modules/course/${courseId}`),
                        axios.get(`/api/module-progress/course/${courseId}`)
                    ]);

                    const modules = modulesResponse.data.modules || [];
                    const moduleProgresses = progressResponse.data.moduleProgresses || [];

                    // Create progress map
                    const progressMap = {};
                    moduleProgresses.forEach(progress => {
                        progressMap[progress.moduleId] = progress;
                    });

                    // Calculate stats for this course
                    let completed = 0;
                    let inProgress = 0;
                    const recentlyCompleted = [];

                    modules.forEach(module => {
                        const progress = progressMap[module._id];
                        if (progress) {
                            if (progress.completionStatus === 'completed') {
                                completed++;
                                if (progress.completionDate) {
                                    recentlyCompleted.push({
                                        moduleId: module._id,
                                        moduleTitle: module.title,
                                        courseId: courseId,
                                        courseTitle: courseTitle,
                                        completionDate: progress.completionDate,
                                        completionPercentage: progress.completionPercentage
                                    });
                                }
                            } else if (progress.completionStatus === 'in_progress') {
                                inProgress++;
                            }
                        }
                    });

                    return {
                        courseId,
                        courseTitle,
                        totalModules: modules.length,
                        completedModules: completed,
                        inProgressModules: inProgress,
                        recentlyCompleted,
                        overallProgress: modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0
                    };
                } catch (error) {
                    console.error(`Error fetching data for course ${courseId}:`, error);
                    return {
                        courseId,
                        courseTitle,
                        totalModules: 0,
                        completedModules: 0,
                        inProgressModules: 0,
                        recentlyCompleted: [],
                        overallProgress: 0
                    };
                }
            });

            const courseProgressResults = await Promise.all(courseProgressPromises);

            // Aggregate stats
            const totalModules = courseProgressResults.reduce((sum, course) => sum + course.totalModules, 0);
            const completedModules = courseProgressResults.reduce((sum, course) => sum + course.completedModules, 0);
            const inProgressModules = courseProgressResults.reduce((sum, course) => sum + course.inProgressModules, 0);
            
            // Get all recently completed modules and sort by completion date
            const allRecentlyCompleted = courseProgressResults
                .flatMap(course => course.recentlyCompleted)
                .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
                .slice(0, 5); // Show last 5 completed modules

            setModuleStats({
                totalModules,
                completedModules,
                inProgressModules,
                recentlyCompleted: allRecentlyCompleted,
                courseProgress: courseProgressResults
            });

        } catch (error) {
            console.error('Error fetching module stats:', error);
            setError('Failed to load module statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleModuleClick = (moduleId, courseId) => {
        navigate(`/courses/${courseId}/modules/${moduleId}`);
    };

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}/modules`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))}
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
                    <span className="text-red-800 text-sm">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Module Progress</h2>
                    <button
                        onClick={fetchModuleStats}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">{moduleStats.completedModules}</div>
                        <div className="text-sm text-blue-700">Modules Completed</div>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-900">{moduleStats.inProgressModules}</div>
                        <div className="text-sm text-yellow-700">In Progress</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{moduleStats.totalModules}</div>
                        <div className="text-sm text-gray-700">Total Modules</div>
                    </div>
                </div>

                {/* Overall Progress Bar */}
                {moduleStats.totalModules > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Progress</span>
                            <span>{Math.round((moduleStats.completedModules / moduleStats.totalModules) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${Math.round((moduleStats.completedModules / moduleStats.totalModules) * 100)}%` 
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Recently Completed Modules */}
            {moduleStats.recentlyCompleted.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Recently Completed</h3>
                    <div className="space-y-3">
                        {moduleStats.recentlyCompleted.map((module, index) => (
                            <div
                                key={`${module.moduleId}-${index}`}
                                onClick={() => handleModuleClick(module.moduleId, module.courseId)}
                                className="flex items-start p-3 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                            >
                                <div className="flex-shrink-0 mr-3 mt-1">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {module.moduleTitle}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {module.courseTitle}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {formatDate(module.completionDate)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Course Progress Summary */}
            {moduleStats.courseProgress.length > 0 && (
                <div className="p-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Course Progress</h3>
                    <div className="space-y-3">
                        {moduleStats.courseProgress.map((course) => (
                            <div
                                key={course.courseId}
                                onClick={() => handleCourseClick(course.courseId)}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {course.courseTitle}
                                    </h4>
                                    <span className="text-xs text-gray-500">{course.overallProgress}%</span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                    <div 
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${course.overallProgress}%` }}
                                    />
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>{course.completedModules} completed</span>
                                    <span>{course.totalModules} total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {moduleStats.totalModules === 0 && (
                <div className="p-6 text-center">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-3">No module progress yet</p>
                    <p className="text-xs text-gray-400">Enroll in courses to start learning modules</p>
                </div>
            )}
        </div>
    );
};

export default ModulesCompletedSidebar;