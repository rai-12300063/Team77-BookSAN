/**
 * SimpleModuleCard.jsx - Simplified module display component with enhanced error handling
 */

import React from 'react';
import ModuleCompletionStatus from './ModuleCompletionStatus';

const SimpleModuleCard = ({ 
    module, 
    moduleProgress, 
    onStartModule, 
    onContinueModule,
    isLocked = false,
    className = ""
}) => {
    // Null checks for safety
    if (!module) {
        return (
            <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
                <p className="text-gray-500">Module data not available</p>
            </div>
        );
    }

    const getStatusIcon = () => {
        if (isLocked) {
            return (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            );
        }
        
        if (!moduleProgress || moduleProgress.completionStatus === 'not_started') {
            return (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
            );
        }
        
        if (moduleProgress.completionStatus === 'in_progress') {
            return (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            );
        }
        
        if (moduleProgress.completionStatus === 'completed') {
            return (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    const getActionButton = () => {
        if (isLocked) {
            return (
                <button 
                    disabled 
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                    Locked
                </button>
            );
        }
        
        if (!moduleProgress || moduleProgress.completionStatus === 'not_started') {
            return (
                <button 
                    onClick={() => onStartModule && onStartModule(module._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!onStartModule}
                >
                    Start Module
                </button>
            );
        }
        
        if (moduleProgress.completionStatus === 'in_progress') {
            return (
                <button 
                    onClick={() => onContinueModule && onContinueModule(module._id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                    Continue
                </button>
            );
        }
        
        if (moduleProgress.completionStatus === 'completed') {
            return (
                <button 
                    onClick={() => onContinueModule && onContinueModule(module._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Review
                </button>
            );
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes || isNaN(minutes)) return 'N/A';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'text-green-600 bg-green-100';
            case 'intermediate': return 'text-yellow-600 bg-yellow-100';
            case 'advanced': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // Safe access to module properties with defaults
    const moduleTitle = module.title || 'Untitled Module';
    const moduleDescription = module.description || 'No description available';
    const moduleNumber = module.moduleNumber ?? 'N/A';
    const estimatedDuration = module.estimatedDuration || 0;
    const difficulty = module.difficulty || 'Beginner';
    const contents = module.contents || [];
    const learningObjectives = module.learningObjectives || [];

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">Module {moduleNumber}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
                                {difficulty}
                            </span>
                        </div>
                        <ModuleCompletionStatus 
                            moduleProgress={moduleProgress}
                            isLocked={isLocked}
                            showDetails={false}
                            size="small"
                        />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {moduleTitle}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                        {moduleDescription}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(estimatedDuration)}
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {contents.length} Content{contents.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Enhanced Progress Display */}
                    {!isLocked && (moduleProgress || (!moduleProgress && !isLocked)) && (
                        <div className="mb-4">
                            <ModuleCompletionStatus 
                                moduleProgress={moduleProgress}
                                isLocked={isLocked}
                                showDetails={true}
                                size="medium"
                            />
                        </div>
                    )}

                    {/* Learning Objectives Preview */}
                    {learningObjectives.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {learningObjectives.slice(0, 2).map((objective, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-blue-500 mr-2">•</span>
                                        {objective}
                                    </li>
                                ))}
                                {learningObjectives.length > 2 && (
                                    <li className="text-gray-400 text-xs">
                                        +{learningObjectives.length - 2} more objectives
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="ml-4">
                    {getActionButton()}
                </div>
            </div>
        </div>
    );
};

export default SimpleModuleCard;