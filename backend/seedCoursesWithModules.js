const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Module = require('./models/Module');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const coursesData = [
  {
    "code": "IFN580",
    "title": "Machine Learning",
    "description": "Core ML concepts and workflows for building, evaluating, and deploying predictive models.",
    "modules": [
      {
        "title": "Introduction & ML Workflow",
        "description": "End-to-end ML lifecycle and problem framing.",
        "lessons": ["CRISP-DM & ML pipelines", "Problem types & datasets", "Train/validate/test splits"]
      },
      {
        "title": "Supervised Learning: Classification",
        "description": "Learning decision boundaries for labeled categories.",
        "lessons": ["k-NN & Decision Trees", "Logistic Regression & SVM", "Class imbalance strategies"]
      },
      {
        "title": "Supervised Learning: Regression",
        "description": "Predicting continuous targets and evaluating fit.",
        "lessons": ["Linear & Ridge/Lasso", "Feature engineering for regression", "Error metrics (MAE/RMSE/R2)"]
      },
      {
        "title": "Unsupervised Learning & Clustering",
        "description": "Finding structure without labels.",
        "lessons": ["k-Means & k-Medoids", "Hierarchical clustering", "Dimensionality reduction (PCA)"]
      },
      {
        "title": "Model Evaluation & Cross-Validation",
        "description": "Robust assessment and tuning.",
        "lessons": ["k-fold CV & stratification", "ROC-AUC, PR curves", "Hyperparameter tuning"]
      }
    ]
  },
  {
    "code": "IFN581",
    "title": "Programming Fundamentals",
    "description": "Foundations of programming with an emphasis on readable, testable code.",
    "modules": [
      {
        "title": "Python Basics",
        "description": "Core syntax and data types.",
        "lessons": ["Variables & types", "Expressions & I/O", "Style & linting (PEP8)"]
      },
      {
        "title": "Control Flow",
        "description": "Branching and iteration patterns.",
        "lessons": ["If/elif/else", "For/while loops", "Comprehensions"]
      },
      {
        "title": "Functions & Modules",
        "description": "Reusable building blocks.",
        "lessons": ["Parameters & returns", "Docstrings & typing", "Packaging & imports"]
      },
      {
        "title": "Data Structures",
        "description": "Efficient data handling.",
        "lessons": ["Lists/tuples/sets", "Dictionaries", "Time complexity basics"]
      },
      {
        "title": "Testing & Debugging",
        "description": "Quality assurance techniques.",
        "lessons": ["Unit tests (pytest)", "Debuggers & breakpoints", "Exceptions & error handling"]
      }
    ]
  },
  {
    "code": "IFN582",
    "title": "Rapid Web Development with Databases",
    "description": "Build data-driven web apps with a lightweight stack and solid DB design.",
    "modules": [
      {
        "title": "Relational Modelling",
        "description": "Translate requirements into schemas.",
        "lessons": ["ER modeling", "Normalization", "Keys & constraints"]
      },
      {
        "title": "SQL Essentials",
        "description": "Querying and manipulating data.",
        "lessons": ["SELECT/INSERT/UPDATE/DELETE", "Joins & subqueries", "Indexes & execution plans"]
      },
      {
        "title": "Server-Side Fundamentals",
        "description": "HTTP and minimal web frameworks.",
        "lessons": ["Routing & controllers", "Templates & forms", "Session management"]
      },
      {
        "title": "CRUD with ORM",
        "description": "Abstractions over SQL.",
        "lessons": ["Models & migrations", "Repositories & services", "Transactions"]
      },
      {
        "title": "Auth & Security",
        "description": "Protecting app and data.",
        "lessons": ["Password hashing", "JWT & sessions", "Input validation & OWASP"]
      }
    ]
  },
  {
    "code": "IFN583",
    "title": "Computer Systems and Security",
    "description": "How computers and networks work and how to secure them.",
    "modules": [
      {
        "title": "Architecture & OS",
        "description": "From CPU to processes.",
        "lessons": ["CPU & memory basics", "Processes & threads", "File systems & permissions"]
      },
      {
        "title": "Networking Foundations",
        "description": "Protocols and models.",
        "lessons": ["OSI & TCP/IP", "IP, TCP/UDP, DNS", "Routing & NAT"]
      },
      {
        "title": "Security Principles",
        "description": "CIA triad, threats, and risks.",
        "lessons": ["Threat modeling", "Vulns & exploits", "Defense-in-depth"]
      },
      {
        "title": "Applied Security",
        "description": "Hardening and monitoring.",
        "lessons": ["Secure configs & baselines", "Patching & logging", "Endpoint protection"]
      },
      {
        "title": "Crypto Basics",
        "description": "Core cryptography for systems.",
        "lessons": ["Hashing & MACs", "Symmetric vs asymmetric", "TLS & certificates"]
      }
    ]
  },
  {
    "code": "IFN584",
    "title": "Object-Oriented Design and Development",
    "description": "OO analysis/design, patterns, and building maintainable systems.",
    "modules": [
      {
        "title": "OO Principles",
        "description": "Abstraction and encapsulation.",
        "lessons": ["Classes & objects", "Interfaces & inheritance", "SOLID principles"]
      },
      {
        "title": "UML & Modelling",
        "description": "Communicating designs.",
        "lessons": ["Class & sequence diagrams", "Use cases", "State & activity diagrams"]
      },
      {
        "title": "Design Patterns I",
        "description": "Creational and structural patterns.",
        "lessons": ["Factory & Builder", "Singleton & Prototype", "Adapter & Facade"]
      },
      {
        "title": "Design Patterns II",
        "description": "Behavioral patterns and trade-offs.",
        "lessons": ["Strategy & Observer", "Command & Template Method", "Iterator & Visitor"]
      },
      {
        "title": "Testing OO Systems",
        "description": "Quality and refactoring.",
        "lessons": ["Unit vs integration tests", "Mocking & DI", "Refactoring techniques"]
      }
    ]
  },
  {
    "code": "IFN585",
    "title": "Systems Innovation and Design",
    "description": "Systems thinking to analyze complex problems and design interventions.",
    "modules": [
      {
        "title": "Problem Framing",
        "description": "Define boundaries and goals.",
        "lessons": ["Stakeholder mapping", "Success metrics", "Assumptions & risks"]
      },
      {
        "title": "Data to Insight",
        "description": "Evidence-driven design.",
        "lessons": ["Collecting data ethically", "Visual analytics", "Sensemaking workshops"]
      },
      {
        "title": "System Dynamics",
        "description": "Feedback and leverage points.",
        "lessons": ["Causal loop diagrams", "Stocks & flows", "Scenario exploration"]
      },
      {
        "title": "Intervention Design",
        "description": "From insights to action.",
        "lessons": ["Ideation techniques", "Prioritization matrices", "Prototyping interventions"]
      },
      {
        "title": "Impact Communication",
        "description": "Make findings actionable.",
        "lessons": ["Storytelling with data", "Executive summaries", "Roadmaps & KPIs"]
      }
    ]
  },
  {
    "code": "IFN635",
    "title": "Cyber Security and Governance",
    "description": "Risk, compliance, and operational security for modern organizations.",
    "modules": [
      {
        "title": "Risk Management",
        "description": "Frameworks and methodologies.",
        "lessons": ["ISO 27005 & NIST RMF", "Risk registers", "Likelihood & impact"]
      },
      {
        "title": "Policies & Compliance",
        "description": "Controls and obligations.",
        "lessons": ["ISO 27001 controls", "Privacy & data protection", "Audit readiness"]
      },
      {
        "title": "Incident Response",
        "description": "Prepare, detect, respond, recover.",
        "lessons": ["Playbooks & SEV levels", "IR tools & timelines", "Post-incident reviews"]
      },
      {
        "title": "Cloud Security",
        "description": "Shared responsibility in cloud.",
        "lessons": ["IAM hardening", "Logging & monitoring", "Network segmentation"]
      },
      {
        "title": "Human Factors",
        "description": "People, culture, and training.",
        "lessons": ["Security awareness", "Phishing simulations", "Insider risk basics"]
      }
    ]
  },
  {
    "code": "IFN636",
    "title": "Software Life Cycle Management",
    "description": "Plan, build, test, release, and operate software at scale.",
    "modules": [
      {
        "title": "Requirements & Planning",
        "description": "From vision to backlog.",
        "lessons": ["User stories & acceptance criteria", "Prioritization (MoSCoW)", "Roadmaps & milestones"]
      },
      {
        "title": "Architecture & Design",
        "description": "System structure and qualities.",
        "lessons": ["Monolith vs microservices", "Quality attributes", "Diagrams & ADRs"]
      },
      {
        "title": "Delivery & DevOps",
        "description": "Flow and automation.",
        "lessons": ["CI/CD pipelines", "Testing pyramid", "Feature flags & releases"]
      },
      {
        "title": "Operations & SRE",
        "description": "Reliability in production.",
        "lessons": ["Observability (logs/metrics/traces)", "SLI/SLO/Error budgets", "Incident management"]
      },
      {
        "title": "Governance & Risk",
        "description": "Safeguards in SDLC.",
        "lessons": ["Change management", "Security gates", "Licensing & compliance"]
      }
    ]
  },
  {
    "code": "IFN637",
    "title": "Human-Centred Design of IT Systems",
    "description": "Research-driven design, prototyping, and evaluation focused on users.",
    "modules": [
      {
        "title": "User Research & Ethics",
        "description": "Understand users responsibly.",
        "lessons": ["Methods (interviews, diary)", "Consent & privacy", "Bias & inclusivity"]
      },
      {
        "title": "Synthesis & Personas",
        "description": "Turn data into insights.",
        "lessons": ["Affinity mapping", "Personas & JTBD", "Problem statements"]
      },
      {
        "title": "Ideation & Prototyping",
        "description": "Generate and test ideas.",
        "lessons": ["Sketching & wireframes", "Lo/hi-fi prototypes", "Design systems basics"]
      },
      {
        "title": "Usability Testing",
        "description": "Assess and iterate.",
        "lessons": ["Test plans & tasks", "Metrics (SUS, time-on-task)", "Iteration plans"]
      },
      {
        "title": "Handover & Specs",
        "description": "From design to delivery.",
        "lessons": ["Design docs & specs", "Accessibility checks", "Developer collaboration"]
      }
    ]
  },
  {
    "code": "IFN666",
    "title": "Web and Mobile Application Development",
    "description": "Front-end and mobile development practices for performant, accessible apps.",
    "modules": [
      {
        "title": "Front-End Foundations",
        "description": "Core web platform skills.",
        "lessons": ["HTML semantics", "CSS layout & responsiveness", "Modern JS syntax"]
      },
      {
        "title": "State & Data",
        "description": "Managing client-side complexity.",
        "lessons": ["State patterns", "HTTP & fetch/axios", "Caching strategies"]
      },
      {
        "title": "Mobile UX",
        "description": "Designing for handheld devices.",
        "lessons": ["Touch targets & gestures", "Navigation patterns", "Performance budgets"]
      },
      {
        "title": "APIs & Integration",
        "description": "Communicating with services.",
        "lessons": ["REST & JSON", "Auth flows (OAuth/JWT)", "Error handling & retries"]
      },
      {
        "title": "Deploy & Monitor",
        "description": "Ship and observe apps.",
        "lessons": ["Build & bundling", "CDNs & edge", "Logs, metrics, crash reports"]
      }
    ]
  }
];

// Category mappings (must match Course model enum)
// Valid: 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Mobile Development', 'Web Development', 'Other'
const categoryMap = {
  'IFN580': 'Data Science',
  'IFN581': 'Programming',
  'IFN582': 'Web Development',
  'IFN583': 'Other', // Computer Systems and Security
  'IFN584': 'Programming',
  'IFN585': 'Other', // Systems Innovation
  'IFN635': 'Other', // Cyber Security
  'IFN636': 'DevOps',
  'IFN637': 'Design',
  'IFN666': 'Web Development'
};

// Difficulty mappings
const difficultyMap = {
  'IFN580': 'Intermediate',
  'IFN581': 'Beginner',
  'IFN582': 'Beginner',
  'IFN583': 'Intermediate',
  'IFN584': 'Intermediate',
  'IFN585': 'Intermediate',
  'IFN635': 'Advanced',
  'IFN636': 'Intermediate',
  'IFN637': 'Intermediate',
  'IFN666': 'Intermediate'
};

const seedCoursesWithModules = async () => {
  try {
    await connectDB();

    // Find or create an admin user for instructor
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.log('Admin user not found. Please ensure an admin user exists.');
      process.exit(1);
    }

    console.log('Using admin user as instructor:', adminUser.email);

    // Clear existing courses and modules
    await Course.deleteMany({});
    await Module.deleteMany({});
    console.log('Cleared existing courses and modules');

    // Create courses with modules
    for (const courseData of coursesData) {
      // Create the course
      const course = await Course.create({
        title: `${courseData.code} - ${courseData.title}`,
        description: courseData.description,
        category: categoryMap[courseData.code] || 'Other',
        difficulty: difficultyMap[courseData.code] || 'Intermediate',
        instructor: {
          id: adminUser._id,
          name: adminUser.name || 'Admin User',
          email: adminUser.email
        },
        duration: {
          weeks: 12,
          hoursPerWeek: 5
        },
        estimatedCompletionTime: courseData.modules.length * 12, // 12 hours per module
        prerequisites: [],
        learningObjectives: courseData.modules.map(m => m.description),
        syllabus: [],
        moduleSettings: {
          hasModules: true,
          moduleSequencing: 'sequential',
          allowModuleSkipping: false,
          moduleCompletionRequired: true
        },
        isActive: true
      });

      console.log(`Created course: ${course.title}`);

      // Create modules for this course
      const modulesCreated = [];
      for (let i = 0; i < courseData.modules.length; i++) {
        const moduleData = courseData.modules[i];

        // Create contents from lessons
        const contents = moduleData.lessons.map((lesson, idx) => ({
          contentId: `${courseData.code}-M${i + 1}-L${idx + 1}`,
          type: 'text',
          title: lesson,
          description: `Learn about ${lesson}`,
          duration: 30, // 30 minutes per lesson
          order: idx + 1,
          isRequired: true,
          contentData: {
            content: `Content for ${lesson}`,
            readingTime: 30
          },
          learningObjectives: [lesson],
          complexity: 5
        }));

        const module = await Module.create({
          courseId: course._id,
          moduleNumber: i + 1,
          title: moduleData.title,
          description: moduleData.description,
          learningObjectives: moduleData.lessons,
          estimatedDuration: moduleData.lessons.length * 30, // 30 min per lesson
          difficulty: difficultyMap[courseData.code] || 'Intermediate',
          contents: contents,
          prerequisites: {
            modules: [],
            skills: [],
            courses: []
          },
          settings: {
            isActive: true,
            allowSkip: false,
            sequentialAccess: true,
            maxAttempts: 3
          },
          createdBy: adminUser._id,
          status: 'published'
        });

        modulesCreated.push(module);

        // Update course syllabus
        course.syllabus.push({
          moduleTitle: moduleData.title,
          topics: moduleData.lessons,
          estimatedHours: Math.round(moduleData.lessons.length * 0.5), // 0.5 hours per lesson
          moduleId: module._id
        });
      }

      await course.save();
      console.log(`Created ${modulesCreated.length} modules for ${course.title}`);
    }

    console.log('\nCourses with modules seeded successfully!');
    console.log(`Total courses created: ${coursesData.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCoursesWithModules();
