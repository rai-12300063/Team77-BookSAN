const mongoose = require('mongoose');
const Module = require('./models/Module');

// Set strictQuery to suppress warning
mongoose.set('strictQuery', false);

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://racilarde7678:qTuMNTZmjMcFafoH@cluster0.oiovem3.mongodb.net/olpt?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const populateModules = async () => {
    try {
        console.log('🚀 Starting module population...');
        
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
            console.log('ℹ️ No empty modules found to populate');
            const totalModules = await Module.countDocuments();
            console.log(`📊 Total modules in database: ${totalModules}`);
            return;
        }

        let populatedCount = 0;
        
        for (const module of emptyModules) {
            console.log(`📝 Processing module: ${module.title}`);
            
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
            const result = await Module.findByIdAndUpdate(
                module._id, 
                {
                    contents: demoContent,
                    estimatedDuration: 8, // 5 + 3 minutes
                    lastUpdated: new Date()
                },
                { new: true }
            );

            if (result) {
                populatedCount++;
                console.log(`✅ Successfully populated: ${module.title}`);
            } else {
                console.log(`❌ Failed to populate: ${module.title}`);
            }
        }

        console.log(`\n🎉 SUCCESS! Populated ${populatedCount} out of ${emptyModules.length} modules!`);
        console.log('📊 Summary:');
        console.log(`   - Total modules processed: ${emptyModules.length}`);
        console.log(`   - Successfully populated: ${populatedCount}`);
        console.log(`   - Failed: ${emptyModules.length - populatedCount}`);

    } catch (error) {
        console.error('❌ Error populating modules:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
    }
};

const main = async () => {
    await connectDB();
    await populateModules();
};

main();