/**
 * addModuleContent.js - Script to add sample content to existing modules
 */

const mongoose = require('mongoose');
const Module = require('./models/Module');

// Sample content templates
const contentTemplates = {
    text: {
        type: 'text',
        title: 'Introduction to the Topic',
        description: 'Learn the fundamental concepts',
        duration: 15,
        contentData: {
            content: `
                <h2>Welcome to this Learning Module</h2>
                <p>In this section, you will learn about the key concepts and principles that form the foundation of this topic.</p>
                
                <h3>Key Learning Points:</h3>
                <ul>
                    <li>Understand the basic terminology and definitions</li>
                    <li>Explore real-world applications</li>
                    <li>Practice with interactive examples</li>
                    <li>Apply knowledge through exercises</li>
                </ul>
                
                <h3>What You'll Achieve:</h3>
                <p>By the end of this module, you will have a solid understanding of the fundamental concepts and be ready to progress to more advanced topics.</p>
                
                <div style="background-color: #f0f8ff; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
                    <strong>💡 Pro Tip:</strong> Take notes as you read through this content. It will help reinforce your learning and serve as a quick reference later.
                </div>
            `,
            readingTime: 10
        }
    },
    video: {
        type: 'video',
        title: 'Video Lesson',
        description: 'Watch and learn key concepts',
        duration: 20,
        contentData: {
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            transcript: 'This video covers the main concepts of the module with practical examples and demonstrations.'
        }
    },
    quiz: {
        type: 'quiz',
        title: 'Knowledge Check',
        description: 'Test your understanding',
        duration: 10,
        contentData: {
            questions: [
                {
                    questionId: 'q1',
                    type: 'multiple-choice',
                    question: 'Which of the following best describes the main concept covered in this module?',
                    options: [
                        'A fundamental principle in the field',
                        'An advanced technique',
                        'A deprecated method',
                        'A theoretical concept only'
                    ],
                    correctAnswer: 0,
                    points: 10,
                    explanation: 'The main concept is indeed a fundamental principle that serves as the foundation for more advanced topics.'
                },
                {
                    questionId: 'q2',
                    type: 'true-false',
                    question: 'This module covers both theoretical and practical aspects.',
                    options: ['True', 'False'],
                    correctAnswer: 0,
                    points: 5,
                    explanation: 'Yes, the module is designed to provide both theoretical understanding and practical application opportunities.'
                }
            ],
            passingScore: 70,
            timeLimit: 10,
            allowRetakes: true
        }
    },
    assignment: {
        type: 'assignment',
        title: 'Practical Exercise',
        description: 'Apply what you have learned',
        duration: 30,
        contentData: {
            instructions: `
                <h3>Assignment Instructions</h3>
                <p>Complete the following practical exercise to demonstrate your understanding of the module concepts:</p>
                
                <ol>
                    <li>Review the key concepts covered in the previous sections</li>
                    <li>Choose a real-world scenario where these concepts apply</li>
                    <li>Write a brief analysis (300-500 words) explaining how you would apply the concepts</li>
                    <li>Include at least one example or case study</li>
                    <li>Submit your response in the text area below</li>
                </ol>
                
                <h4>Evaluation Criteria:</h4>
                <ul>
                    <li>Understanding of key concepts (40%)</li>
                    <li>Application to real-world scenario (30%)</li>
                    <li>Quality of example/case study (20%)</li>
                    <li>Writing clarity and organization (10%)</li>
                </ul>
            `,
            submissionFormat: 'text',
            rubric: [
                {
                    criterion: 'Concept Understanding',
                    maxPoints: 40,
                    description: 'Demonstrates clear understanding of module concepts'
                },
                {
                    criterion: 'Practical Application',
                    maxPoints: 30,
                    description: 'Effectively applies concepts to real-world scenario'
                },
                {
                    criterion: 'Example Quality',
                    maxPoints: 20,
                    description: 'Provides relevant and insightful examples'
                },
                {
                    criterion: 'Communication',
                    maxPoints: 10,
                    description: 'Clear, organized, and well-written response'
                }
            ]
        }
    }
};

async function addContentToModules() {
    try {
        await mongoose.connect('mongodb://localhost:27017/olpt', { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });

        console.log('Connected to MongoDB');

        // Find all modules that don't have content or have empty content
        const modules = await Module.find({
            $or: [
                { contents: { $exists: false } },
                { contents: { $size: 0 } }
            ]
        });

        console.log(`Found ${modules.length} modules without content`);

        for (const module of modules) {
            console.log(`\nAdding content to module: "${module.title}"`);

            // Create content based on module type or randomly
            const contentItems = [];
            let contentCounter = 1;

            // Add introduction text content
            const textContent = { ...contentTemplates.text };
            textContent.contentId = `${module._id}_content_${contentCounter++}`;
            textContent.order = contentCounter - 1;
            textContent.title = `${module.title} - Introduction`;
            textContent.contentData.content = textContent.contentData.content.replace(
                'Welcome to this Learning Module',
                `Welcome to ${module.title}`
            );
            contentItems.push(textContent);

            // Add video content
            const videoContent = { ...contentTemplates.video };
            videoContent.contentId = `${module._id}_content_${contentCounter++}`;
            videoContent.order = contentCounter - 1;
            videoContent.title = `${module.title} - Video Lesson`;
            contentItems.push(videoContent);

            // Add quiz content
            const quizContent = { ...contentTemplates.quiz };
            quizContent.contentId = `${module._id}_content_${contentCounter++}`;
            quizContent.order = contentCounter - 1;
            quizContent.title = `${module.title} - Knowledge Check`;
            contentItems.push(quizContent);

            // Add assignment content
            const assignmentContent = { ...contentTemplates.assignment };
            assignmentContent.contentId = `${module._id}_content_${contentCounter++}`;
            assignmentContent.order = contentCounter - 1;
            assignmentContent.title = `${module.title} - Practical Exercise`;
            contentItems.push(assignmentContent);

            // Update the module with content
            await Module.findByIdAndUpdate(module._id, {
                contents: contentItems,
                estimatedDuration: contentItems.reduce((total, item) => total + item.duration, 0)
            });

            console.log(`Added ${contentItems.length} content items to "${module.title}"`);
        }

        console.log('\n✅ Content addition completed!');

        // Verify the update
        const updatedModules = await Module.find({ contents: { $exists: true, $ne: [] } }).countDocuments();
        console.log(`Total modules with content: ${updatedModules}`);

    } catch (error) {
        console.error('Error adding content to modules:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
addContentToModules();