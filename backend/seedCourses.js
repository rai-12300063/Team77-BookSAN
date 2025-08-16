const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();

const sampleCourses = [
  {
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming, including variables, functions, loops, and DOM manipulation. Perfect for beginners who want to start their web development journey.",
    category: "Programming",
    difficulty: "Beginner",
    estimatedCompletionTime: 20,
    duration: {
      weeks: 4,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com"
    },
    syllabus: [
      {
        moduleTitle: "Getting Started with JavaScript",
        topics: ["Introduction to JavaScript", "Setting up development environment", "Writing your first script"],
        estimatedHours: 3
      },
      {
        moduleTitle: "Variables and Data Types",
        topics: ["Primitive data types", "Variable declaration", "Type conversion"],
        estimatedHours: 4
      },
      {
        moduleTitle: "Functions and Scope",
        topics: ["Creating and calling functions", "Function parameters", "Variable scope"],
        estimatedHours: 5
      },
      {
        moduleTitle: "Control Structures",
        topics: ["If/else statements", "For and while loops", "Logical operators"],
        estimatedHours: 4
      },
      {
        moduleTitle: "DOM Manipulation",
        topics: ["Selecting DOM elements", "Modifying element content", "Handling user events"],
        estimatedHours: 4
      }
    ],
    prerequisites: [],
    learningObjectives: [
      "Understand JavaScript fundamentals",
      "Work with variables and data types",
      "Create and use functions",
      "Implement control flow",
      "Manipulate DOM elements"
    ],
    rating: 4.7,
    ratingCount: 1245
  },
  {
    title: "React Frontend Development",
    description: "Build modern, interactive web applications using React. Learn components, state management, hooks, and best practices for frontend development.",
    category: "Programming",
    difficulty: "Intermediate",
    estimatedCompletionTime: 35,
    duration: {
      weeks: 7,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Michael Chen",
      email: "michael.chen@example.com"
    },
    syllabus: [
      {
        moduleTitle: "React Fundamentals",
        topics: ["React concepts", "Functional components", "JSX syntax"],
        estimatedHours: 6
      },
      {
        moduleTitle: "State and Props",
        topics: ["Component state", "Props between components", "State updates"],
        estimatedHours: 5
      },
      {
        moduleTitle: "React Hooks",
        topics: ["useState hook", "useEffect implementation", "Custom hooks"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Routing and Navigation",
        topics: ["React Router setup", "Dynamic routes", "Navigation implementation"],
        estimatedHours: 4
      },
      {
        moduleTitle: "State Management",
        topics: ["Context API", "Global state", "State management libraries"],
        estimatedHours: 6
      }
    ],
    prerequisites: ["JavaScript", "HTML", "CSS"],
    learningObjectives: [
      "Master React component architecture",
      "Implement state management",
      "Use React hooks effectively",
      "Build routing in React apps",
      "Apply React best practices"
    ],
    rating: 4.8,
    ratingCount: 892
  },
  {
    title: "Data Science with Python",
    description: "Dive into data science using Python. Learn data analysis, visualization, machine learning basics, and how to work with popular libraries like Pandas and NumPy.",
    category: "Data Science",
    difficulty: "Intermediate",
    estimatedCompletionTime: 40,
    duration: {
      weeks: 8,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Emma Rodriguez",
      email: "emma.rodriguez@example.com"
    },
    syllabus: [
      {
        moduleTitle: "Python for Data Science",
        topics: ["Python basics review", "Essential libraries", "Development environment"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Data Manipulation with Pandas",
        topics: ["DataFrames", "Data cleaning", "Data transformations"],
        estimatedHours: 8
      },
      {
        moduleTitle: "Data Visualization",
        topics: ["Matplotlib basics", "Seaborn visualizations", "Interactive charts"],
        estimatedHours: 7
      },
      {
        moduleTitle: "Statistical Analysis",
        topics: ["Descriptive statistics", "Hypothesis testing", "Correlation analysis"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Machine Learning Basics",
        topics: ["ML concepts", "Basic algorithms", "Model evaluation"],
        estimatedHours: 8
      }
    ],
    prerequisites: ["Basic Python", "Mathematics"],
    learningObjectives: [
      "Master Python for data science",
      "Perform data analysis with Pandas",
      "Create data visualizations",
      "Apply statistical methods",
      "Understand machine learning fundamentals"
    ],
    rating: 4.6,
    ratingCount: 567
  },
  {
    title: "Digital Marketing Fundamentals",
    description: "Master the essentials of digital marketing including SEO, social media marketing, content strategy, and analytics to grow your online presence.",
    category: "Marketing",
    difficulty: "Beginner",
    estimatedCompletionTime: 25,
    duration: {
      weeks: 5,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Lisa Thompson",
      email: "lisa.thompson@example.com"
    },
    syllabus: [
      {
        moduleTitle: "Digital Marketing Overview",
        topics: ["Digital marketing ecosystem", "Key terminology", "Marketing channels"],
        estimatedHours: 4
      },
      {
        moduleTitle: "Search Engine Optimization (SEO)",
        topics: ["Keyword research", "On-page optimization", "Link building strategies"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Social Media Marketing",
        topics: ["Platform-specific strategies", "Content creation", "Community management"],
        estimatedHours: 5
      },
      {
        moduleTitle: "Content Marketing",
        topics: ["Content strategy development", "Creation best practices", "Content distribution"],
        estimatedHours: 5
      },
      {
        moduleTitle: "Analytics and Measurement",
        topics: ["Analytics tools setup", "Marketing metrics", "Campaign optimization"],
        estimatedHours: 5
      }
    ],
    prerequisites: [],
    learningObjectives: [
      "Understand digital marketing landscape",
      "Implement SEO strategies",
      "Create social media campaigns",
      "Develop content marketing plans",
      "Measure marketing performance"
    ],
    rating: 4.5,
    ratingCount: 734
  },
  {
    title: "UI/UX Design Principles",
    description: "Learn the fundamentals of user interface and user experience design. Create intuitive, beautiful, and user-friendly digital products.",
    category: "Design",
    difficulty: "Beginner",
    estimatedCompletionTime: 30,
    duration: {
      weeks: 6,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Alex Park",
      email: "alex.park@example.com"
    },
    syllabus: [
      {
        moduleTitle: "Introduction to UX Design",
        topics: ["UX design fundamentals", "Design thinking process", "User research basics"],
        estimatedHours: 5
      },
      {
        moduleTitle: "User Research and Personas",
        topics: ["User interviews", "User personas", "User behavior analysis"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Information Architecture",
        topics: ["Site maps", "User flows", "Information hierarchy"],
        estimatedHours: 5
      },
      {
        moduleTitle: "Wireframing and Prototyping",
        topics: ["Creating wireframes", "Building prototypes", "Testing design concepts"],
        estimatedHours: 6
      },
      {
        moduleTitle: "Visual Design and Interfaces",
        topics: ["Color theory and typography", "Layout and composition", "Design systems"],
        estimatedHours: 8
      }
    ],
    prerequisites: [],
    learningObjectives: [
      "Master UX design principles",
      "Conduct user research",
      "Create information architecture",
      "Build wireframes and prototypes",
      "Apply visual design principles"
    ],
    rating: 4.7,
    ratingCount: 445
  },
  {
    title: "Machine Learning with TensorFlow",
    description: "Dive deep into machine learning using TensorFlow. Learn neural networks, deep learning, and how to build AI applications.",
    category: "Data Science",
    difficulty: "Advanced",
    estimatedCompletionTime: 50,
    duration: {
      weeks: 10,
      hoursPerWeek: 5
    },
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Robert Kim",
      email: "robert.kim@example.com"
    },
    syllabus: [
      {
        moduleTitle: "Machine Learning Foundations",
        topics: ["ML fundamentals review", "TensorFlow setup", "Basic tensor operations"],
        estimatedHours: 7
      },
      {
        moduleTitle: "Neural Networks Basics",
        topics: ["Neural network architecture", "Forward and backpropagation", "Building basic networks"],
        estimatedHours: 8
      },
      {
        moduleTitle: "Deep Learning Architectures",
        topics: ["Convolutional Neural Networks", "Recurrent Neural Networks", "Advanced architectures"],
        estimatedHours: 9
      },
      {
        moduleTitle: "Model Training and Optimization",
        topics: ["Optimization algorithms", "Regularization techniques", "Hyperparameter tuning"],
        estimatedHours: 8
      },
      {
        moduleTitle: "Production Deployment",
        topics: ["Model deployment strategies", "Serving models", "Monitoring and maintenance"],
        estimatedHours: 6
      }
    ],
    prerequisites: ["Python", "Machine Learning Basics", "Linear Algebra"],
    learningObjectives: [
      "Master TensorFlow framework",
      "Build neural networks",
      "Implement deep learning models",
      "Optimize model performance",
      "Deploy models to production"
    ],
    rating: 4.8,
    ratingCount: 298
  }
];

const seedCourses = async () => {
  try {
    await connectDB();
    
    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');
    
    // Insert sample courses
    await Course.insertMany(sampleCourses);
    console.log('Sample courses inserted successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
