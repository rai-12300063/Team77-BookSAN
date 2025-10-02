/**
 * Enhanced Module Content and Progress Sync Script
 * Updates all modules with comprehensive content and syncs user progress
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Module = require('../models/Module');
const ModuleProgress = require('../models/ModuleProgress');
const Course = require('../models/Course');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

// Enhanced content templates for different module types
const getEnhancedContentByType = (moduleTitle, moduleDescription, week) => {
  const baseContentId = `mod_${week}_${Date.now()}`;
  
  return [
    {
      contentId: `${baseContentId}_overview`,
      type: 'video',
      title: `${moduleTitle} - Overview`,
      description: `Comprehensive introduction to ${moduleTitle} concepts and objectives`,
      duration: 15,
      order: 1,
      isRequired: true,
      contentData: {
        videoUrl: `https://example.com/videos/module-${week}-overview`,
        transcript: `Welcome to ${moduleTitle}. In this module, we will explore: ${moduleDescription}`,
        subtitles: true,
        quality: ['720p', '1080p']
      }
    },
    {
      contentId: `${baseContentId}_theory`,
      type: 'text',
      title: 'Theoretical Foundation',
      description: 'Core concepts and theoretical background',
      duration: 25,
      order: 2,
      isRequired: true,
      contentData: {
        content: `
          <div class="content-section">
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
            <div class="concept-grid">
              <div class="concept-card">
                <h4>Concept 1: Fundamentals</h4>
                <p>Basic principles and foundational knowledge required for this module.</p>
              </div>
              <div class="concept-card">
                <h4>Concept 2: Applications</h4>
                <p>Practical applications and real-world use cases.</p>
              </div>
              <div class="concept-card">
                <h4>Concept 3: Best Practices</h4>
                <p>Industry standards and recommended approaches.</p>
              </div>
            </div>
            
            <div class="summary-box">
              <h4>Module Summary</h4>
              <p>This module provides comprehensive coverage of ${moduleTitle} with focus on practical implementation and industry best practices.</p>
            </div>
          </div>
        `,
        readingTime: 25,
        difficulty: week <= 4 ? 'Beginner' : week <= 8 ? 'Intermediate' : 'Advanced'
      }
    },
    {
      contentId: `${baseContentId}_interactive`,
      type: 'interactive',
      title: 'Hands-on Lab Exercise',
      description: 'Interactive exercises and practical implementation',
      duration: 45,
      order: 3,
      isRequired: true,
      contentData: {
        exerciseType: 'coding',
        instructions: `Complete the following exercises to reinforce your understanding of ${moduleTitle}:`,
        exercises: [
          {
            id: 1,
            title: 'Basic Implementation',
            description: 'Implement basic concepts covered in this module',
            starterCode: '// Your code here\nconsole.log("Starting exercise...");',
            solution: '// Solution will be provided after attempt',
            hints: ['Start with the basic structure', 'Remember to handle edge cases']
          }
        ],
        tools: ['Code Editor', 'Browser Console', 'Development Tools'],
        submissionRequired: true
      }
    },
    {
      contentId: `${baseContentId}_assignment`,
      type: 'assignment',
      title: `${moduleTitle} - Practical Assignment`,
      description: 'Apply module concepts in a comprehensive project',
      duration: 90,
      order: 4,
      isRequired: true,
      contentData: {
        assignmentType: 'project',
        instructions: `
          <h3>Assignment: ${moduleTitle} Implementation</h3>
          <p>Create a comprehensive project that demonstrates your understanding of ${moduleTitle}.</p>
          
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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        rubric: {
          implementation: 40,
          documentation: 20,
          testing: 20,
          codeQuality: 20
        },
        submissionFormat: ['zip', 'github'],
        allowLateSubmission: true,
        latePenalty: 10
      }
    },
    {
      contentId: `${baseContentId}_quiz`,
      type: 'quiz',
      title: 'Module Knowledge Check',
      description: 'Assessment quiz to test your understanding',
      duration: 20,
      order: 5,
      isRequired: true,
      contentData: {
        quizType: 'knowledge_check',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: `What is the primary purpose of ${moduleTitle}?`,
            options: [
              'To provide theoretical foundation',
              'To implement practical solutions',
              'To understand industry standards',
              'All of the above'
            ],
            correctAnswer: 3,
            explanation: 'This module covers theoretical foundation, practical implementation, and industry standards.'
          },
          {
            id: 2,
            type: 'true_false',
            question: `${moduleTitle} concepts can be applied in real-world scenarios.`,
            correctAnswer: true,
            explanation: 'The concepts taught in this module are designed for practical application.'
          },
          {
            id: 3,
            type: 'short_answer',
            question: `Describe one key benefit of understanding ${moduleTitle}.`,
            sampleAnswer: 'Understanding this module helps in building better solutions and following industry best practices.',
            maxWords: 50
          }
        ],
        passingScore: 70,
        attempts: 3,
        showResults: true,
        randomizeQuestions: true
      }
    },
    {
      contentId: `${baseContentId}_resources`,
      type: 'text',
      title: 'Additional Resources',
      description: 'Extended reading and reference materials',
      duration: 15,
      order: 6,
      isRequired: false,
      contentData: {
        content: `
          <div class="resources-section">
            <h3>Additional Learning Resources</h3>
            
            <h4>📚 Recommended Reading</h4>
            <ul>
              <li><strong>Article:</strong> Advanced ${moduleTitle} Techniques - Industry Guide</li>
              <li><strong>Book Chapter:</strong> ${moduleTitle} in Modern Development (Chapter ${week})</li>
              <li><strong>Research Paper:</strong> Evolution of ${moduleTitle} Methodologies</li>
            </ul>
            
            <h4>🎥 Video Resources</h4>
            <ul>
              <li><strong>Tutorial:</strong> ${moduleTitle} Deep Dive (45 min)</li>
              <li><strong>Conference Talk:</strong> Future of ${moduleTitle} (30 min)</li>
              <li><strong>Case Study:</strong> ${moduleTitle} in Production (20 min)</li>
            </ul>
            
            <h4>🔧 Tools and Frameworks</h4>
            <ul>
              <li><strong>Tool 1:</strong> Development environment setup</li>
              <li><strong>Tool 2:</strong> Testing and debugging utilities</li>
              <li><strong>Framework:</strong> Popular implementation framework</li>
            </ul>
            
            <h4>🌐 Online Resources</h4>
            <ul>
              <li><strong>Documentation:</strong> Official ${moduleTitle} documentation</li>
              <li><strong>Community:</strong> ${moduleTitle} developer forum</li>
              <li><strong>Examples:</strong> Open source implementations</li>
            </ul>
          </div>
        `,
        resourceLinks: [
          {
            title: 'Official Documentation',
            url: `https://docs.example.com/${moduleTitle.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'documentation'
          },
          {
            title: 'Community Forum',
            url: `https://forum.example.com/${moduleTitle.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'community'
          }
        ]
      }
    }
  ];
};

// Function to sync progress for all users
async function syncUserProgress() {
  try {
    console.log('\n🔄 Starting progress synchronization...');
    
    // Get all users and courses
    const users = await User.find({});
    const courses = await Course.find({}).populate('syllabus');
    
    console.log(`👥 Found ${users.length} users and ${courses.length} courses`);
    
    for (const user of users) {
      for (const course of courses) {
        // Check if user has any enrollment or progress for this course
        const existingProgress = await ModuleProgress.find({
          userId: user._id,
          courseId: course._id
        });
        
        if (existingProgress.length > 0) {
          console.log(`🔄 Syncing progress for user ${user.name} in course ${course.title}`);
          
          // Update existing progress with new content structure
          for (const progress of existingProgress) {
            const module = await Module.findById(progress.moduleId);
            if (module && module.contents) {
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
            }
          }
        }
      }
    }
    
    console.log('✅ Progress synchronization completed');
  } catch (error) {
    console.error('❌ Error syncing progress:', error);
  }
}

// Main function to update modules and sync progress
async function updateModulesAndSync() {
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
      
      // Generate enhanced content
      const enhancedContent = getEnhancedContentByType(
        module.title,
        module.description,
        module.week || 1
      );
      
      // Update module with new content
      module.contents = enhancedContent;
      module.totalDuration = enhancedContent.reduce((sum, content) => sum + content.duration, 0);
      module.contentCount = enhancedContent.length;
      module.lastUpdated = new Date();
      
      await module.save();
      updatedCount++;
      
      console.log(`✅ Updated "${module.title}" with ${enhancedContent.length} content items`);
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} modules`);
    
    // Sync user progress
    await syncUserProgress();
    
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
  updateModulesAndSync();
}

module.exports = { updateModulesAndSync, syncUserProgress };