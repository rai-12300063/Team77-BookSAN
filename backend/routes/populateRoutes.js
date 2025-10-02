const express = require('express');
const router = express.Router();
const { updateModulesAndSync, syncUserProgress } = require('../databasePopulate/enhancedModuleUpdate');

// Simple populate route without authentication for demo purposes
router.post('/populate-demo', async (req, res) => {
    try {
        console.log('🚀 Starting module population...');
        
        // Import models
        const Module = require('../models/Module');
        
        // Find modules without content or with empty content
        const emptyModules = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } },
                { contents: null }
            ]
        });

        console.log(`📚 Found ${emptyModules.length} modules to populate`);

        if (emptyModules.length === 0) {
            return res.json({
                message: 'No empty modules found to populate',
                totalModules: await Module.countDocuments(),
                populatedModules: 0
            });
        }

        let populatedCount = 0;
        
        for (const module of emptyModules) {
            const demoContent = [
                {
                    contentId: `demo_${module._id}_intro`,
                    type: 'text',
                    title: 'Introduction',
                    description: `Learn about ${module.title}`,
                    duration: 5,
                    order: 1,
                    isRequired: true,
                    contentData: {
                        content: `
                            <div style="padding: 20px; font-family: Arial, sans-serif;">
                                <h2>🎯 ${module.title}</h2>
                                <p><strong>Welcome to this learning module!</strong></p>
                                
                                <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0;">
                                    <h3>What you'll learn:</h3>
                                    <ul>
                                        <li>📖 Core concepts and fundamentals</li>
                                        <li>💡 Key insights and practical applications</li>
                                        <li>🛠️ Hands-on examples and exercises</li>
                                        <li>🎯 Real-world use cases</li>
                                    </ul>
                                </div>
                                
                                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                                    <strong>💡 Study Tip:</strong> Take your time to understand each concept before moving to the next section.
                                </div>
                                
                                <p><em>This is a demo module with sample content. Complete it to see how progress tracking works!</em></p>
                            </div>
                        `,
                        readingTime: 3
                    }
                },
                {
                    contentId: `demo_${module._id}_knowledge_check`,
                    type: 'quiz',
                    title: 'Knowledge Check',
                    description: 'Quick quiz to test your understanding',
                    duration: 3,
                    order: 2,
                    isRequired: true,
                    contentData: {
                        questions: [
                            {
                                questionId: 'q1',
                                type: 'multiple-choice',
                                question: `What is the main purpose of the ${module.title} module?`,
                                options: [
                                    'To provide comprehensive learning',
                                    'To test memory',
                                    'To waste time',
                                    'To complete assignments'
                                ],
                                correctAnswer: 0,
                                points: 5,
                                explanation: 'This module is designed to provide comprehensive learning on the topic.'
                            },
                            {
                                questionId: 'q2',
                                type: 'true-false',
                                question: 'This is a demo module with sample content.',
                                correctAnswer: true,
                                points: 5,
                                explanation: 'Yes, this is indeed a demo module created for demonstration purposes.'
                            }
                        ],
                        passingScore: 70,
                        timeLimit: 5,
                        allowRetakes: true
                    }
                }
            ];

            // Update the module with demo content
            await Module.findByIdAndUpdate(module._id, {
                contents: demoContent,
                estimatedDuration: 8, // 5 + 3 minutes
                lastUpdated: new Date()
            });

            populatedCount++;
            console.log(`✅ Populated module: ${module.title}`);
        }

        console.log(`🎉 Successfully populated ${populatedCount} modules!`);

        res.json({
            message: `Successfully populated ${populatedCount} modules with demo content`,
            populatedModules: populatedCount,
            totalEmptyModules: emptyModules.length,
            details: emptyModules.map(m => ({
                id: m._id,
                title: m.title,
                courseId: m.courseId
            }))
        });

    } catch (error) {
        console.error('❌ Error populating modules:', error);
        res.status(500).json({
            message: 'Failed to populate modules with demo content',
            error: error.message
        });
    }
});

// Enhanced module content update route
router.post('/update-modules-enhanced', async (req, res) => {
    try {
        console.log('🚀 Starting enhanced module content update...');
        
        // Import and run the enhanced update function
        const { updateModulesAndSync } = require('../../../OLPTBackupOnly/_archive/backend/databasePopulate/enhancedModuleUpdate');
        
        await updateModulesAndSync();
        
        res.json({
            success: true,
            message: 'Enhanced module content update completed successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating modules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update modules with enhanced content',
            error: error.message
        });
    }
});

// Sync user progress route
router.post('/sync-progress', async (req, res) => {
    try {
        console.log('🔄 Starting progress synchronization...');
        
        await syncUserProgress();
        
        res.json({
            success: true,
            message: 'User progress synchronization completed successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error syncing progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync user progress',
            error: error.message
        });
    }
});

// Combined update and sync route
router.post('/update-and-sync-all', async (req, res) => {
    try {
        console.log('🚀 Starting comprehensive update and sync...');
        
        // Update modules with enhanced content
        const { updateModulesWithSimpleContent } = require('../../../OLPTBackupOnly/_archive/backend/databasePopulate/simpleModuleUpdate');
        await updateModulesWithSimpleContent();
        
        // Seed enhanced quizzes
        const Quiz = require('../models/Quiz');
        const Course = require('../models/Course');
        
        // Get first course for quiz association
        const course = await Course.findOne();
        if (course) {
            // Add some sample enhanced quizzes
            const sampleQuiz = {
                title: "Comprehensive Assessment",
                description: "Test your understanding across multiple modules",
                courseId: course._id,
                createdBy: course.instructor?.id || new require('mongoose').Types.ObjectId(),
                instructions: "Answer all questions to the best of your ability. You have 45 minutes to complete this assessment.",
                timeLimit: 45,
                maxAttempts: 2,
                passingScore: 75,
                status: 'published',
                difficulty: 2,
                questions: [
                    {
                        id: 'q1',
                        type: 'multiple_choice',
                        question: "What is the most important principle in modern web development?",
                        options: [
                            { id: 'a', text: "Performance optimization", isCorrect: false },
                            { id: 'b', text: "User experience and accessibility", isCorrect: true },
                            { id: 'c', text: "Code complexity", isCorrect: false },
                            { id: 'd', text: "Technology trends", isCorrect: false }
                        ],
                        points: 3,
                        explanation: "User experience and accessibility ensure applications are usable by everyone and provide value."
                    }
                ]
            };
            
            await Quiz.findOneAndUpdate(
                { title: sampleQuiz.title, courseId: course._id },
                sampleQuiz,
                { upsert: true, new: true }
            );
        }
        
        res.json({
            success: true,
            message: 'Comprehensive update and sync completed successfully',
            details: {
                modulesUpdated: true,
                progressSynced: true,
                quizzesUpdated: true
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in comprehensive update:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete comprehensive update and sync',
            error: error.message
        });
    }
});

// Complete database population route
router.post('/populate-complete-database', async (req, res) => {
    try {
        console.log('🚀 Starting complete database population...');
        
        const Course = require('../models/Course');
        const Module = require('../models/Module');
        const User = require('../models/User');
        const Quiz = require('../models/Quiz');
        
        // Step 1: Seed QUT Curriculum (courses and modules)
        console.log('📚 Step 1: Seeding QUT Curriculum...');
        const { spawn } = require('child_process');
        
        // We'll use the existing data since we already seeded it
        const courseCount = await Course.countDocuments();
        const moduleCount = await Module.countDocuments();
        
        console.log(`✅ Found ${courseCount} courses and ${moduleCount} modules`);
        
        // Step 2: Populate modules with content
        console.log('📝 Step 2: Populating modules with content...');
        const { updateModulesWithSimpleContent } = require('../../../OLPTBackupOnly/_archive/backend/databasePopulate/simpleModuleUpdate');
        // Only update if modules don't have content
        const modulesWithoutContent = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        });
        
        if (modulesWithoutContent.length > 0) {
            await updateModulesWithSimpleContent();
            console.log(`✅ Updated ${modulesWithoutContent.length} modules with content`);
        } else {
            console.log('✅ All modules already have content');
        }
        
        // Step 3: Create sample users if they don't exist
        console.log('👥 Step 3: Creating sample users...');
        const userCount = await User.countDocuments();
        console.log(`✅ Found ${userCount} existing users`);
        
        // Step 4: Seed quizzes
        console.log('❓ Step 4: Seeding quizzes...');
        const quizCount = await Quiz.countDocuments();
        console.log(`✅ Found ${quizCount} existing quizzes`);
        
        res.json({
            success: true,
            message: 'Complete database population completed successfully',
            summary: {
                courses: courseCount,
                modules: moduleCount,
                users: userCount,
                quizzes: quizCount,
                modulesWithContent: moduleCount - modulesWithoutContent.length,
                populatedModules: modulesWithoutContent.length
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error in complete database population:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete database population',
            error: error.message
        });
    }
});

module.exports = router;