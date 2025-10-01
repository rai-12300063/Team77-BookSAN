/**
 * directPopulate.js - Direct database population script
 */

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const contentSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['video', 'text', 'quiz', 'assignment', 'interactive', 'discussion', 'resource']
    },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
    contentData: mongoose.Schema.Types.Mixed
}, { _id: false });

const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contents: [contentSchema],
    estimatedDuration: { type: Number, default: 0 }
});

const Module = mongoose.model('Module', moduleSchema);

async function populateNow() {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect('mongodb://localhost:27017/olpt');
        console.log('✅ Connected!');

        const emptyModules = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        });

        console.log(`📚 Found ${emptyModules.length} modules to populate`);

        if (emptyModules.length === 0) {
            console.log('🎉 All modules already have content!');
            process.exit(0);
        }

        for (let i = 0; i < emptyModules.length; i++) {
            const module = emptyModules[i];
            console.log(`${i + 1}/${emptyModules.length} Processing: ${module.title}`);

            const quickContent = [
                {
                    contentId: `quick_${module._id}_1`,
                    type: 'text',
                    title: 'Overview',
                    description: 'Module introduction',
                    duration: 5,
                    order: 1,
                    isRequired: true,
                    contentData: {
                        content: `
                            <h3>📚 ${module.title}</h3>
                            <p>Welcome! This module covers <strong>${module.title.toLowerCase()}</strong>.</p>
                            <h4>What you'll discover:</h4>
                            <ul>
                                <li>🎯 Essential concepts</li>
                                <li>💡 Key insights</li>
                                <li>🛠️ Practical tips</li>
                            </ul>
                        `,
                        readingTime: 3
                    }
                },
                {
                    contentId: `quick_${module._id}_2`,
                    type: 'quiz',
                    title: 'Quick Check',
                    description: 'Knowledge verification',
                    duration: 3,
                    order: 2,
                    isRequired: true,
                    contentData: {
                        questions: [{
                            questionId: 'check1',
                            type: 'multiple-choice',
                            question: `Which best describes ${module.title}?`,
                            options: [
                                'A key learning topic',
                                'Optional information',
                                'Background reading',
                                'Reference material'
                            ],
                            correctAnswer: 0,
                            points: 10,
                            explanation: 'This is indeed a key learning topic in the curriculum.'
                        }],
                        passingScore: 70,
                        allowRetakes: true
                    }
                }
            ];

            await Module.updateOne(
                { _id: module._id },
                { 
                    contents: quickContent,
                    estimatedDuration: 8
                }
            );

            console.log(`   ✅ Added 2 demo items (8 min total)`);
        }

        console.log(`\n🎉 SUCCESS! Populated ${emptyModules.length} modules with demo content!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Database disconnected');
        process.exit(0);
    }
}

populateNow();