// progressSyncService.js
const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');

class ProgressSyncService {
  /**
   * Synchronizes progress data between old and new systems
   * @param {string} userId - The user ID to sync progress for
   * @returns {Object} - Sync results
   */
  static async syncUserProgress(userId) {
    try {
      // Get all user's progress records
      const progressRecords = await LearningProgress.find({ userId });
      
      let updateCount = 0;
      
      // Update each progress record
      for (const record of progressRecords) {
        const updated = await this.updateProgressRecord(record);
        if (updated) updateCount++;
      }
      
      return {
        success: true,
        message: `Successfully synchronized ${updateCount} progress records`,
        updatedRecords: updateCount
      };
    } catch (error) {
      console.error('Progress sync error:', error);
      return {
        success: false,
        message: 'Failed to synchronize progress data',
        error: error.message
      };
    }
  }
  
  /**
   * Updates an individual progress record with latest data
   * @param {Object} record - The progress record to update
   * @returns {boolean} - Whether the record was updated
   */
  static async updateProgressRecord(record) {
    try {
      // Get the associated course
      const course = await Course.findById(record.courseId);
      if (!course) return false;
      
      // Calculate completion percentage based on modules completed
      if (record.modulesCompleted && record.modulesCompleted.length > 0) {
        const totalModules = course.modules ? course.modules.length : 0;
        if (totalModules > 0) {
          // Count unique completed modules
          const uniqueCompletedModules = new Set();
          record.modulesCompleted.forEach(module => {
            if (module.moduleId) {
              uniqueCompletedModules.add(module.moduleId.toString());
            } else if (module.moduleIndex !== undefined) {
              uniqueCompletedModules.add(`index-${module.moduleIndex}`);
            }
          });
          
          const completionPercentage = Math.round((uniqueCompletedModules.size / totalModules) * 100);
          
          // Update the record if completion percentage has changed
          if (record.completionPercentage !== completionPercentage) {
            record.completionPercentage = completionPercentage;
            await record.save();
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error updating progress record:', error);
      return false;
    }
  }
}

module.exports = ProgressSyncService;