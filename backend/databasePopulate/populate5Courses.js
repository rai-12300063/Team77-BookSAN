/**
 * Populate 5 Comprehensive Courses Script
 * Creates 5 complete courses with modules, content, and quizzes
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const connectDB = require('../config/db');

dotenv.config();

const comprehensiveCourses = [
  {
    title: "Full-Stack Web Development Mastery",
    code: "WEB001",
    description: "Master modern web development with React, Node.js, and MongoDB. Build production-ready applications from scratch.",
    category: "Web Development",
    difficulty: "Intermediate",
    estimatedCompletionTime: 120,
    duration: { weeks: 12, hoursPerWeek: 10 },
    creditPoints: 6,
    faculty: "Computer Science",
    school: "Technology",
    instructor: {
          id: new mongoose.Types.ObjectId(),
          name: "Dr. Alex Johnson",
          email: "alex.johnson@university.edu",
          title: "Senior Full-Stack Developer"
        },
    prerequisites: ["Basic JavaScript", "HTML/CSS"],
    learningObjectives: [
      "Build complete web applications using modern frameworks",
      "Implement secure user authentication and authorization",
      "Design and develop RESTful APIs",
      "Deploy applications to cloud platforms",
      "Apply best practices in code organization and testing"
    ],
    modules: [
      {
        title: "Frontend Fundamentals with React",
        description: "Master React components, hooks, and state management",
        week: 1,
        duration: 10,
        topics: ["Components", "JSX", "Hooks", "State Management", "Routing"]
      },
      {
        title: "Backend Development with Node.js",
        description: "Build robust server-side applications with Express",
        week: 2,
        duration: 10,
        topics: ["Express.js", "Middleware", "Authentication", "Error Handling", "Security"]
      },
      {
        title: "Database Design and Integration",
        description: "Work with MongoDB and Mongoose for data persistence",
        week: 3,
        duration: 10,
        topics: ["MongoDB", "Mongoose", "Schema Design", "Queries", "Aggregation"]
      },
      {
        title: "API Development and Testing",
        description: "Create and test RESTful APIs with comprehensive documentation",
        week: 4,
        duration: 10,
        topics: ["REST APIs", "Testing", "Documentation", "Postman", "Error Handling"]
      },
      {
        title: "Deployment and DevOps",
        description: "Deploy applications using modern DevOps practices",
        week: 5,
        duration: 10,
        topics: ["Docker", "CI/CD", "Cloud Deployment", "Monitoring", "Performance"]
      }
    ]
  },
  {
    title: "Data Science and Machine Learning",
    code: "DS001", 
    description: "Learn data analysis, visualization, and machine learning using Python and popular libraries.",
    category: "Data Science",
    difficulty: "Advanced",
    estimatedCompletionTime: 150,
    duration: { weeks: 15, hoursPerWeek: 10 },
    creditPoints: 8,
    faculty: "Mathematics and Statistics",
    school: "Data Science",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Sarah Chen",
      email: "sarah.chen@university.edu", 
      title: "Data Science Professor"
    },
    prerequisites: ["Python Programming", "Statistics", "Linear Algebra"],
    learningObjectives: [
      "Perform exploratory data analysis on real datasets",
      "Build and evaluate machine learning models",
      "Create compelling data visualizations",
      "Deploy ML models to production",
      "Apply statistical methods to solve business problems"
    ],
    modules: [
      {
        title: "Data Analysis with Pandas",
        description: "Master data manipulation and analysis using Pandas",
        week: 1,
        duration: 10,
        topics: ["DataFrames", "Data Cleaning", "Aggregation", "Merging", "Time Series"]
      },
      {
        title: "Data Visualization with Matplotlib & Seaborn", 
        description: "Create professional visualizations for data insights",
        week: 2,
        duration: 10,
        topics: ["Matplotlib", "Seaborn", "Interactive Plots", "Statistical Plots", "Dashboard"]
      },
      {
        title: "Machine Learning Fundamentals",
        description: "Build your first ML models with scikit-learn",
        week: 3,
        duration: 10,
        topics: ["Supervised Learning", "Unsupervised Learning", "Model Selection", "Cross-validation", "Metrics"]
      },
      {
        title: "Deep Learning with TensorFlow",
        description: "Advanced neural networks for complex problems",
        week: 4,
        duration: 10,
        topics: ["Neural Networks", "CNN", "RNN", "Transfer Learning", "Model Optimization"]
      },
      {
        title: "ML Operations and Deployment",
        description: "Deploy and monitor ML models in production",
        week: 5,
        duration: 10,
        topics: ["MLOps", "Model Deployment", "Monitoring", "A/B Testing", "Version Control"]
      }
    ]
  },
  {
    title: "Mobile App Development with React Native",
    code: "MOB001",
    description: "Build cross-platform mobile applications using React Native and modern mobile development practices.",
    category: "Mobile Development", 
    difficulty: "Intermediate",
    estimatedCompletionTime: 100,
    duration: { weeks: 10, hoursPerWeek: 10 },
    creditPoints: 6,
    faculty: "Computer Science",
    school: "Mobile Development",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Prof. Maria Rodriguez",
      email: "maria.rodriguez@university.edu",
      title: "Mobile Development Expert"
    },
    prerequisites: ["JavaScript", "React Basics"],
    learningObjectives: [
      "Develop cross-platform mobile applications",
      "Implement native device features",
      "Design responsive mobile user interfaces", 
      "Integrate with backend APIs and databases",
      "Publish apps to app stores"
    ],
    modules: [
      {
        title: "React Native Fundamentals",
        description: "Get started with React Native development environment",
        week: 1,
        duration: 10,
        topics: ["Setup", "Components", "Navigation", "Styling", "State Management"]
      },
      {
        title: "User Interface and User Experience",
        description: "Design beautiful and intuitive mobile interfaces",
        week: 2,
        duration: 10,
        topics: ["UI Components", "Styling", "Animations", "Gestures", "Accessibility"]
      },
      {
        title: "Device Features and APIs",
        description: "Access native device capabilities",
        week: 3,
        duration: 10,
        topics: ["Camera", "Location", "Push Notifications", "Storage", "Sensors"]
      },
      {
        title: "Data Management and Networking",
        description: "Handle data persistence and API integration",
        week: 4,
        duration: 10,
        topics: ["AsyncStorage", "API Integration", "Offline Support", "Caching", "Security"]
      },
      {
        title: "Testing and App Store Deployment",
        description: "Test thoroughly and publish to app stores",
        week: 5,
        duration: 10,
        topics: ["Unit Testing", "E2E Testing", "Performance", "App Store", "Google Play"]
      }
    ]
  },
  {
    title: "Cloud Computing and DevOps Engineering",
    code: "CLOUD001",
    description: "Master cloud platforms, containerization, and DevOps practices for modern software deployment.",
    category: "Cloud Computing",
    difficulty: "Advanced",
    estimatedCompletionTime: 130,
    duration: { weeks: 13, hoursPerWeek: 10 },
    creditPoints: 7,
    faculty: "Information Technology",
    school: "Cloud Engineering",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Michael Brown",
      email: "michael.brown@university.edu",
      title: "Cloud Architecture Specialist"
    },
    prerequisites: ["Linux Basics", "Networking", "Programming Experience"],
    learningObjectives: [
      "Design and implement cloud-native applications",
      "Master containerization with Docker and Kubernetes",
      "Implement CI/CD pipelines for automated deployment",
      "Manage cloud infrastructure as code",
      "Ensure security and compliance in cloud environments"
    ],
    modules: [
      {
        title: "Cloud Fundamentals and AWS",
        description: "Introduction to cloud computing concepts and AWS services",
        week: 1,
        duration: 10,
        topics: ["Cloud Models", "AWS Services", "EC2", "S3", "VPC"]
      },
      {
        title: "Containerization with Docker",
        description: "Package applications using Docker containers",
        week: 2,
        duration: 10,
        topics: ["Docker Basics", "Images", "Containers", "Docker Compose", "Registry"]
      },
      {
        title: "Kubernetes Orchestration",
        description: "Manage containerized applications at scale",
        week: 3,
        duration: 10,
        topics: ["Kubernetes Architecture", "Pods", "Services", "Deployments", "Ingress"]
      },
      {
        title: "CI/CD and Infrastructure as Code",
        description: "Automate deployment and infrastructure management",
        week: 4,
        duration: 10,
        topics: ["Jenkins", "GitLab CI", "Terraform", "Ansible", "CloudFormation"]
      },
      {
        title: "Monitoring and Security",
        description: "Ensure application performance and security",
        week: 5,
        duration: 10,
        topics: ["Monitoring", "Logging", "Security", "Compliance", "Cost Optimization"]
      }
    ]
  },
  {
    title: "Cybersecurity and Ethical Hacking",
    code: "SEC001",
    description: "Learn to protect systems and networks from cyber threats through hands-on security testing.",
    category: "Cybersecurity",
    difficulty: "Advanced", 
    estimatedCompletionTime: 140,
    duration: { weeks: 14, hoursPerWeek: 10 },
    creditPoints: 8,
    faculty: "Information Security",
    school: "Cybersecurity",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Jennifer White",
      email: "jennifer.white@university.edu",
      title: "Cybersecurity Expert"
    },
    prerequisites: ["Networking", "Operating Systems", "Programming"],
    learningObjectives: [
      "Identify and assess security vulnerabilities",
      "Perform ethical penetration testing",
      "Implement security controls and countermeasures",
      "Analyze malware and incident response",
      "Understand legal and ethical aspects of cybersecurity"
    ],
    modules: [
      {
        title: "Security Fundamentals and Risk Assessment",
        description: "Foundation of cybersecurity principles and risk management",
        week: 1,
        duration: 10,
        topics: ["CIA Triad", "Risk Assessment", "Threat Modeling", "Compliance", "Frameworks"]
      },
      {
        title: "Network Security and Penetration Testing",
        description: "Secure networks and perform ethical hacking",
        week: 2,
        duration: 10,
        topics: ["Network Scanning", "Vulnerability Assessment", "Penetration Testing", "Firewalls", "IDS/IPS"]
      },
      {
        title: "Web Application Security",
        description: "Identify and exploit web application vulnerabilities",
        week: 3,
        duration: 10,
        topics: ["OWASP Top 10", "SQL Injection", "XSS", "CSRF", "Security Testing"]
      },
      {
        title: "Malware Analysis and Incident Response",
        description: "Analyze threats and respond to security incidents",
        week: 4,
        duration: 10,
        topics: ["Malware Analysis", "Forensics", "Incident Response", "Threat Hunting", "Recovery"]
      },
      {
        title: "Advanced Topics and Ethics",
        description: "Cutting-edge security topics and ethical considerations",
        week: 5,
        duration: 10,
        topics: ["AI Security", "IoT Security", "Legal Issues", "Ethics", "Career Paths"]
      }
    ]
  }
];

async function populate5Courses() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🧹 Clearing existing courses and modules...');
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    
    let totalModulesCreated = 0;
    let totalQuizzesCreated = 0;
    
    for (const courseData of comprehensiveCourses) {
      console.log(`\n📚 Creating course: ${courseData.title}`);
      
      // Create course
      const course = new Course({
        title: courseData.title,
        code: courseData.code,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty,
        estimatedCompletionTime: courseData.estimatedCompletionTime,
        duration: courseData.duration,
        creditPoints: courseData.creditPoints,
        faculty: courseData.faculty,
        school: courseData.school,
        instructor: courseData.instructor,
        prerequisites: courseData.prerequisites,
        learningObjectives: courseData.learningObjectives,
        rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
        ratingCount: Math.floor(Math.random() * 500) + 100,
        enrollmentCount: Math.floor(Math.random() * 1000) + 200
      });
      
      await course.save();
      console.log(`✅ Created course: ${course.title} (ID: ${course._id})`);
      
      // Create modules for this course
      const moduleIds = [];
      for (let i = 0; i < courseData.modules.length; i++) {
        const moduleData = courseData.modules[i];
        
        const module = new Module({
          courseId: course._id,
          moduleNumber: i + 1,
          title: moduleData.title,
          description: moduleData.description,
          week: moduleData.week,
          estimatedDuration: moduleData.duration,
          topics: moduleData.topics,
          learningObjectives: [
            `Master ${moduleData.title.toLowerCase()}`,
            'Apply concepts through practical exercises',
            'Complete hands-on projects and assignments'
          ],
          difficulty: course.difficulty,
          isPublished: true,
          createdBy: course.instructor.id
        });
        
        await module.save();
        moduleIds.push(module._id);
        totalModulesCreated++;
        
        console.log(`  ✅ Created module: ${module.title} (Week ${module.week})`);
        
        // Create a quiz for each module
        const quiz = new Quiz({
          title: `${moduleData.title} - Assessment`,
          description: `Test your knowledge of ${moduleData.title}`,
          courseId: course._id,
          moduleId: module._id,
          createdBy: new mongoose.Types.ObjectId(),
          instructions: `This quiz covers the key concepts from ${moduleData.title}. Take your time and review the material if needed.`,
          timeLimit: 20,
          maxAttempts: 3,
          passingScore: 70,
          status: 'published',
          difficulty: course.difficulty === 'Beginner' ? 1 : course.difficulty === 'Intermediate' ? 2 : 3,
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: `What is the main focus of ${moduleData.title}?`,
              options: [
                { id: 'a', text: 'Basic concepts only', isCorrect: false },
                { id: 'b', text: 'Practical implementation and theory', isCorrect: true },
                { id: 'c', text: 'Historical background', isCorrect: false },
                { id: 'd', text: 'Future predictions', isCorrect: false }
              ],
              points: 2,
              explanation: `${moduleData.title} focuses on both theoretical understanding and practical implementation.`
            },
            {
              id: 'q2',
              type: 'true_false',
              question: `${moduleData.title} includes hands-on exercises.`,
              correctAnswer: true,
              points: 1,
              explanation: 'All modules include practical exercises to reinforce learning.'
            }
          ]
        });
        
        await quiz.save();
        totalQuizzesCreated++;
        console.log(`    ✅ Created quiz: ${quiz.title}`);
      }
      
      // Update course with module references
      course.syllabus = moduleIds;
      await course.save();
      console.log(`✅ Updated course with ${moduleIds.length} modules`);
    }
    
    console.log('\n🎉 5-Course Database Population Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`Total courses created: ${comprehensiveCourses.length}`);
    console.log(`Total modules created: ${totalModulesCreated}`);
    console.log(`Total quizzes created: ${totalQuizzesCreated}`);
    console.log(`Average modules per course: ${Math.round(totalModulesCreated / comprehensiveCourses.length)}`);
    
    // Now populate modules with content
    console.log('\n📝 Populating modules with rich content...');
    const { updateModulesWithSimpleContent } = require('./simpleModuleUpdate');
    await updateModulesWithSimpleContent();
    
    console.log('\n✅ Complete 5-course population finished!');
    
  } catch (error) {
    console.error('❌ Error populating 5 courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  populate5Courses();
}

module.exports = { populate5Courses };