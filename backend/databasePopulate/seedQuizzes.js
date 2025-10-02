const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

const sampleQuizzes = [
  {
    title: "Module 1: Web Development Fundamentals",
    description: "Test your understanding of modern web development landscape and ecosystem.",
    instructions: "Read each question carefully and select the best answer. You have 20 minutes to complete this quiz.",
    timeLimit: 20,
    maxAttempts: 3,
    passingScore: 70,
    status: 'published',
    difficulty: 1,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "What is the primary advantage of using modern web frameworks?",
        options: [
          { id: 'a', text: "They eliminate the need for HTML and CSS", isCorrect: false },
          { id: 'b', text: "They provide structured approaches to building scalable applications", isCorrect: true },
          { id: 'c', text: "They only work with specific browsers", isCorrect: false },
          { id: 'd', text: "They require less coding knowledge", isCorrect: false }
        ],
        points: 2,
        explanation: "Modern frameworks provide structure, reusability, and maintainability for building complex applications."
      },
      {
        id: 'q2',
        type: 'multiple_select',
        question: "Which of the following are key components of the JavaScript ecosystem? (Select all that apply)",
        options: [
          { id: 'a', text: "NPM (Node Package Manager)", isCorrect: true },
          { id: 'b', text: "Build tools like Webpack", isCorrect: true },
          { id: 'c', text: "Package.json configuration", isCorrect: true },
          { id: 'd', text: "Only vanilla JavaScript", isCorrect: false }
        ],
        points: 3,
        explanation: "The JavaScript ecosystem includes package managers, build tools, and configuration files."
      },
      {
        id: 'q3',
        type: 'true_false',
        question: "Frontend and backend frameworks serve the same purpose in web development.",
        correctAnswer: 'false',
        points: 1,
        explanation: "Frontend frameworks handle user interface, while backend frameworks manage server-side logic and data."
      },
      {
        id: 'q4',
        type: 'short_answer',
        question: "Name two benefits of using package managers like NPM in web development.",
        sampleAnswer: "Dependency management and easy installation of third-party libraries",
        points: 2,
        maxLength: 100
      }
    ]
  },
  {
    title: "Module 2: React.js Fundamentals",
    description: "Assessment of React components, JSX, and state management concepts.",
    instructions: "This quiz covers React fundamentals. Take your time and think through each question carefully.",
    timeLimit: 25,
    maxAttempts: 3,
    passingScore: 75,
    status: 'published',
    difficulty: 2,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "What is JSX in React?",
        options: [
          { id: 'a', text: "A new programming language", isCorrect: false },
          { id: 'b', text: "JavaScript XML - a syntax extension for JavaScript", isCorrect: true },
          { id: 'c', text: "A CSS framework", isCorrect: false },
          { id: 'd', text: "A database query language", isCorrect: false }
        ],
        points: 2,
        explanation: "JSX allows you to write HTML-like syntax in JavaScript, which React transforms into JavaScript."
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: "Which hook is used for managing component state in functional components?",
        options: [
          { id: 'a', text: "useEffect", isCorrect: false },
          { id: 'b', text: "useState", isCorrect: true },
          { id: 'c', text: "useContext", isCorrect: false },
          { id: 'd', text: "useCallback", isCorrect: false }
        ],
        points: 2,
        explanation: "useState is the hook specifically designed for managing state in functional components."
      },
      {
        id: 'q3',
        type: 'multiple_select',
        question: "Which of the following are valid ways to pass data to React components? (Select all that apply)",
        options: [
          { id: 'a', text: "Props", isCorrect: true },
          { id: 'b', text: "State", isCorrect: true },
          { id: 'c', text: "Context", isCorrect: true },
          { id: 'd', text: "Global variables", isCorrect: false }
        ],
        points: 3,
        explanation: "Props, state, and context are the proper React patterns for data flow."
      },
      {
        id: 'q4',
        type: 'true_false',
        question: "React components must always return a single parent element.",
        correctAnswer: 'false',
        points: 1,
        explanation: "React components can return fragments, arrays, or single elements. React.Fragment allows multiple elements without a wrapper."
      }
    ]
  },
  {
    title: "Module 3: Advanced React Concepts",
    description: "Deep dive into React hooks, context, and performance optimization.",
    instructions: "Advanced concepts quiz. Focus on practical applications and best practices.",
    timeLimit: 30,
    maxAttempts: 2,
    passingScore: 80,
    status: 'published',
    difficulty: 3,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "When should you use useEffect with an empty dependency array?",
        options: [
          { id: 'a', text: "When you want the effect to run on every render", isCorrect: false },
          { id: 'b', text: "When you want the effect to run only once after the component mounts", isCorrect: true },
          { id: 'c', text: "When you want to prevent the effect from running", isCorrect: false },
          { id: 'd', text: "When you want the effect to run before component unmounts", isCorrect: false }
        ],
        points: 3,
        explanation: "An empty dependency array makes useEffect run only once after the component mounts, similar to componentDidMount."
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: "What is the primary purpose of React Context?",
        options: [
          { id: 'a', text: "To replace all component state", isCorrect: false },
          { id: 'b', text: "To avoid prop drilling and share data across component tree", isCorrect: true },
          { id: 'c', text: "To handle HTTP requests", isCorrect: false },
          { id: 'd', text: "To manage component lifecycle", isCorrect: false }
        ],
        points: 3,
        explanation: "Context provides a way to share data across the component tree without having to pass props down manually at every level."
      },
      {
        id: 'q3',
        type: 'short_answer',
        question: "Explain the difference between useMemo and useCallback hooks.",
        sampleAnswer: "useMemo memoizes computed values, useCallback memoizes functions to prevent unnecessary re-renders",
        points: 4,
        maxLength: 150
      }
    ]
  },
  {
    title: "Module 4: Node.js and Backend Development",
    description: "Server-side development concepts with Node.js and Express.",
    instructions: "Focus on backend architecture, APIs, and server-side concepts.",
    timeLimit: 25,
    maxAttempts: 3,
    passingScore: 75,
    status: 'published',
    difficulty: 2,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: "What is Express.js in the Node.js ecosystem?",
        options: [
          { id: 'a', text: "A database management system", isCorrect: false },
          { id: 'b', text: "A web application framework for Node.js", isCorrect: true },
          { id: 'c', text: "A frontend JavaScript library", isCorrect: false },
          { id: 'd', text: "A CSS preprocessing tool", isCorrect: false }
        ],
        points: 2,
        explanation: "Express.js is a minimal and flexible Node.js web application framework providing robust features for web and mobile applications."
      },
      {
        id: 'q2',
        type: 'multiple_select',
        question: "Which HTTP methods are commonly used in RESTful APIs? (Select all that apply)",
        options: [
          { id: 'a', text: "GET", isCorrect: true },
          { id: 'b', text: "POST", isCorrect: true },
          { id: 'c', text: "PUT", isCorrect: true },
          { id: 'd', text: "DELETE", isCorrect: true },
          { id: 'e', text: "SEND", isCorrect: false }
        ],
        points: 4,
        explanation: "GET, POST, PUT, and DELETE are the primary HTTP methods used in RESTful API design."
      },
      {
        id: 'q3',
        type: 'true_false',
        question: "Node.js is single-threaded and uses an event-driven, non-blocking I/O model.",
        correctAnswer: 'true',
        points: 2,
        explanation: "Node.js uses a single-threaded event loop with non-blocking I/O operations, making it efficient for I/O-intensive applications."
      }
    ]
  },
  {
    title: "Module 5: Database Integration and APIs",
    description: "Database connections, API design, and data management concepts.",
    instructions: "Test your knowledge of database integration and API development.",
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 70,
    status: 'published',
    difficulty: 2,
    questions: [
      {
        id: 'q1',
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