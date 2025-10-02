/**
 * ModuleList.jsx - List view for course modules
 * Displays all modules in a course with filtering and sorting capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import SimpleModuleCard from './SimpleModuleCard';
import axios from '../../axiosConfig';

const ModuleList = ({ courseId, onModuleSelect, className = "" }) => {
    const [modules, setModules] = useState([]);
    const [moduleProgresses, setModuleProgresses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // all, not_started, in_progress, completed
    const [sortBy, setSortBy] = useState('order'); // order, title, progress, difficulty
    const [searchTerm, setSearchTerm] = useState('');

    const fetchModules = useCallback(async () => {
        try {
            console.log('Fetching modules for course:', courseId);
            const response = await axios.get(`/api/modules/course/${courseId}`);
            console.log('Modules response:', response.data);
            
            // Ensure we have valid module data
            const moduleData = response.data.modules || [];
            const validModules = moduleData.filter(module => module && module._id);
            
            setModules(validModules);
            console.log('Set modules:', validModules.length, 'valid modules');
        } catch (error) {
            console.error('Error fetching modules:', error);
            setError(`Failed to load modules: ${error.response?.data?.message || error.message}`);
        }
    }, [courseId]);

    const fetchModuleProgresses = useCallback(async () => {
        try {
            const response = await axios.get(`/api/module-progress/course/${courseId}`);
            const progressMap = {};
            
            if (response.data.moduleProgresses) {
                response.data.moduleProgresses.forEach(progress => {
                    progressMap[progress.moduleId] = progress;
                });
            }
            
            setModuleProgresses(progressMap);
        } catch (error) {
            console.error('Error fetching module progress:', error);
            // Continue without progress data
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchModules();
        fetchModuleProgresses();
    }, [fetchModules, fetchModuleProgresses]);

    const isModuleLocked = (module) => {
        // Safety check for module object
        if (!module) return true;
        
        // Check if the module has access restrictions from the backend
        if (module.canAccess === false) return true;
        
        // Check prerequisites - handle both array and object structures
        let prerequisites = [];
        if (module.prerequisites) {
            if (Array.isArray(module.prerequisites)) {
                prerequisites = module.prerequisites;
            } else if (module.prerequisites.modules && Array.isArray(module.prerequisites.modules)) {
                prerequisites = module.prerequisites.modules;
            }
        }
        
        if (prerequisites.length === 0) {
            return false;
        }

        // Check if all prerequisites are completed
        return prerequisites.some(prereqId => {
            const prereqProgress = moduleProgresses[prereqId];
            return !prereqProgress || prereqProgress.completionStatus !== 'completed';
        });
    };

    const handleStartModule = async (moduleId) => {
        try {
            // Clear any existing messages
            setError(null);
            setSuccessMessage(null);
            
            // Find the module to validate prerequisites
            const module = modules.find(m => m._id === moduleId);
            if (!module) {
                throw new Error('Module not found');
            }
            
            // Check if module is locked due to prerequisites
            if (isModuleLocked(module)) {
                throw new Error('This module is locked. Please complete the prerequisite modules first.');
            }
            
            console.log('Starting module:', moduleId);
            
            // Start the module
            const response = await axios.post(`/api/module-progress/${moduleId}/start`);
            console.log('Module start response:', response.data);
            
            // Refresh module progress data
            await fetchModuleProgresses();
            
            // Navigate to the module if callback provided
            if (onModuleSelect) {
                onModuleSelect(moduleId);
            }
            
            // Show success message
            const moduleTitle = module.title || 'Module';
            if (response.data.alreadyStarted) {
                setSuccessMessage(`${moduleTitle} was already started. Continuing where you left off.`);
            } else {
                setSuccessMessage(`${moduleTitle} started successfully! You can now begin learning.`);
            }
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
            
        } catch (error) {
            console.error('Error starting module:', error);
            
            // Handle different types of errors
            let errorMessage = 'Failed to start module';
            
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 404) {
                    errorMessage = 'Module not found';
                } else if (status === 403) {
                    errorMessage = 'You do not have permission to access this module';
                } else if (status === 400) {
                    errorMessage = data.message || 'Invalid request';
                } else if (status === 401) {
                    errorMessage = 'Please log in to start modules';
                } else {
                    errorMessage = data.message || `Server error (${status})`;
                }
            } else if (error.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message) {
                // Custom error message
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
    };

    const handleContinueModule = async (moduleId) => {
        try {
            if (onModuleSelect) {
                onModuleSelect(moduleId);
            }
        } catch (error) {
            console.error('Error continuing module:', error);
        }
    };

    const getFilteredAndSortedModules = () => {
        let filteredModules = modules.filter(module => {
            // Search filter
            if (searchTerm && !module.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !module.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Status filter
            if (filter !== 'all') {
                const progress = moduleProgresses[module._id];
                const status = progress?.completionStatus || 'not_started';
                
                if (filter !== status) {
                    return false;
                }
            }

            return true;
        });

        // Sort modules
        filteredModules.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                    
                case 'progress':
                    const progressA = moduleProgresses[a._id]?.completionPercentage || 0;
                    const progressB = moduleProgresses[b._id]?.completionPercentage || 0;
                    return progressB - progressA;
                    
                case 'difficulty':
                    const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
                    return (difficultyOrder[a.difficulty] || 1) - (difficultyOrder[b.difficulty] || 1);
                    
                case 'order':
                default:
                    return a.order - b.order;
            }
        });

        return filteredModules;
    };

    const getFilterCounts = () => {
        const counts = {
            all: modules.length,
            not_started: 0,
            in_progress: 0,
            completed: 0
        };

        modules.forEach(module => {
            const progress = moduleProgresses[module._id];
            const status = progress?.completionStatus || 'not_started';
            counts[status]++;
        });

        return counts;
    };

    const getOverallProgress = () => {
        if (modules.length === 0) return 0;
        
        const totalProgress = modules.reduce((sum, module) => {
            const progress = moduleProgresses[module._id];
            return sum + (progress?.completionPercentage || 0);
        }, 0);
        
        return Math.round(totalProgress / modules.length);
    };

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading modules...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${className}`}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-red-800">Error loading modules</h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchModules();
                            fetchModuleProgresses();
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (modules.length === 0) {
        return (
            <div className={`${className}`}>
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
                    <p className="mt-1 text-sm text-gray-500">This course doesn't have any modules yet.</p>
                </div>
            </div>
        );
    }

    const filteredModules = getFilteredAndSortedModules();
    const filterCounts = getFilterCounts();
    const overallProgress = getOverallProgress();

    return (
        <div className={`${className}`}>
            {/* Header with Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
                        <p className="text-sm text-gray-600 mt-1">{modules.length} modules • {overallProgress}% complete</p>
                    </div>
                    
                    {/* Overall Progress Bar */}
                    <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-xs text-gray-600 mt-1">{overallProgress}%</div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-green-800 font-medium">{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="ml-auto text-green-400 hover:text-green-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Status Filters */}
                    <div className="flex space-x-2">
                        {[
                            { key: 'all', label: 'All', count: filterCounts.all },
                            { key: 'not_started', label: 'Not Started', count: filterCounts.not_started },
                            { key: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
                            { key: 'completed', label: 'Completed', count: filterCounts.completed }
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {label} ({count})
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="order">Order</option>
                            <option value="title">Title</option>
                            <option value="progress">Progress</option>
                            <option value="difficulty">Difficulty</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Module List */}
            {filteredModules.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No modules match your current filters.</p>
                    <button
                        onClick={() => {
                            setFilter('all');
                            setSearchTerm('');
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredModules.map((module, index) => (
                        <SimpleModuleCard
                            key={module._id}
                            module={module}
                            moduleProgress={moduleProgresses[module._id]}
                            onStartModule={handleStartModule}
                            onContinueModule={handleContinueModule}
                            isLocked={isModuleLocked(module)}
                            className="transition-all duration-200 hover:shadow-lg"
                        />
                    ))}
                </div>
            )}

            {/* Footer Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{filterCounts.completed}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">{filterCounts.in_progress}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-600">{filterCounts.not_started}</div>
                        <div className="text-sm text-gray-600">Not Started</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">{overallProgress}%</div>
                        <div className="text-sm text-gray-600">Overall Progress</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleList;