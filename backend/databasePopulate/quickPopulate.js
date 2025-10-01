/**
 * quickPopulate.js - Quick script to add demo content
 */

const mongoose = require('mongoose');

// Set strictQuery to avoid deprecation warnings
mongoose.set('strictQuery', false);

const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: String,
    description: String,
    contents: [{
        contentId: String,
        type: String,
        title: String,
        description: String,
        duration: Number,
        order: Number,
        isRequired: Boolean,
        contentData: mongoose.Schema.Types.Mixed
    }],
    estimatedDuration: Number
}, { collection: 'modules' });

const Module = mongoose.model('Module', moduleSchema);

async function addDemoContent() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/olpt');
        console.log('Connected successfully!');

        // Find modules without content
        const modules = await Module.find({ 
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        }).limit(10); // Process first 10 modules

        console.log(`Found ${modules.length} modules to update`);

        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            console.log(`${i + 1}. Updating: ${module.title}`);

            const shortContent = [
                {
                    contentId: `demo_${module._id}_1`,
                    type: 'text',
                    title: 'Introduction',
                    description: 'Quick overview',
                    duration: 5,
                    order: 1,
                    isRequired: true,
                    contentData: {
                        content: `<h3>${module.title}</h3><p>Learn the basics of ${module.title.toLowerCase()}.</p><ul><li>Key concepts</li><li>Practical examples</li><li>Quick exercises</li></ul>`
                    }
                },
                {
                    contentId: `demo_${module._id}_2`,
                    type: 'quiz',
                    title: 'Quick Check',
                    description: 'Test knowledge',
                    duration: 3,
                    order: 2,
                    isRequired: true,
                    contentData: {
                        questions: [{
                            questionId: 'q1',
                            type: 'multiple-choice',
                            question: `What is ${module.title} about?`,
                            options: ['Key learning concepts', 'Random information', 'Historical facts', 'None of above'],
                            correctAnswer: 0,
                            points: 10
                        }],
                        passingScore: 70
                    }
                }
            ];

            await Module.updateOne(
                { _id: module._id },
                { 
                    contents: shortContent,
                    estimatedDuration: 8
                }
            );
        }

        console.log(`✅ Updated ${modules.length} modules successfully!`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

addDemoContent();