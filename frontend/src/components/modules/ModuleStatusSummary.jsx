import React from 'react';

const ModuleStatusSummary = ({ modules = [], className = '' }) => {
  const getStatusCounts = () => {
    const counts = {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      total: modules.length
    };

    modules.forEach(module => {
      if (module.status === 'completed' || module.progress === 100) {
        counts.completed++;
      } else if (module.status === 'in-progress' || (module.progress > 0 && module.progress < 100)) {
        counts.inProgress++;
      } else {
        counts.notStarted++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const completionRate = statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0;

  return (
    <div className={`module-status-summary bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📊 Module Status Overview
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{Math.round(completionRate)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">⟳</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
              <div className="text-sm text-blue-700">In Progress</div>
            </div>
          </div>
        </div>

        {/* Not Started */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">○</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{statusCounts.notStarted}</div>
              <div className="text-sm text-gray-700">Not Started</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Modules:</span>
          <span className="font-semibold text-gray-800">{statusCounts.total}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Completion Rate:</span>
          <span className="font-semibold text-green-600">{Math.round(completionRate)}%</span>
        </div>
      </div>
    </div>
  );
};

export default ModuleStatusSummary;