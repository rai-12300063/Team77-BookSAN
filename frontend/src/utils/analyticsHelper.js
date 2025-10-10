/**
 * Analytics Update Utility
 * Centralized functions for updating learning analytics when activities are completed
 */

import React from 'react';
import axiosInstance from '../axiosConfig';

/**
 * Trigger analytics refresh after learning activity
 * Call this function whenever a user completes modules, quizzes, or other learning activities
 */
export const triggerAnalyticsUpdate = async () => {
  try {
    // Force refresh of analytics data by making background requests
    await Promise.all([
      axiosInstance.get('/api/progress/analytics'),
      axiosInstance.get('/api/progress/streaks'),
      axiosInstance.get('/api/progress/learning-goals')
    ]);
    
    // Dispatch custom event to notify dashboard and other components to refresh
    window.dispatchEvent(new CustomEvent('analyticsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Failed to update analytics:', error);
    return false;
  }
};

/**
 * Update progress after module completion
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID  
 * @param {number} timeSpent - Time spent in minutes
 * @param {number} score - Module score (optional)
 */
export const updateModuleProgress = async (courseId, moduleId, timeSpent = 0, score = null) => {
  try {
    // Update module completion
    await axiosInstance.put('/api/progress/module', {
      courseId,
      moduleId,
      timeSpent
    });

    // Update student progress
    await axiosInstance.put(`/api/students/progress/${courseId}`, {
      timeSpent,
      notes: `Module ${moduleId} completed`
    });

    // Trigger analytics refresh
    await triggerAnalyticsUpdate();
    
    return true;
  } catch (error) {
    console.error('Failed to update module progress:', error);
    return false;
  }
};

/**
 * Update progress after quiz completion
 * @param {string} quizId - Quiz ID
 * @param {number} timeSpent - Time spent in minutes
 * @param {number} score - Quiz score
 */
export const updateQuizProgress = async (quizId, timeSpent = 10, score = 0) => {
  try {
    // Quiz completion is handled by quiz submission, but we can trigger analytics refresh
    await triggerAnalyticsUpdate();
    
    return true;
  } catch (error) {
    console.error('Failed to update quiz progress:', error);
    return false;
  }
};

/**
 * Listen for analytics updates and refresh dashboard data
 * Use in dashboard components to auto-refresh when activities are completed
 */
export const useAnalyticsListener = (refreshCallback) => {
  React.useEffect(() => {
    const handleAnalyticsUpdate = () => {
      if (refreshCallback) {
        refreshCallback();
      }
    };

    window.addEventListener('analyticsUpdated', handleAnalyticsUpdate);
    
    return () => {
      window.removeEventListener('analyticsUpdated', handleAnalyticsUpdate);
    };
  }, [refreshCallback]);
};