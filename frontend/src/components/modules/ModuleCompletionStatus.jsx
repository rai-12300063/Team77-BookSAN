/**
 * ModuleCompletionStatus.jsx - Enhanced module completion status display component
 * Provides comprehensive visual feedback for module completion states
 */

import React from 'react';

const ModuleCompletionStatus = ({ 
    moduleProgress, 
    isLocked = false, 
    showDetails = true,
    size = 'medium', // small, medium, large
    className = ""
}) => {
    // Determine completion status
    const completionStatus = moduleProgress?.completionStatus || 'not_started';
    const completionPercentage = moduleProgress?.completionPercentage || 0;
    const lastActivityDate = moduleProgress?.lastActivityDate;
    const timeSpent = moduleProgress?.timeSpent || 0;

    // Size configurations
    const sizeConfig = {
        small: {
            icon: 'w-4 h-4',
            text: 'text-xs',
            badge: 'px-2 py-1 text-xs',
            progress: 'h-1'
        },
        medium: {
            icon: 'w-5 h-5',
            text: 'text-sm',
            badge: 'px-3 py-1 text-sm',
            progress: 'h-2'
        },
        large: {
            icon: 'w-6 h-6',
            text: 'text-base',
            badge: 'px-4 py-2 text-base',
            progress: 'h-3'
        }
    };

    const config = sizeConfig[size];

    // Status configurations
    const statusConfig = {
        not_started: {
            color: 'text-gray-500',
            bgColor: 'bg-gray-100',
            borderColor: 'border-gray-200',
            label: 'Not Started',
            icon: (
                <svg className={`${config.icon} text-gray-500`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
            )
        },
        in_progress: {
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-200',
            label: 'In Progress',
            icon: (
                <svg className={`${config.icon} text-yellow-600`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            )
        },
        completed: {
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            label: 'Completed',
            icon: (
                <svg className={`${config.icon} text-green-600`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        },
        locked: {
            color: 'text-gray-400',
            bgColor: 'bg-gray-100',
            borderColor: 'border-gray-200',
            label: 'Locked',
            icon: (
                <svg className={`${config.icon} text-gray-400`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            )
        }
    };

    const currentStatus = isLocked ? statusConfig.locked : statusConfig[completionStatus];

    // Format time spent
    const formatTimeSpent = (minutes) => {
        if (!minutes || minutes < 1) return 'No time logged';
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    // Format last activity date
    const formatLastActivity = (date) => {
        if (!date) return 'Never';
        const activityDate = new Date(date);
        const now = new Date();
        const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return activityDate.toLocaleDateString();
    };

    return (
        <div className={`${className}`}>
            {/* Main Status Display */}
            <div className="flex items-center space-x-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                    {currentStatus.icon}
                </div>

                {/* Status Badge */}
                <span className={`
                    ${config.badge} font-medium rounded-full
                    ${currentStatus.color} ${currentStatus.bgColor}
                `}>
                    {currentStatus.label}
                </span>

                {/* Progress Percentage */}
                {!isLocked && completionStatus !== 'not_started' && (
                    <span className={`${config.text} font-semibold ${currentStatus.color}`}>
                        {completionPercentage}%
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            {!isLocked && showDetails && (
                <div className="mt-2">
                    <div className={`w-full bg-gray-200 rounded-full ${config.progress}`}>
                        <div 
                            className={`${config.progress} rounded-full transition-all duration-500 ${
                                completionStatus === 'completed' ? 'bg-green-500' :
                                completionStatus === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Detailed Information */}
            {!isLocked && showDetails && moduleProgress && size !== 'small' && (
                <div className={`mt-3 grid grid-cols-2 gap-4 ${config.text} text-gray-600`}>
                    <div>
                        <div className="font-medium text-gray-700">Time Spent</div>
                        <div>{formatTimeSpent(timeSpent)}</div>
                    </div>
                    <div>
                        <div className="font-medium text-gray-700">Last Activity</div>
                        <div>{formatLastActivity(lastActivityDate)}</div>
                    </div>
                </div>
            )}

            {/* Achievement Indicators */}
            {!isLocked && completionStatus === 'completed' && showDetails && moduleProgress?.achievements && (
                <div className="mt-3">
                    <div className={`${config.text} font-medium text-gray-700 mb-2`}>Achievements</div>
                    <div className="flex flex-wrap gap-2">
                        {moduleProgress.achievements.map((achievement, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full"
                            >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {achievement}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Message */}
            {isLocked && showDetails && (
                <div className={`mt-2 ${config.text} text-gray-500`}>
                    Complete prerequisite modules to unlock
                </div>
            )}
        </div>
    );
};

export default ModuleCompletionStatus;