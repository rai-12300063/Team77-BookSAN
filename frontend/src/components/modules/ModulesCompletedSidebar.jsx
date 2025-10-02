import React from 'react';

const ModulesCompletedSidebar = ({ completedModules = [], className = '' }) => {
  return (
    <div className={`modules-completed-sidebar bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📚 Completed Modules
      </h3>
      
      {completedModules.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">📖</div>
          <p className="text-gray-500 text-sm">
            No modules completed yet
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Start learning to see your progress here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedModules.slice(0, 5).map((module, index) => (
            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">{module.title}</h4>
                <p className="text-xs text-gray-500">{module.courseName}</p>
              </div>
              <div className="text-xs text-green-600 font-medium">
                {module.completionDate && new Date(module.completionDate).toLocaleDateString()}
              </div>
            </div>
          ))}
          
          {completedModules.length > 5 && (
            <div className="text-center pt-2">
              <button className="text-blue-600 text-sm hover:underline">
                View all {completedModules.length} completed modules
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Completed:</span>
          <span className="font-semibold text-green-600">{completedModules.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ModulesCompletedSidebar;