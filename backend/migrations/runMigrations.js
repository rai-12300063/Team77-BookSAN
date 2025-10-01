#!/usr/bin/env node

/**
 * Migration Runner Script for Module System
 * Command-line tool to run database migrations safely
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
    runMigrations,
    runRollbacks,
    migration001_CourseSyllabusToModules,
    migration002_LearningProgressToModuleProgress,
    migration003_UpdateLearningProgressWithModules,
    migration004_DataValidationAndCleanup,
    rollback001_RemoveModulesRestoreSyllabus
} = require('./moduleSystemMigration');

const { Logger } = require('../patterns/singleton');

const logger = Logger.getInstance();

/**
 * Display help information
 */
function displayHelp() {
    console.log(`
🔄 Module System Migration Runner

Usage: node runMigrations.js [command] [options]

Commands:
  migrate [migrations...]    Run specified migrations (default: all)
  rollback [rollbacks...]    Run specified rollbacks
  validate                   Validate existing data integrity
  status                     Show migration status
  help                       Show this help message

Migration IDs:
  001    Convert Course Syllabus to Modules
  002    Create ModuleProgress from LearningProgress  
  003    Update LearningProgress with Module References
  004    Data Validation and Cleanup

Rollback IDs:
  001    Remove Modules and restore Course syllabus

Options:
  --dry-run                 Show what would be done without making changes
  --force                   Skip confirmation prompts
  --cleanup                 Clean up orphaned records during validation
  --backup                  Create database backup before migration
  --verbose                 Show detailed logging

Examples:
  node runMigrations.js migrate                    # Run all migrations
  node runMigrations.js migrate 001 002           # Run specific migrations
  node runMigrations.js rollback 001 --force      # Rollback migration 001
  node runMigrations.js validate --cleanup        # Validate and cleanup
  node runMigrations.js migrate --dry-run         # Preview migration changes
  node runMigrations.js migrate --backup          # Backup before migration

Environment Variables:
  MONGODB_URI              MongoDB connection string
  MIGRATION_CLEANUP        Set to 'true' to enable cleanup
  NODE_ENV                 Environment (development/production)
`);
}

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/olpt';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        logger.info(`Connected to MongoDB: ${mongoUri}`);
        return true;
        
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        return false;
    }
}

/**
 * Create database backup
 */
async function createBackup() {
    try {
        logger.info('Creating database backup...');
        
        const { spawn } = require('child_process');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, `../backups/backup-${timestamp}`);
        
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/olpt';
        const dbName = mongoUri.split('/').pop();
        
        return new Promise((resolve, reject) => {
            const mongodump = spawn('mongodump', [
                '--uri', mongoUri,
                '--out', backupPath
            ]);
            
            mongodump.on('close', (code) => {
                if (code === 0) {
                    logger.info(`Backup created: ${backupPath}`);
                    resolve(backupPath);
                } else {
                    reject(new Error(`Backup failed with code ${code}`));
                }
            });
            
            mongodump.on('error', (error) => {
                logger.warn('Backup failed (mongodump not available):', error.message);
                resolve(null); // Continue without backup
            });
        });
        
    } catch (error) {
        logger.warn('Backup failed:', error.message);
        return null;
    }
}

/**
 * Show migration status
 */
async function showMigrationStatus() {
    try {
        const Course = require('../models/Course');
        const Module = require('../models/Module');
        const ModuleProgress = require('../models/ModuleProgress');
        const LearningProgress = require('../models/LearningProgress');
        
        console.log('\n📊 Migration Status:\n');
        
        // Course statistics
        const totalCourses = await Course.countDocuments();
        const coursesWithModules = await Course.countDocuments({ modules: { $exists: true, $ne: [] } });
        const coursesWithSyllabus = await Course.countDocuments({ syllabus: { $exists: true, $ne: [] } });
        
        console.log(`Courses:
  Total: ${totalCourses}
  With modules: ${coursesWithModules}
  With syllabus: ${coursesWithSyllabus}
  Migration 001 progress: ${totalCourses > 0 ? Math.round((coursesWithModules / totalCourses) * 100) : 0}%`);
        
        // Module statistics
        const totalModules = await Module.countDocuments();
        const migratedModules = await Module.countDocuments({ migratedFrom: 'course_syllabus' });
        
        console.log(`\nModules:
  Total: ${totalModules}
  Migrated from syllabus: ${migratedModules}
  Manually created: ${totalModules - migratedModules}`);
        
        // Progress statistics
        const totalLearningProgress = await LearningProgress.countDocuments();
        const learningProgressWithModules = await LearningProgress.countDocuments({ moduleProgresses: { $exists: true, $ne: [] } });
        const totalModuleProgress = await ModuleProgress.countDocuments();
        const migratedModuleProgress = await ModuleProgress.countDocuments({ migratedFrom: 'learning_progress' });
        
        console.log(`\nProgress Tracking:
  Learning Progress records: ${totalLearningProgress}
  With module references: ${learningProgressWithModules}
  Module Progress records: ${totalModuleProgress}
  Migrated from learning progress: ${migratedModuleProgress}
  Migration 002 progress: ${totalLearningProgress > 0 ? Math.round((learningProgressWithModules / totalLearningProgress) * 100) : 0}%`);
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        
        if (coursesWithModules < totalCourses) {
            console.log('  • Run migration 001 to convert remaining course syllabus to modules');
        }
        
        if (learningProgressWithModules < totalLearningProgress) {
            console.log('  • Run migration 002 to create module progress from learning progress');
        }
        
        if (totalModuleProgress > 0 && learningProgressWithModules < totalLearningProgress) {
            console.log('  • Run migration 003 to update learning progress with module references');
        }
        
        console.log('  • Run migration 004 to validate data integrity and clean up orphaned records');
        
        return {
            courses: { total: totalCourses, withModules: coursesWithModules, withSyllabus: coursesWithSyllabus },
            modules: { total: totalModules, migrated: migratedModules },
            progress: { 
                learningProgress: totalLearningProgress, 
                withModules: learningProgressWithModules, 
                moduleProgress: totalModuleProgress, 
                migratedProgress: migratedModuleProgress 
            }
        };
        
    } catch (error) {
        logger.error('Failed to get migration status:', error);
        throw error;
    }
}

/**
 * Confirm action with user
 */
async function confirmAction(message) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(`${message} (y/N): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

/**
 * Dry run mode - show what would be done
 */
async function dryRun(command, args) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
    
    switch (command) {
        case 'migrate':
            const migrations = args.length > 0 ? args : ['001', '002', '003', '004'];
            console.log('Would run migrations:', migrations.join(', '));
            
            for (const migrationId of migrations) {
                switch (migrationId) {
                    case '001':
                        const Course = require('../models/Course');
                        const coursesWithSyllabus = await Course.countDocuments({ syllabus: { $exists: true, $ne: [] } });
                        console.log(`  Migration 001: Would convert ${coursesWithSyllabus} courses with syllabus to modules`);
                        break;
                        
                    case '002':
                        const LearningProgress = require('../models/LearningProgress');
                        const learningProgressCount = await LearningProgress.countDocuments();
                        console.log(`  Migration 002: Would create module progress for ${learningProgressCount} learning progress records`);
                        break;
                        
                    case '003':
                        const learningProgressWithoutModules = await LearningProgress.countDocuments({ 
                            moduleProgresses: { $exists: false } 
                        });
                        console.log(`  Migration 003: Would update ${learningProgressWithoutModules} learning progress records with module references`);
                        break;
                        
                    case '004':
                        console.log('  Migration 004: Would validate all data and report issues');
                        break;
                }
            }
            break;
            
        case 'rollback':
            const rollbacks = args.length > 0 ? args : ['001'];
            console.log('Would run rollbacks:', rollbacks.join(', '));
            
            for (const rollbackId of rollbacks) {
                switch (rollbackId) {
                    case '001':
                        const Module = require('../models/Module');
                        const migratedModules = await Module.countDocuments({ migratedFrom: 'course_syllabus' });
                        console.log(`  Rollback 001: Would remove ${migratedModules} migrated modules and restore course syllabus`);
                        break;
                }
            }
            break;
    }
    
    console.log('\nDry run completed. Use --force to execute changes.');
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('help') || args.includes('--help')) {
        displayHelp();
        return;
    }
    
    const command = args[0];
    const options = {
        dryRun: args.includes('--dry-run'),
        force: args.includes('--force'),
        cleanup: args.includes('--cleanup'),
        backup: args.includes('--backup'),
        verbose: args.includes('--verbose')
    };
    
    // Set cleanup environment variable
    if (options.cleanup) {
        process.env.MIGRATION_CLEANUP = 'true';
    }
    
    // Set verbose logging
    if (options.verbose) {
        logger.setLevel('debug');
    }
    
    try {
        // Connect to database
        logger.info('🔄 Module System Migration Runner');
        const connected = await connectDatabase();
        if (!connected) {
            process.exit(1);
        }
        
        // Handle commands
        switch (command) {
            case 'migrate':
                const migrationArgs = args.slice(1).filter(arg => !arg.startsWith('--'));
                const migrations = migrationArgs.length > 0 ? migrationArgs : ['001', '002', '003', '004'];
                
                if (options.dryRun) {
                    await dryRun('migrate', migrations);
                    break;
                }
                
                if (!options.force) {
                    const confirmed = await confirmAction(`Run migrations: ${migrations.join(', ')}?`);
                    if (!confirmed) {
                        console.log('Migration cancelled');
                        break;
                    }
                }
                
                if (options.backup) {
                    await createBackup();
                }
                
                const migrationResults = await runMigrations({ migrations });
                console.log('\n✅ Migrations completed successfully');
                console.log(JSON.stringify(migrationResults, null, 2));
                break;
                
            case 'rollback':
                const rollbackArgs = args.slice(1).filter(arg => !arg.startsWith('--'));
                const rollbacks = rollbackArgs.length > 0 ? rollbackArgs : ['001'];
                
                if (options.dryRun) {
                    await dryRun('rollback', rollbacks);
                    break;
                }
                
                if (!options.force) {
                    const confirmed = await confirmAction(`⚠️  Run rollbacks: ${rollbacks.join(', ')}? This will delete data!`);
                    if (!confirmed) {
                        console.log('Rollback cancelled');
                        break;
                    }
                }
                
                if (options.backup) {
                    await createBackup();
                }
                
                const rollbackResults = await runRollbacks({ rollbacks });
                console.log('\n✅ Rollbacks completed successfully');
                console.log(JSON.stringify(rollbackResults, null, 2));
                break;
                
            case 'validate':
                const { migration004_DataValidationAndCleanup } = require('./moduleSystemMigration');
                const validationResults = await migration004_DataValidationAndCleanup();
                console.log('\n✅ Validation completed');
                console.log(JSON.stringify(validationResults, null, 2));
                break;
                
            case 'status':
                await showMigrationStatus();
                break;
                
            default:
                console.log(`Unknown command: ${command}`);
                displayHelp();
                process.exit(1);
        }
        
    } catch (error) {
        logger.error('Migration runner failed:', error);
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
        
    } finally {
        await mongoose.disconnect();
        logger.info('Database connection closed');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    main,
    showMigrationStatus,
    createBackup,
    connectDatabase
};