const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

const sampleQuizzes = [
  {
    title: "Module 1 Assessment",
    description: "Test your understanding of the fundamental concepts covered in Module 1.",
    instructions: "Read each question carefully and select the best answer. You have 30 minutes to complete this quiz. Make sure to review your answers before submitting.",
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 70,
    status: 'published',
    difficulty: 2,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "What is the primary purpose of a learning management system?",
        options: [
          { id: 'a', text: "To replace traditional classroom learning entirely", isCorrect: false },
          { id: 'b', text: "To facilitate online learning and course management", isCorrect: true },
          { id: 'c', text: "To store student grades only", isCorrect: false },
          { id: 'd', text: "To provide entertainment content", isCorrect: false }
        ],
        points: 2
      },
      {
        id: 'q2',
        type: 'multiple_select',
        question: "Which of the following are benefits of online learning? (Select all that apply)",
        options: [
          { id: 'a', text: "Flexibility in scheduling", isCorrect: true },
          { id: 'b', text: "Access to diverse resources", isCorrect: true },
          { id: 'c', text: "Self-paced learning", isCorrect: true },
          { id: 'd', text: "Reduced technology requirements", isCorrect: false }
        ],
        points: 3
      },
      {
        id: 'q3',
        type: 'true_false',
        question: "Effective online learning requires active student participation and engagement.",
        correctAnswer: 'true',
        points: 1
      },
      {
        id: 'q4',
        type: 'text',
        question: "Describe one strategy you would use to stay motivated in an online learning environment.",
        correctAnswer: "time management",
        points: 4
      },
      {
        id: 'q5',
        type: 'multiple_choice',
        question: "What is the most important factor for successful online learning?",
        options: [
          { id: 'a', text: "Fast internet connection", isCorrect: false },
          { id: 'b', text: "Expensive equipment", isCorrect: false },
          { id: 'c', text: "Self-discipline and time management", isCorrect: true },
          { id: 'd', text: "Previous online experience", isCorrect: false }
        ],
        points: 2
      }
    ]
  }
];

const seedQuizzes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing quiz data
    await Quiz.deleteMany({});
    console.log('Cleared existing quiz data');

    // Get the first course and user for seeding
    const course = await Course.findOne();
    const user = await User.findOne({ role: 'admin' });

    if (!course || !user) {
      console.log('No course or admin user found. Please ensure courses and users exist first.');
      process.exit(1);
    }

    // Create quizzes
    const quizzesToCreate = sampleQuizzes.map(quiz => ({
      ...quiz,
      courseId: course._id,
      createdBy: user._id
    }));

    const createdQuizzes = await Quiz.insertMany(quizzesToCreate);
    console.log(`Created ${createdQuizzes.length} sample quizzes`);

    createdQuizzes.forEach(quiz => {
      console.log(`- ${quiz.title} (ID: ${quiz._id})`);
    });

    console.log('\nQuiz seeding completed successfully!');
    console.log(`\nYou can now test the quiz API at:`);
    console.log(`GET /api/quiz/course/${course._id} - Get all quizzes for the course`);
    console.log(`GET /api/quiz/${createdQuizzes[0]._id} - Get specific quiz`);

  } catch (error) {
    console.error('Error seeding quizzes:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the seeding
seedQuizzes();