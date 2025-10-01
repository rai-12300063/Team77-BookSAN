/**
 * populateModulesDemo.js - Script to add short demo content to all modules
 */

const mongoose = require('mongoose');
const Module = require('./models/Module');

async function populateModulesWithDemoContent() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/olpt', { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log('✅ Connected to MongoDB');

        // Find all modules that don't have content
        const modules = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        });

        console.log(`📚 Found ${modules.length} modules without content`);

        if (modules.length === 0) {
            console.log('🎉 All modules already have content!');
            return;
        }

        let updatedCount = 0;

        for (const module of modules) {
            console.log(`\n📝 Adding demo content to: "${module.title}"`);

            // Create short demo content
            const demoContent = [
                {
                    contentId: `${module._id}_intro`,
                    type: 'text',
                    title: 'Introduction',
                    description: 'Quick overview of the module',
                    duration: 5,
                    order: 1,
                    isRequired: true,
                    contentData: {
                        content: `
                            <h3>Welcome to ${module.title}</h3>
                            <p>This module will teach you the essential concepts of <strong>${module.title.toLowerCase()}</strong>.</p>
                            
                            <h4>📋 What you'll learn:</h4>
                            <ul>
                                <li>Core principles and concepts</li>
                                <li>Practical applications</li>
                                <li>Real-world examples</li>
                            </ul>
                            
                            <div style="background: #e8f4fd; padding: 12px; border-radius: 6px; margin: 15px 0;">
                                <strong>💡 Tip:</strong> Take your time to understand each concept before moving to the next section.
                            </div>
                        `,
                        readingTime: 3
                    }
                },
                {
                    contentId: `${module._id}_lesson`,
                    type: 'video',
                    title: 'Main Lesson',
                    description: 'Core learning content',
                    duration: 10,
                    order: 2,
                    isRequired: true,
                    contentData: {
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                        transcript: `This lesson covers the fundamental concepts of ${module.title.toLowerCase()}. You'll learn through practical examples and clear explanations.`
                    }
                },
                {
                    contentId: `${module._id}_quiz`,
                    type: 'quiz',
                    title: 'Quick Check',
                    description: 'Test your understanding',
                    duration: 5,
                    order: 3,
                    isRequired: true,
                    contentData: {
                        questions: [
                            {
                                questionId: 'demo_q1',
                                type: 'multiple-choice',
                                question: `What is the main focus of ${module.title}?`,
                                options: [
                                    'Understanding key concepts',
                                    'Memorizing definitions',
                                    'Advanced theory only',
                                    'Historical background'
                                ],
                                correctAnswer: 0,
                                points: 5,
                                explanation: 'The main focus is understanding key concepts that can be applied practically.'
                            },
                            {
                                questionId: 'demo_q2',
                                type: 'true-false',
                                question: 'Practical application helps reinforce learning.',
                                options: ['True', 'False'],
                                correctAnswer: 0,
                                points: 5,
                                explanation: 'Yes, applying concepts in practice helps solidify understanding.'
                            }
                        ],
                        passingScore: 70,
                        timeLimit: 5,
                        allowRetakes: true
                    }
                }
            ];

            // Update the module
            await Module.findByIdAndUpdate(module._id, {
                contents: demoContent,
                estimatedDuration: demoContent.reduce((total, content) => total + content.duration, 0)
            });

            updatedCount++;
            console.log(`   ✅ Added ${demoContent.length} demo content items (${demoContent.reduce((total, content) => total + content.duration, 0)} min total)`);
        }

        console.log(`\n🎉 Successfully updated ${updatedCount} modules with demo content!`);

        // Show summary
        const totalModules = await Module.countDocuments();
        const modulesWithContent = await Module.countDocuments({ contents: { $exists: true, $ne: [] } });
        
        console.log(`\n📊 Summary:`);
        console.log(`   Total modules: ${totalModules}`);
        console.log(`   Modules with content: ${modulesWithContent}`);
        console.log(`   Coverage: ${Math.round((modulesWithContent / totalModules) * 100)}%`);

    } catch (error) {
        console.error('❌ Error populating modules:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the script
console.log('🚀 Starting module population with demo content...\n');
populateModulesWithDemoContent();