import React from 'react';

const ModuleCompletionStatus = ({ progress, totalModules, className = '' }) => {
  const completionPercentage = totalModules > 0 ? (progress / totalModules) * 100 : 0;
  
  const getStatusColor = () => {
    if (completionPercentage >= 100) return 'bg-green-500';
    if (completionPercentage >= 70) return 'bg-blue-500';
    if (completionPercentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusText = () => {
    if (completionPercentage >= 100) return 'Completed';
    if (completionPercentage >= 70) return 'Nearly Complete';
    if (completionPercentage >= 40) return 'In Progress';
    return 'Just Started';
  };

  return (
    <div className={`module-completion-status ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {progress}/{totalModules} modules
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(completionPercentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${getStatusColor()} transition-all duration-300`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></span>
        <span className="text-sm text-gray-600">{getStatusText()}</span>
      </div>
    </div>
  );
};

export default ModuleCompletionStatus;