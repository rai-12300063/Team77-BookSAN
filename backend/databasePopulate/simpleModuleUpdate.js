/**
 * Simple Module Content Populate Script
 * Compatible with existing Module schema
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const connectDB = require('../config/db');

dotenv.config();

// Simple content templates that match the schema
const getSimpleContentByType = (moduleTitle, moduleDescription, week) => {
  const baseContentId = `mod_${week}_${Date.now()}`;
  
  return [
    {
      contentId: `${baseContentId}_overview`,
      type: 'video',
      title: `${moduleTitle} - Overview`,
      description: `Introduction to ${moduleTitle}`,
      duration: 15,
      order: 1,
      isRequired: true,
      contentData: {
        videoUrl: `https://example.com/videos/module-${week}-overview`,
        transcript: `Welcome to ${moduleTitle}. ${moduleDescription}`,
        subtitles: []
      }
    },
    {
      contentId: `${baseContentId}_theory`,
      type: 'text',
      title: 'Core Concepts',
      description: 'Theoretical foundation and key concepts',
      duration: 25,
      order: 2,
      isRequired: true,
      contentData: {
        content: `
          <div class="module-content">
            <h2>${moduleTitle}</h2>
            <p class="lead">${moduleDescription}</p>
            
            <h3>Learning Objectives</h3>
            <ul>
              <li>Understand core concepts and principles</li>
              <li>Apply theoretical knowledge to practical scenarios</li>
              <li>Analyze real-world implementations</li>
              <li>Evaluate different approaches and solutions</li>
            </ul>
            
            <h3>Key Concepts</h3>
            <div class="concept-section">
              <h4>Fundamentals</h4>
              <p>Basic principles and foundational knowledge required for this module.</p>
              
              <h4>Applications</h4>
              <p>Practical applications and real-world use cases.</p>
              
              <h4>Best Practices</h4>
              <p>Industry standards and recommended approaches.</p>
            </div>
            
            <div class="summary">
              <h4>Summary</h4>
              <p>This module provides comprehensive coverage of ${moduleTitle} with focus on practical implementation and industry best practices.</p>
            </div>
          </div>
        `,
        readingTime: 25
      }
    },
    {
      contentId: `${baseContentId}_interactive`,
      type: 'interactive',
      title: 'Hands-on Exercise',
      description: 'Interactive exercises and practical implementation',
      duration: 45,
      order: 3,
      isRequired: true,
      contentData: {
        interactionType: 'coding_exercise',
        interactionUrl: `https://example.com/exercises/module-${week}`
      }
    },
    {
      contentId: `${baseContentId}_assignment`,
      type: 'assignment',
      title: `${moduleTitle} - Assignment`,
      description: 'Apply module concepts in a practical project',
      duration: 90,
      order: 4,
      isRequired: true,
      contentData: {
        instructions: `
          <h3>Assignment: ${moduleTitle} Implementation</h3>
          <p>Create a project that demonstrates your understanding of ${moduleTitle}.</p>
          
          <h4>Requirements:</h4>
          <ul>
            <li>Implement core concepts covered in this module</li>
            <li>Follow best practices and coding standards</li>
            <li>Include proper documentation and comments</li>
            <li>Test your implementation thoroughly</li>
          </ul>
          
          <h4>Deliverables:</h4>
          <ul>
            <li>Source code with proper structure</li>
            <li>Documentation explaining your approach</li>
            <li>Test cases and results</li>
            <li>Reflection on challenges and learnings</li>
          </ul>
        `,
        submissionFormat: 'file',
        rubric: [
          {
            criterion: 'Implementation',
            maxPoints: 40,
            description: 'Quality and correctness of the implementation'
          },
          {
            criterion: 'Documentation',
            maxPoints: 20,
            description: 'Clarity and completeness of documentation'
          },
          {
            criterion: 'Testing',
            maxPoints: 20,
            description: 'Thoroughness of testing approach'
          },
          {
            criterion: 'Code Quality',
            maxPoints: 20,
            description: 'Code structure, style, and best practices'
          }
        ],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    },
    {
      contentId: `${baseContentId}_quiz`,
      type: 'quiz',
      title: 'Knowledge Check',
      description: 'Test your understanding of the module content',
      duration: 20,
      order: 5,
      isRequired: true,
      contentData: {
        questions: [
          {
            questionId: 'q1',
            type: 'multiple-choice',
            question: `What is the primary focus of ${moduleTitle}?`,
            options: [
              'Theoretical concepts only',
              'Practical implementation only',
              'Both theory and practice',
              'Neither theory nor practice'
            ],
            correctAnswer: 2,
            points: 2,
            explanation: 'This module covers both theoretical foundation and practical implementation.'
          },
          {
            questionId: 'q2',
            type: 'true-false',
            question: `${moduleTitle} concepts can be applied in real-world scenarios.`,
            correctAnswer: true,
            points: 1,
            explanation: 'The concepts taught are designed for practical application.'
          },
          {
            questionId: 'q3',
            type: 'short-answer',
            question: `List two key benefits of understanding ${moduleTitle}.`,
            correctAnswer: 'Better problem-solving skills and industry-ready knowledge',
            points: 3,
            explanation: 'Understanding this module helps in building better solutions and following industry practices.'
          }
        ],
        passingScore: 70,
        timeLimit: 20,
        allowRetakes: true
      }
    },
    {
      contentId: `${baseContentId}_resources`,
      type: 'resource',
      title: 'Additional Resources',
      description: 'Extended reading and reference materials',
      duration: 15,
      order: 6,
      isRequired: false,
      contentData: {
        resourceType: 'reference',
        resourceUrl: `https://example.com/resources/module-${week}`,
        fileSize: 0
      }
    }
  ];
};

// Function to update modules with simple content
async function updateModulesWithSimpleContent() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Find all modules
    const modules = await Module.find({});
    console.log(`📚 Found ${modules.length} modules to update`);
    
    let updatedCount = 0;
    
    for (const module of modules) {
      console.log(`\n📝 Updating module: "${module.title}"`);
      
      // Generate simple content
      const simpleContent = getSimpleContentByType(
        module.title,
        module.description,
        module.week || module.moduleNumber || 1
      );
      
      // Update module with new content
      module.contents = simpleContent;
      module.totalDuration = simpleContent.reduce((sum, content) => sum + content.duration, 0);
      module.contentCount = simpleContent.length;
      module.lastUpdated = new Date();
      
      await module.save();
      updatedCount++;
      
      console.log(`✅ Updated "${module.title}" with ${simpleContent.length} content items`);
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} modules`);
    
    // Sync existing user progress
    console.log('\n🔄 Syncing user progress...');
    
    const progressRecords = await ModuleProgress.find({}).populate('moduleId');
    
    for (const progress of progressRecords) {
      if (progress.moduleId && progress.moduleId.contents) {
        const module = progress.moduleId;
        
        // Update content progress to match new module structure
        const updatedContentProgress = module.contents.map(content => {
          const existingContentProgress = progress.contentProgress.find(
            cp => cp.contentId === content.contentId
          );
          
          return existingContentProgress || {
            contentId: content.contentId,
            contentType: content.type,
            status: 'not-started',
            isMandatory: content.isRequired,
            startedAt: null,
            completedAt: null,
            timeSpent: 0,
            score: null
          };
        });
        
        // Update progress record
        progress.contentProgress = updatedContentProgress;
        progress.totalContentCount = module.contents.length;
        progress.totalRequiredContentCount = module.contents.filter(c => c.isRequired).length;
        progress.lastSyncedAt = new Date();
        
        await progress.save();
        console.log(`🔄 Synced progress for module: ${module.title}`);
      }
    }
    
    console.log('✅ Progress synchronization completed');
    console.log('\n✅ Module update and progress sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating modules:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

// Run the update
if (require.main === module) {
  updateModulesWithSimpleContent();
}

module.exports = { updateModulesWithSimpleContent };