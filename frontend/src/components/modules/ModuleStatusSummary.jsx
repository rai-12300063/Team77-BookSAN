import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosConfig';

const ModuleStatusSummary = ({ courseId, modules = [], className = '', onRefresh }) => {
  const [moduleProgresses, setModuleProgresses] = useState([]);
  const [courseModules, setCourseModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Define fetchModuleProgress with useCallback to make it stable for useImperativeHandle
  const fetchModuleProgress = useCallback(async () => {
    if (!courseId) {
      // If modules are provided directly, use them
      setCourseModules(Array.isArray(modules) ? modules : []);
      setModuleProgresses([]); // Reset progress when using direct modules
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 ModuleStatusSummary: Fetching module progress for course:', courseId);
      
      // Fetch both modules and progress in parallel
      const [modulesRes, progressRes] = await Promise.all([
        axiosInstance.get(`/api/modules/course/${courseId}`).catch(err => {
          console.warn('⚠️ Failed to fetch modules:', err.response?.status);
          return { data: [] };
        }),
        axiosInstance.get(`/api/module-progress/course/${courseId}`).catch(err => {
          console.warn('⚠️ Failed to fetch module progress:', err.response?.status);
          return { data: { moduleProgresses: [] } };
        })
      ]);

      const fetchedModules = modulesRes.data || [];
      const fetchedProgress = progressRes.data?.moduleProgresses || [];
      
      console.log('📋 ModuleStatusSummary: Fetched modules:', fetchedModules.length);
      console.log('📊 ModuleStatusSummary: Fetched progress records:', fetchedProgress.length);

      setCourseModules(fetchedModules);
      setModuleProgresses(fetchedProgress);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('❌ ModuleStatusSummary: Error fetching data:', error);
      setCourseModules([]);
      setModuleProgresses([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, modules]);

  // Expose refresh function to parent component
  React.useImperativeHandle(onRefresh, () => ({
    refresh: fetchModuleProgress
  }), [fetchModuleProgress]);

  // Fetch module progress data if courseId is provided
  useEffect(() => {
    fetchModuleProgress();
    
    // Set up interval to refresh data every 30 seconds when courseId is provided
    let intervalId;
    if (courseId) {
      intervalId = setInterval(() => {
        console.log('🔄 ModuleStatusSummary: Auto-refreshing progress data...');
        fetchModuleProgress();
      }, 30000); // Refresh every 30 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchModuleProgress, lastRefresh, courseId]);

  const getStatusCounts = () => {
    // Ensure courseModules and moduleProgresses are arrays
    const safeModules = Array.isArray(courseModules) ? courseModules : [];
    const safeProgresses = Array.isArray(moduleProgresses) ? moduleProgresses : [];
    
    const counts = {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      total: safeModules.length
    };

    if (safeModules.length === 0) {
      return counts;
    }

    // Create a map of module progress by moduleId for quick lookup
    const progressMap = {};
    safeProgresses.forEach(progress => {
      if (progress && progress.moduleId) {
        const moduleId = typeof progress.moduleId === 'object' ? progress.moduleId._id : progress.moduleId;
        progressMap[moduleId] = progress;
      }
    });

    safeModules.forEach(module => {
      const moduleId = module._id;
      const progress = progressMap[moduleId];
      
      if (progress) {
        if (progress.status === 'completed' || progress.completionPercentage === 100) {
          counts.completed++;
        } else if (progress.status === 'in-progress' || progress.completionPercentage > 0) {
          counts.inProgress++;
        } else {
          counts.notStarted++;
        }
      } else {
        counts.notStarted++;
      }
    });

    return counts;
  };

  if (loading) {
    return (
      <div className={`module-status-summary bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-300 rounded w-full mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();
  const completionRate = statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0;

  const handleManualRefresh = () => {
    if (courseId) {
      console.log('🔄 Manual refresh triggered by user');
      setLoading(true);
      // Re-trigger the effect by updating lastRefresh
      setLastRefresh(new Date());
    }
  };

  return (
    <div className={`module-status-summary bg-white p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Module Status Overview
        </h3>
        {courseId && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
              title="Refresh progress data"
            >
              {loading ? '↻' : '🔄'}
            </button>
          </div>
        )}
      </div>
      
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