/**
 * CompactModuleList.jsx - Compact module display for dashboards and quick views
 * Shows a condensed list of modules with completion status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCompletionStatus from './ModuleCompletionStatus';
import axios from '../../axiosConfig';

const CompactModuleList = ({ 
    courseId, 
    courseTitle = "Course",
    maxItems = 5,
    showCourseTitle = true,
    className = "" 
}) => {
    const [modules, setModules] = useState([]);
    const [moduleProgresses, setModuleProgresses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchModulesData();
    }, [courseId]);

    const fetchModulesData = async () => {
        try {
            setLoading(true);
            const [modulesResponse, progressResponse] = await Promise.all([
                axios.get(`/api/modules/course/${courseId}`),
                axios.get(`/api/module-progress/course/${courseId}`).catch(() => ({ data: { moduleProgresses: [] } }))
            ]);

            const modulesList = modulesResponse.data.modules || [];
            const progresses = progressResponse.data.moduleProgresses || [];

            // Create progress map
            const progressMap = {};
            progresses.forEach(progress => {
                progressMap[progress.moduleId] = progress;
            });

            setModules(modulesList.slice(0, maxItems));
            setModuleProgresses(progressMap);
        } catch (error) {
            console.error('Error fetching modules data:', error);
            setError('Failed to load modules');
        } finally {
            setLoading(false);
        }
    };

    const handleModuleClick = (moduleId) => {
        navigate(`/courses/${courseId}/modules/${moduleId}`);
    };

    const handleViewAllModules = () => {
        navigate(`/courses/${courseId}/modules`);
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 text-sm">{error}</span>
                </div>
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="text-center py-4">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-sm text-gray-500">No modules available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {showCourseTitle && (
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {courseTitle}
                        </h3>
                    )}
                    <button
                        onClick={handleViewAllModules}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View All
                    </button>
                </div>
            </div>

            {/* Module List */}
            <div className="p-4 space-y-3">
                {modules.map((module, index) => {
                    const moduleProgress = moduleProgresses[module._id];
                    
                    return (
                        <div
                            key={module._id || index}
                            onClick={() => handleModuleClick(module._id)}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            {/* Module Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                    {module.moduleNumber || index + 1}
                                </span>
                            </div>

                            {/* Module Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {module.title || `Module ${index + 1}`}
                                    </h4>
                                    <ModuleCompletionStatus 
                                        moduleProgress={moduleProgress}
                                        showDetails={false}
                                        size="small"
                                    />
                                </div>
                                
                                {/* Progress Bar */}
                                {moduleProgress && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div 
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                moduleProgress.completionStatus === 'completed' ? 'bg-green-500' :
                                                moduleProgress.completionStatus === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                                            }`}
                                            style={{ width: `${moduleProgress.completionPercentage || 0}%` }}
                                        />
                                    </div>
                                )}
                                
                                {/* Module Meta */}
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span>{module.difficulty || 'Beginner'}</span>
                                    {module.estimatedDuration && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span>
                                                {module.estimatedDuration < 60 ? 
                                                    `${module.estimatedDuration}m` : 
                                                    `${Math.round(module.estimatedDuration / 60)}h`
                                                }
                                            </span>
                                        </>
                                    )}
                                    {moduleProgress?.completionStatus === 'completed' && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span className="text-green-600 font-medium">Completed</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Indicator */}
                            <div className="flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {modules.length >= maxItems && (
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleViewAllModules}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                    >
                        View All Modules →
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompactModuleList;