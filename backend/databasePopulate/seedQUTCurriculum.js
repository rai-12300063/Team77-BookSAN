/**
 * QUT Curriculum-Based Course and Module Seeding
 * Based on QUT Information Systems and Technology units
 * Unit: IFN636 - Web Development Frameworks
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Module = require('./models/Module');
const connectDB = require('./config/db');

dotenv.config();

const qutCurriculum = [
  {
    title: "IFN636 - Web Development Frameworks",
    code: "IFN636",
    description: "This unit provides students with advanced knowledge and practical skills in modern web development frameworks. Students will learn to design, develop, and deploy scalable web applications using industry-standard frameworks and best practices.",
    category: "Web Development",
    difficulty: "Advanced",
    estimatedCompletionTime: 150, // 13 weeks * 12 hours per week
    duration: {
      weeks: 13,
      hoursPerWeek: 12
    },
    creditPoints: 6,
    faculty: "Science and Engineering",
    school: "Computer Science",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Sarah Williams",
      email: "sarah.williams@qut.edu.au",
      title: "Senior Lecturer"
    },
    prerequisites: ["IFN563 - Object Oriented Design", "IFN505 - Database Systems"],
    learningObjectives: [
      "Analyze and evaluate modern web development frameworks and their architectural patterns",
      "Design and implement scalable web applications using React.js and Node.js",
      "Apply advanced JavaScript concepts including ES6+, async programming, and state management",
      "Implement secure authentication and authorization systems",
      "Design and develop RESTful APIs and GraphQL endpoints",
      "Apply testing strategies including unit, integration, and end-to-end testing",
      "Demonstrate proficiency in version control, CI/CD, and deployment strategies"
    ],
    assessments: [
      {
        name: "Assignment 1 - Frontend Framework Analysis",
        weight: 25,
        type: "Individual",
        description: "Critical analysis and comparison of modern frontend frameworks"
      },
      {
        name: "Assignment 2 - Full-Stack Web Application",
        weight: 45,
        type: "Group",
        description: "Development of a complete web application with React frontend and Node.js backend"
      },
      {
        name: "Final Examination",
        weight: 30,
        type: "Individual",
        description: "Comprehensive examination covering theoretical and practical aspects"
      }
    ],
    rating: 4.6,
    ratingCount: 284,
    modules: [
      {
        title: "Module 1: Modern Web Development Landscape",
        description: "Introduction to modern web development ecosystem, frameworks, and architectural patterns",
        week: 1,
        duration: 12,
        learningObjectives: [
          "Understand the evolution of web development",
          "Compare different framework architectures",
          "Analyze the JavaScript ecosystem"
        ],
        topics: [
          "Evolution of web development",
          "Frontend vs Backend frameworks",
          "JavaScript ecosystem overview",
          "NPM and package management",
          "Build tools and bundlers"
        ],
        contents: [
          {
            type: 'video',
            title: 'Web Development Evolution',
            description: 'Historical perspective and current trends',
            duration: 45
          },
          {
            type: 'text',
            title: 'Framework Comparison Guide',
            description: 'Detailed comparison of popular frameworks',
            duration: 60
          },
          {
            type: 'interactive',
            title: 'Ecosystem Exploration Lab',
            description: 'Hands-on exploration of the JavaScript ecosystem',
            duration: 90
          },
          {
            type: 'quiz',
            title: 'Module 1 Assessment',
            description: 'Knowledge check on web development landscape',
            duration: 15
          }
        ]
      },
      {
        title: "Module 2: React.js Fundamentals",
        description: "Core concepts of React including components, JSX, props, and state management",
        week: 2,
        duration: 12,
        learningObjectives: [
          "Master React component architecture",
          "Implement state management with hooks",
          "Handle events and user interactions"
        ],
        topics: [
          "React component lifecycle",
          "JSX syntax and templating",
          "Props and component communication",
          "State management with useState",
          "Event handling patterns"
        ],
        contents: [
          {
            type: 'video',
            title: 'React Components Deep Dive',
            description: 'Understanding component architecture and lifecycle',
            duration: 50
          },
          {
            type: 'assignment',
            title: 'Component Building Exercise',
            description: 'Create reusable React components',
            duration: 120
          },
          {
            type: 'interactive',
            title: 'State Management Lab',
            description: 'Practical exercises with React hooks',
            duration: 75
          },
          {
            type: 'quiz',
            title: 'React Fundamentals Quiz',
            description: 'Assessment of React core concepts',
            duration: 15
          }
        ]
      },
      {
        title: "Module 3: Advanced React Patterns",
        description: "Advanced React concepts including hooks, context API, and performance optimization",
        week: 3,
        duration: 12,
        learningObjectives: [
          "Implement advanced React hooks",
          "Use Context API for global state",
          "Apply performance optimization techniques"
        ],
        topics: [
          "Custom hooks development",
          "Context API and global state",
          "useEffect and side effects",
          "Performance optimization",
          "Code splitting and lazy loading"
        ],
        contents: [
          {
            type: 'video',
            title: 'Advanced Hooks Masterclass',
            description: 'Custom hooks and advanced patterns',
            duration: 55
          },
          {
            type: 'text',
            title: 'Context API Best Practices',
            description: 'Guide to effective global state management',
            duration: 40
          },
          {
            type: 'assignment',
            title: 'Performance Optimization Challenge',
            description: 'Optimize a React application for performance',
            duration: 100
          },
          {
            type: 'quiz',
            title: 'Advanced React Assessment',
            description: 'Test understanding of advanced concepts',
            duration: 15
          }
        ]
      },
      {
        title: "Module 4: Node.js and Express.js Backend",
        description: "Server-side development with Node.js, Express.js, and middleware implementation",
        week: 4,
        duration: 12,
        learningObjectives: [
          "Build RESTful APIs with Express.js",
          "Implement middleware for cross-cutting concerns",
          "Handle asynchronous operations effectively"
        ],
        topics: [
          "Node.js runtime environment",
          "Express.js framework basics",
          "Middleware patterns",
          "Routing and request handling",
          "Error handling strategies"
        ],
        contents: [
          {
            type: 'video',
            title: 'Node.js and Express Foundations',
            description: 'Building server-side applications',
            duration: 60
          },
          {
            type: 'assignment',
            title: 'API Development Project',
            description: 'Create a comprehensive REST API',
            duration: 120
          },
          {
            type: 'interactive',
            title: 'Middleware Workshop',
            description: 'Hands-on middleware implementation',
            duration: 80
          },
          {
            type: 'quiz',
            title: 'Backend Development Quiz',
            description: 'Node.js and Express assessment',
            duration: 15
          }
        ]
      },
      {
        title: "Module 5: Database Integration and Data Modeling",
        description: "Database design, MongoDB integration, and data modeling best practices",
        week: 5,
        duration: 12,
        learningObjectives: [
          "Design effective database schemas",
          "Implement database operations with Mongoose",
          "Apply data validation and security measures"
        ],
        topics: [
          "NoSQL vs SQL databases",
          "MongoDB and Mongoose ODM",
          "Schema design patterns",
          "Data validation and sanitization",
          "Database security considerations"
        ],
        contents: [
          {
            type: 'video',
            title: 'Database Design Principles',
            description: 'Effective schema design for web applications',
            duration: 45
          },
          {
            type: 'text',
            title: 'Mongoose Modeling Guide',
            description: 'Comprehensive guide to Mongoose schemas',
            duration: 50
          },
          {
            type: 'assignment',
            title: 'Database Integration Project',
            description: 'Integrate MongoDB with Express application',
            duration: 110
          },
          {
            type: 'quiz',
            title: 'Database Integration Assessment',
            description: 'Test database modeling knowledge',
            duration: 15
          }
        ]
      },
      {
        title: "Module 6: Authentication and Authorization",
        description: "Implementing secure user authentication, authorization, and session management",
        week: 6,
        duration: 12,
        learningObjectives: [
          "Implement JWT-based authentication",
          "Design role-based authorization systems",
          "Apply security best practices"
        ],
        topics: [
          "Authentication vs Authorization",
          "JWT tokens and session management",
          "Password hashing and security",
          "Role-based access control",
          "OAuth and third-party authentication"
        ],
        contents: [
          {
            type: 'video',
            title: 'Web Security Fundamentals',
            description: 'Understanding authentication and authorization',
            duration: 50
          },
          {
            type: 'assignment',
            title: 'Security Implementation Project',
            description: 'Build secure authentication system',
            duration: 130
          },
          {
            type: 'interactive',
            title: 'Security Testing Lab',
            description: 'Test and validate security implementations',
            duration: 70
          },
          {
            type: 'quiz',
            title: 'Security Assessment',
            description: 'Evaluate security knowledge',
            duration: 15
          }
        ]
      },
      {
        title: "Module 7: State Management and Data Flow",
        description: "Advanced state management patterns using Redux, Context API, and data flow architectures",
        week: 7,
        duration: 12,
        learningObjectives: [
          "Implement Redux for complex state management",
          "Design efficient data flow patterns",
          "Handle asynchronous state updates"
        ],
        topics: [
          "Redux architecture and patterns",
          "Actions, reducers, and store",
          "Middleware and side effects",
          "Context API vs Redux",
          "State normalization strategies"
        ],
        contents: [
          {
            type: 'video',
            title: 'State Management Architecture',
            description: 'Designing scalable state management',
            duration: 55
          },
          {
            type: 'assignment',
            title: 'Redux Implementation Challenge',
            description: 'Implement complex state management',
            duration: 125
          },
          {
            type: 'interactive',
            title: 'Data Flow Workshop',
            description: 'Practice with different data flow patterns',
            duration: 75
          },
          {
            type: 'quiz',
            title: 'State Management Quiz',
            description: 'Test state management understanding',
            duration: 15
          }
        ]
      },
      {
        title: "Module 8: API Design and Integration",
        description: "RESTful API design, GraphQL, and third-party service integration",
        week: 8,
        duration: 12,
        learningObjectives: [
          "Design RESTful APIs following best practices",
          "Implement GraphQL queries and mutations",
          "Integrate with external APIs and services"
        ],
        topics: [
          "REST API design principles",
          "GraphQL vs REST comparison",
          "API documentation with Swagger",
          "Rate limiting and caching",
          "Third-party API integration"
        ],
        contents: [
          {
            type: 'video',
            title: 'API Design Best Practices',
            description: 'Creating robust and scalable APIs',
            duration: 60
          },
          {
            type: 'assignment',
            title: 'API Development Project',
            description: 'Build comprehensive API with documentation',
            duration: 115
          },
          {
            type: 'text',
            title: 'GraphQL Implementation Guide',
            description: 'Practical guide to GraphQL development',
            duration: 45
          },
          {
            type: 'quiz',
            title: 'API Design Assessment',
            description: 'Evaluate API design knowledge',
            duration: 15
          }
        ]
      },
      {
        title: "Module 9: Testing Strategies and Implementation",
        description: "Comprehensive testing including unit, integration, and end-to-end testing",
        week: 9,
        duration: 12,
        learningObjectives: [
          "Implement unit testing with Jest",
          "Create integration tests for APIs",
          "Develop end-to-end testing strategies"
        ],
        topics: [
          "Testing pyramid and strategies",
          "Unit testing with Jest and React Testing Library",
          "API testing with Supertest",
          "End-to-end testing with Cypress",
          "Test-driven development (TDD)"
        ],
        contents: [
          {
            type: 'video',
            title: 'Testing Strategies Overview',
            description: 'Comprehensive approach to web application testing',
            duration: 50
          },
          {
            type: 'assignment',
            title: 'Testing Implementation Project',
            description: 'Implement comprehensive test suite',
            duration: 120
          },
          {
            type: 'interactive',
            title: 'TDD Workshop',
            description: 'Practice test-driven development',
            duration: 80
          },
          {
            type: 'quiz',
            title: 'Testing Knowledge Assessment',
            description: 'Test understanding of testing strategies',
            duration: 15
          }
        ]
      },
      {
        title: "Module 10: Performance Optimization and Monitoring",
        description: "Web application performance optimization, monitoring, and debugging techniques",
        week: 10,
        duration: 12,
        learningObjectives: [
          "Identify and resolve performance bottlenecks",
          "Implement monitoring and logging solutions",
          "Apply optimization techniques for web applications"
        ],
        topics: [
          "Performance profiling and analysis",
          "Code splitting and lazy loading",
          "Caching strategies",
          "Monitoring and logging",
          "Error tracking and debugging"
        ],
        contents: [
          {
            type: 'video',
            title: 'Performance Optimization Techniques',
            description: 'Strategies for high-performance web applications',
            duration: 55
          },
          {
            type: 'assignment',
            title: 'Performance Optimization Challenge',
            description: 'Optimize existing application for performance',
            duration: 115
          },
          {
            type: 'interactive',
            title: 'Monitoring Setup Lab',
            description: 'Implement comprehensive monitoring solution',
            duration: 80
          },
          {
            type: 'quiz',
            title: 'Performance Assessment',
            description: 'Evaluate performance optimization knowledge',
            duration: 15
          }
        ]
      },
      {
        title: "Module 11: Deployment and DevOps Practices",
        description: "Application deployment, CI/CD pipelines, and DevOps best practices",
        week: 11,
        duration: 12,
        learningObjectives: [
          "Deploy applications to cloud platforms",
          "Implement CI/CD pipelines",
          "Apply DevOps principles and practices"
        ],
        topics: [
          "Cloud deployment strategies",
          "Containerization with Docker",
          "CI/CD pipeline setup",
          "Environment management",
          "Infrastructure as Code"
        ],
        contents: [
          {
            type: 'video',
            title: 'Modern Deployment Strategies',
            description: 'Cloud deployment and DevOps practices',
            duration: 60
          },
          {
            type: 'assignment',
            title: 'Deployment Project',
            description: 'Deploy application with CI/CD pipeline',
            duration: 120
          },
          {
            type: 'interactive',
            title: 'Docker and Containerization Lab',
            description: 'Hands-on containerization workshop',
            duration: 75
          },
          {
            type: 'quiz',
            title: 'Deployment Assessment',
            description: 'Test deployment and DevOps knowledge',
            duration: 15
          }
        ]
      },
      {
        title: "Module 12: Advanced Topics and Emerging Technologies",
        description: "Exploration of cutting-edge web technologies and future trends",
        week: 12,
        duration: 12,
        learningObjectives: [
          "Evaluate emerging web technologies",
          "Understand progressive web applications",
          "Explore microservices architecture"
        ],
        topics: [
          "Progressive Web Applications (PWA)",
          "Microservices architecture",
          "Serverless computing",
          "WebAssembly and performance",
          "Future of web development"
        ],
        contents: [
          {
            type: 'video',
            title: 'Emerging Web Technologies',
            description: 'Latest trends and future directions',
            duration: 50
          },
          {
            type: 'assignment',
            title: 'Technology Exploration Project',
            description: 'Research and present emerging technology',
            duration: 110
          },
          {
            type: 'discussion',
            title: 'Future Trends Discussion',
            description: 'Collaborative discussion on web development future',
            duration: 60
          },
          {
            type: 'quiz',
            title: 'Advanced Topics Assessment',
            description: 'Evaluate understanding of advanced concepts',
            duration: 15
          }
        ]
      },
      {
        title: "Module 13: Capstone Project and Review",
        description: "Final project integration and comprehensive review of all concepts",
        week: 13,
        duration: 12,
        learningObjectives: [
          "Integrate all learned concepts in final project",
          "Demonstrate mastery of web development frameworks",
          "Present technical solutions effectively"
        ],
        topics: [
          "Project planning and architecture",
          "Full-stack integration",
          "Code review and best practices",
          "Technical presentation skills",
          "Course reflection and next steps"
        ],
        contents: [
          {
            type: 'assignment',
            title: 'Capstone Project',
            description: 'Comprehensive full-stack web application',
            duration: 180
          },
          {
            type: 'discussion',
            title: 'Project Presentations',
            description: 'Present and review capstone projects',
            duration: 90
          },
          {
            type: 'text',
            title: 'Course Reflection Guide',
            description: 'Reflection on learning journey and future goals',
            duration: 30
          },
          {
            type: 'quiz',
            title: 'Final Comprehensive Assessment',
            description: 'Final assessment covering all course content',
            duration: 30
          }
        ]
      }
    ]
  },
  {
    title: "IFN563 - Object Oriented Design",
    code: "IFN563",
    description: "This unit introduces students to object-oriented design principles and patterns. Students will learn to analyze, design, and implement robust software systems using object-oriented methodologies.",
    category: "Programming",
    difficulty: "Intermediate",
    estimatedCompletionTime: 150,
    duration: {
      weeks: 13,
      hoursPerWeek: 12
    },
    creditPoints: 6,
    faculty: "Science and Engineering",
    school: "Computer Science",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Michael Thompson",
      email: "michael.thompson@qut.edu.au",
      title: "Associate Professor"
    },
    prerequisites: ["IFN501 - Programming Principles"],
    learningObjectives: [
      "Apply object-oriented analysis and design principles",
      "Implement design patterns in software development",
      "Create UML diagrams for system documentation",
      "Develop maintainable and extensible software systems",
      "Evaluate and refactor existing code for improved design"
    ],
    assessments: [
      {
        name: "Assignment 1 - OO Analysis and Design",
        weight: 30,
        type: "Individual",
        description: "Analysis and design of a software system using OO principles"
      },
      {
        name: "Assignment 2 - Implementation Project",
        weight: 40,
        type: "Group",
        description: "Implementation of designed system with design patterns"
      },
      {
        name: "Final Examination",
        weight: 30,
        type: "Individual",
        description: "Comprehensive examination on OO concepts and design patterns"
      }
    ],
    rating: 4.4,
    ratingCount: 312,
    modules: [
      {
        title: "Module 1: Introduction to Object-Oriented Concepts",
        description: "Fundamental concepts of object-oriented programming and design",
        week: 1,
        duration: 12,
        learningObjectives: [
          "Understand OOP fundamentals",
          "Compare procedural vs object-oriented approaches",
          "Identify objects and classes in problem domains"
        ],
        topics: [
          "Object-oriented paradigm overview",
          "Classes, objects, and instances",
          "Encapsulation principles",
          "Abstraction concepts",
          "OOP vs procedural programming"
        ]
      },
      {
        title: "Module 2: Class Design and Relationships",
        description: "Designing classes and understanding relationships between objects",
        week: 2,
        duration: 12,
        learningObjectives: [
          "Design effective class hierarchies",
          "Implement inheritance relationships",
          "Apply composition and aggregation"
        ],
        topics: [
          "Class design principles",
          "Inheritance and polymorphism",
          "Composition vs inheritance",
          "Interface design",
          "Abstract classes and methods"
        ]
      }
      // Additional modules would continue here...
    ]
  },
  {
    title: "IFN505 - Database Systems",
    code: "IFN505",
    description: "This unit covers database design, implementation, and management. Students learn relational database concepts, SQL, normalization, and modern database technologies.",
    category: "Data Science",
    difficulty: "Intermediate",
    estimatedCompletionTime: 150,
    duration: {
      weeks: 13,
      hoursPerWeek: 12
    },
    creditPoints: 6,
    faculty: "Science and Engineering",
    school: "Computer Science",
    instructor: {
      id: new mongoose.Types.ObjectId(),
      name: "Dr. Jennifer Liu",
      email: "jennifer.liu@qut.edu.au",
      title: "Senior Lecturer"
    },
    prerequisites: ["IFN501 - Programming Principles"],
    learningObjectives: [
      "Design normalized relational database schemas",
      "Write complex SQL queries for data retrieval and manipulation",
      "Implement database security and transaction management",
      "Evaluate and optimize database performance",
      "Compare different database technologies and paradigms"
    ],
    assessments: [
      {
        name: "Assignment 1 - Database Design",
        weight: 35,
        type: "Individual",
        description: "Design and implement a relational database system"
      },
      {
        name: "Assignment 2 - Advanced Database Development",
        weight: 35,
        type: "Group",
        description: "Advanced database features and optimization project"
      },
      {
        name: "Final Examination",
        weight: 30,
        type: "Individual",
        description: "Comprehensive examination on database concepts and SQL"
      }
    ],
    rating: 4.3,
    ratingCount: 298,
    modules: [
      {
        title: "Module 1: Database Fundamentals",
        description: "Introduction to database concepts and relational model",
        week: 1,
        duration: 12,
        learningObjectives: [
          "Understand database management systems",
          "Learn relational model concepts",
          "Identify data modeling requirements"
        ],
        topics: [
          "Database management system concepts",
          "Relational model theory",
          "Entity-Relationship modeling",
          "Data modeling techniques",
          "Database architecture overview"
        ]
      }
      // Additional modules would continue here...
    ]
  }
];

const seedQUTCurriculum = async () => {
  try {
    await connectDB();
    
    console.log('🎓 Starting QUT Curriculum seeding...');
    
    // Clear existing courses and modules
    await Course.deleteMany({});
    await Module.deleteMany({});
    console.log('✅ Cleared existing courses and modules');
    
    for (const courseData of qutCurriculum) {
      console.log(`\n📚 Creating course: ${courseData.title}`);
      
      // Extract modules from course data
      const moduleData = courseData.modules || [];
      delete courseData.modules;
      
      // Create the course
      const course = new Course(courseData);
      await course.save();
      console.log(`✅ Created course: ${course.title} (ID: ${course._id})`);
      
      // Create modules for this course
      const createdModules = [];
      for (let i = 0; i < moduleData.length; i++) {
        const module = moduleData[i];
        
        // Create content array if it doesn't exist
        if (!module.contents) {
          module.contents = [
            {
              contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'video',
              title: `${module.title} - Lecture`,
              description: `Main lecture content for ${module.title}`,
              duration: 60,
              order: 1,
              isRequired: true
            },
            {
              contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'text',
              title: `${module.title} - Reading Materials`,
              description: `Required readings and supplementary materials`,
              duration: 90,
              order: 2,
              isRequired: true
            },
            {
              contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'interactive',
              title: `${module.title} - Workshop`,
              description: `Hands-on workshop and practical exercises`,
              duration: 120,
              order: 3,
              isRequired: true
            },
            {
              contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'quiz',
              title: `${module.title} - Assessment`,
              description: `Knowledge check and progress assessment`,
              duration: 30,
              order: 4,
              isRequired: true
            }
          ];
        } else {
          // Add content IDs and order to existing contents
          module.contents = module.contents.map((content, index) => ({
            ...content,
            contentId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            order: index + 1,
            isRequired: content.isRequired !== false
          }));
        }
        
        const moduleDoc = new Module({
          courseId: course._id,
          moduleNumber: i + 1,
          title: module.title,
          description: module.description,
          learningObjectives: module.learningObjectives || [],
          estimatedDuration: module.duration || 12 * 60, // Convert hours to minutes
          difficulty: course.difficulty,
          contents: module.contents,
          prerequisites: {
            modules: i > 0 ? [createdModules[i - 1]._id] : [],
            skills: [],
            courses: []
          },
          tags: module.topics || [],
          category: course.category,
          createdBy: course.instructor.id,
          settings: {
            isActive: true,
            allowSkip: false,
            sequentialAccess: true
          },
          status: 'published'
        });
        
        await moduleDoc.save();
        createdModules.push(moduleDoc);
        console.log(`  ✅ Created module: ${moduleDoc.title} (Week ${moduleDoc.week})`);
      }
      
      // Update course with module references
      course.modules = createdModules.map(m => m._id);
      await course.save();
      
      console.log(`✅ Updated course ${course.title} with ${createdModules.length} modules`);
    }
    
    console.log('\n🎉 QUT Curriculum seeding completed successfully!');
    
    // Display summary
    const totalCourses = await Course.countDocuments();
    const totalModules = await Module.countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`Total courses created: ${totalCourses}`);
    console.log(`Total modules created: ${totalModules}`);
    console.log(`Average modules per course: ${Math.round(totalModules / totalCourses)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding QUT curriculum:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedQUTCurriculum();
}

module.exports = {
  seedQUTCurriculum,
  qutCurriculum
};