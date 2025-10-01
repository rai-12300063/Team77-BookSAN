/**
 * Database Migration Scripts for Module System Integration
 * Safely migrates existing Course and LearningProgress data to support new Module system
 */

const mongoose = require('mongoose');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const { Logger } = require('../patterns/singleton');

const logger = Logger.getInstance();

/**
 * Migration 001: Convert Course Syllabus to Modules
 * Migrates existing course syllabus items into separate Module documents
 */
async function migration001_CourseSyllabusToModules() {
    try {
        logger.info('Starting Migration 001: Course Syllabus to Modules');
        
        const courses = await Course.find({});
        let migratedCount = 0;
        let totalModulesCreated = 0;
        
        for (const course of courses) {
            if (!course.syllabus || course.syllabus.length === 0) {
                logger.info(`Course ${course._id} has no syllabus items to migrate`);
                continue;
            }
            
            const moduleIds = [];
            
            for (let i = 0; i < course.syllabus.length; i++) {
                const syllabusItem = course.syllabus[i];
                
                // Create module from syllabus item
                const moduleData = {
                    courseId: course._id,
                    title: syllabusItem.title || `Module ${i + 1}`,
                    description: syllabusItem.description || `Module converted from course syllabus: ${syllabusItem.title}`,
                    learningObjectives: syllabusItem.learningObjectives || [`Complete ${syllabusItem.title}`],
                    estimatedDuration: syllabusItem.duration || 60,
                    difficulty: course.difficulty || 'Beginner',
                    order: i + 1,
                    isActive: true,
                    contents: [{
                        contentId: `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'text',
                        title: syllabusItem.title || `Content ${i + 1}`,
                        description: syllabusItem.description || 'Migrated from course syllabus',
                        duration: syllabusItem.duration || 60,
                        order: 1,
                        isRequired: true,
                        contentData: {
                            originalSyllabusItem: syllabusItem,
                            migratedAt: new Date()
                        }
                    }],
                    prerequisites: i > 0 ? [moduleIds[i - 1]] : [],
                    createdAt: course.createdAt || new Date(),
                    migratedFrom: 'course_syllabus'
                };
                
                const module = new Module(moduleData);
                await module.save();
                
                moduleIds.push(module._id);
                totalModulesCreated++;
                
                logger.info(`Created module ${module._id} from syllabus item: ${syllabusItem.title}`);
            }
            
            // Update course with module references
            course.modules = moduleIds;
            await course.save();
            
            migratedCount++;
            logger.info(`Migrated course ${course._id} with ${moduleIds.length} modules`);
        }
        
        logger.info(`Migration 001 completed: ${migratedCount} courses migrated, ${totalModulesCreated} modules created`);
        
        return {
            success: true,
            migratedCourses: migratedCount,
            totalModulesCreated
        };
        
    } catch (error) {
        logger.error('Migration 001 failed:', error);
        throw error;
    }
}

/**
 * Migration 002: Create ModuleProgress from LearningProgress
 * Creates detailed ModuleProgress records based on existing LearningProgress data
 */
async function migration002_LearningProgressToModuleProgress() {
    try {
        logger.info('Starting Migration 002: LearningProgress to ModuleProgress');
        
        const learningProgresses = await LearningProgress.find()
            .populate('courseId')
            .populate('userId');
        
        let migratedCount = 0;
        let totalModuleProgressCreated = 0;
        
        for (const learningProgress of learningProgresses) {
            if (!learningProgress.courseId || !learningProgress.courseId.modules) {
                logger.info(`Learning progress ${learningProgress._id} has no course modules to migrate`);
                continue;
            }
            
            const course = learningProgress.courseId;
            const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
            
            for (let i = 0; i < modules.length; i++) {
                const module = modules[i];
                
                // Determine module completion status based on learning progress
                let completionStatus = 'not_started';
                let completionPercentage = 0;
                
                if (learningProgress.completedModules && learningProgress.completedModules.length > i) {
                    const completedModule = learningProgress.completedModules[i];
                    
                    if (completedModule.completed) {
                        completionStatus = 'completed';
                        completionPercentage = 100;
                    } else if (completedModule.startedAt) {
                        completionStatus = 'in_progress';
                        completionPercentage = Math.min(completedModule.progress || 50, 99);
                    }
                }
                
                // Create module progress
                const moduleProgressData = {
                    userId: learningProgress.userId._id,
                    courseId: course._id,
                    moduleId: module._id,
                    enrolledAt: learningProgress.enrolledAt || new Date(),
                    startedAt: completionStatus !== 'not_started' ? (learningProgress.enrolledAt || new Date()) : null,
                    completedAt: completionStatus === 'completed' ? (learningProgress.lastAccessedAt || new Date()) : null,
                    completionStatus,
                    completionPercentage,
                    totalContentCount: module.contents.length,
                    completedContentCount: completionStatus === 'completed' ? module.contents.length : Math.floor(module.contents.length * (completionPercentage / 100)),
                    totalRequiredContentCount: module.contents.filter(c => c.isRequired).length,
                    completedRequiredContentCount: completionStatus === 'completed' ? module.contents.filter(c => c.isRequired).length : 0,
                    contentProgress: module.contents.map(content => ({
                        contentId: content.contentId,
                        contentType: content.type,
                        status: completionStatus === 'completed' ? 'completed' : (completionStatus === 'in_progress' ? 'in_progress' : 'not_started'),
                        timeSpent: completionStatus === 'completed' ? content.duration : Math.floor(content.duration * (completionPercentage / 100)),
                        firstAccessedAt: completionStatus !== 'not_started' ? (learningProgress.enrolledAt || new Date()) : null,
                        lastAccessedAt: completionStatus !== 'not_started' ? (learningProgress.lastAccessedAt || new Date()) : null,
                        completedAt: completionStatus === 'completed' ? (learningProgress.lastAccessedAt || new Date()) : null
                    })),
                    studyStreak: {
                        current: learningProgress.studyStreak || 0,
                        longest: learningProgress.studyStreak || 0,
                        lastStudyDate: learningProgress.lastAccessedAt
                    },
                    migratedFrom: 'learning_progress'
                };
                
                const moduleProgress = new ModuleProgress(moduleProgressData);
                await moduleProgress.save();
                
                totalModuleProgressCreated++;
                logger.info(`Created module progress for user ${learningProgress.userId._id}, module ${module._id}`);
            }
            
            migratedCount++;
            logger.info(`Migrated learning progress ${learningProgress._id} to ${modules.length} module progress records`);
        }
        
        logger.info(`Migration 002 completed: ${migratedCount} learning progress records migrated, ${totalModuleProgressCreated} module progress records created`);
        
        return {
            success: true,
            migratedLearningProgress: migratedCount,
            totalModuleProgressCreated
        };
        
    } catch (error) {
        logger.error('Migration 002 failed:', error);
        throw error;
    }
}

/**
 * Migration 003: Update Existing LearningProgress with Module References
 * Updates existing LearningProgress documents to reference new Module system
 */
async function migration003_UpdateLearningProgressWithModules() {
    try {
        logger.info('Starting Migration 003: Update LearningProgress with Module References');
        
        const learningProgresses = await LearningProgress.find()
            .populate('courseId');
        
        let updatedCount = 0;
        
        for (const learningProgress of learningProgresses) {
            if (!learningProgress.courseId || !learningProgress.courseId.modules) {
                logger.info(`Learning progress ${learningProgress._id} has no course modules to reference`);
                continue;
            }
            
            const course = learningProgress.courseId;
            const moduleProgresses = await ModuleProgress.find({
                userId: learningProgress.userId,
                courseId: course._id
            });
            
            // Update learning progress with module references
            learningProgress.moduleProgresses = moduleProgresses.map(mp => mp._id);
            
            // Recalculate overall progress based on module progress
            const totalModules = moduleProgresses.length;
            const completedModules = moduleProgresses.filter(mp => mp.completionStatus === 'completed').length;
            const inProgressModules = moduleProgresses.filter(mp => mp.completionStatus === 'in_progress').length;
            
            learningProgress.overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            learningProgress.completedModulesCount = completedModules;
            learningProgress.totalModulesCount = totalModules;
            
            // Update status based on module progress
            if (completedModules === totalModules && totalModules > 0) {
                learningProgress.status = 'completed';
            } else if (completedModules > 0 || inProgressModules > 0) {
                learningProgress.status = 'in_progress';
            } else {
                learningProgress.status = 'enrolled';
            }
            
            await learningProgress.save();
            
            updatedCount++;
            logger.info(`Updated learning progress ${learningProgress._id} with ${moduleProgresses.length} module references`);
        }
        
        logger.info(`Migration 003 completed: ${updatedCount} learning progress records updated`);
        
        return {
            success: true,
            updatedLearningProgress: updatedCount
        };
        
    } catch (error) {
        logger.error('Migration 003 failed:', error);
        throw error;
    }
}

/**
 * Migration 004: Data Validation and Cleanup
 * Validates migrated data and performs cleanup operations
 */
async function migration004_DataValidationAndCleanup() {
    try {
        logger.info('Starting Migration 004: Data Validation and Cleanup');
        
        const validationResults = {
            courses: 0,
            modules: 0,
            moduleProgresses: 0,
            learningProgresses: 0,
            orphanedRecords: [],
            invalidRecords: []
        };
        
        // Validate courses
        const courses = await Course.find({});
        for (const course of courses) {
            if (course.modules && course.modules.length > 0) {
                const moduleCount = await Module.countDocuments({ courseId: course._id });
                if (moduleCount !== course.modules.length) {
                    validationResults.invalidRecords.push({
                        type: 'course',
                        id: course._id,
                        issue: `Module reference count mismatch: ${course.modules.length} referenced, ${moduleCount} exist`
                    });
                }
            }
            validationResults.courses++;
        }
        
        // Validate modules
        const modules = await Module.find({});
        for (const module of modules) {
            const courseExists = await Course.findById(module.courseId);
            if (!courseExists) {
                validationResults.orphanedRecords.push({
                    type: 'module',
                    id: module._id,
                    issue: 'Referenced course does not exist'
                });
            }
            validationResults.modules++;
        }
        
        // Validate module progress
        const moduleProgresses = await ModuleProgress.find({});
        for (const moduleProgress of moduleProgresses) {
            const moduleExists = await Module.findById(moduleProgress.moduleId);
            const courseExists = await Course.findById(moduleProgress.courseId);
            
            if (!moduleExists) {
                validationResults.orphanedRecords.push({
                    type: 'moduleProgress',
                    id: moduleProgress._id,
                    issue: 'Referenced module does not exist'
                });
            }
            
            if (!courseExists) {
                validationResults.orphanedRecords.push({
                    type: 'moduleProgress',
                    id: moduleProgress._id,
                    issue: 'Referenced course does not exist'
                });
            }
            
            validationResults.moduleProgresses++;
        }
        
        // Validate learning progress
        const learningProgresses = await LearningProgress.find({});
        for (const learningProgress of learningProgresses) {
            if (learningProgress.moduleProgresses && learningProgress.moduleProgresses.length > 0) {
                const moduleProgressCount = await ModuleProgress.countDocuments({
                    userId: learningProgress.userId,
                    courseId: learningProgress.courseId
                });
                
                if (moduleProgressCount !== learningProgress.moduleProgresses.length) {
                    validationResults.invalidRecords.push({
                        type: 'learningProgress',
                        id: learningProgress._id,
                        issue: `Module progress reference count mismatch: ${learningProgress.moduleProgresses.length} referenced, ${moduleProgressCount} exist`
                    });
                }
            }
            validationResults.learningProgresses++;
        }
        
        logger.info(`Validation completed:`, validationResults);
        
        // Clean up orphaned records if requested
        if (process.env.MIGRATION_CLEANUP === 'true') {
            logger.info('Cleaning up orphaned records...');
            
            for (const orphan of validationResults.orphanedRecords) {
                if (orphan.type === 'module') {
                    await Module.findByIdAndDelete(orphan.id);
                    logger.info(`Deleted orphaned module: ${orphan.id}`);
                } else if (orphan.type === 'moduleProgress') {
                    await ModuleProgress.findByIdAndDelete(orphan.id);
                    logger.info(`Deleted orphaned module progress: ${orphan.id}`);
                }
            }
        }
        
        logger.info(`Migration 004 completed: Validated ${validationResults.courses} courses, ${validationResults.modules} modules, ${validationResults.moduleProgresses} module progress records`);
        
        return {
            success: true,
            validationResults
        };
        
    } catch (error) {
        logger.error('Migration 004 failed:', error);
        throw error;
    }
}

/**
 * Rollback Migration 001: Remove Modules and restore Course syllabus
 */
async function rollback001_RemoveModulesRestoreSyllabus() {
    try {
        logger.info('Starting Rollback 001: Remove Modules and restore Course syllabus');
        
        const modules = await Module.find({ migratedFrom: 'course_syllabus' });
        let rollbackCount = 0;
        
        for (const module of modules) {
            // Remove module progress records
            await ModuleProgress.deleteMany({ moduleId: module._id });
            
            // Remove module from course references
            await Course.updateOne(
                { _id: module.courseId },
                { $pull: { modules: module._id } }
            );
            
            // Delete module
            await Module.findByIdAndDelete(module._id);
            
            rollbackCount++;
            logger.info(`Rolled back module ${module._id} from course ${module.courseId}`);
        }
        
        logger.info(`Rollback 001 completed: ${rollbackCount} modules removed`);
        
        return {
            success: true,
            rolledBackModules: rollbackCount
        };
        
    } catch (error) {
        logger.error('Rollback 001 failed:', error);
        throw error;
    }
}

/**
 * Main migration runner
 */
async function runMigrations(options = {}) {
    try {
        logger.info('Starting Module System Database Migration');
        
        const results = {};
        
        if (options.migrations.includes('001')) {
            results.migration001 = await migration001_CourseSyllabusToModules();
        }
        
        if (options.migrations.includes('002')) {
            results.migration002 = await migration002_LearningProgressToModuleProgress();
        }
        
        if (options.migrations.includes('003')) {
            results.migration003 = await migration003_UpdateLearningProgressWithModules();
        }
        
        if (options.migrations.includes('004')) {
            results.migration004 = await migration004_DataValidationAndCleanup();
        }
        
        logger.info('All migrations completed successfully');
        
        return {
            success: true,
            results
        };
        
    } catch (error) {
        logger.error('Migration failed:', error);
        throw error;
    }
}

/**
 * Main rollback runner
 */
async function runRollbacks(options = {}) {
    try {
        logger.info('Starting Module System Database Rollback');
        
        const results = {};
        
        if (options.rollbacks.includes('001')) {
            results.rollback001 = await rollback001_RemoveModulesRestoreSyllabus();
        }
        
        logger.info('All rollbacks completed successfully');
        
        return {
            success: true,
            results
        };
        
    } catch (error) {
        logger.error('Rollback failed:', error);
        throw error;
    }
}

module.exports = {
    runMigrations,
    runRollbacks,
    migration001_CourseSyllabusToModules,
    migration002_LearningProgressToModuleProgress,
    migration003_UpdateLearningProgressWithModules,
    migration004_DataValidationAndCleanup,
    rollback001_RemoveModulesRestoreSyllabus
};