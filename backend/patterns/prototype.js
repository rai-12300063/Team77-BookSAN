/**
 * Prototype Pattern - Creates new objects by copying an existing instance
 * Use case: Creating course templates and duplicating learning configurations
 */

// Base prototype interface
class Prototype {
  clone() {
    throw new Error('clone() method must be implemented');
  }
}

// Course prototype
class CoursePrototype extends Prototype {
  constructor(title, category, difficulty, duration, syllabus, settings) {
    super();
    this.title = title;
    this.category = category;
    this.difficulty = difficulty;
    this.duration = duration;
    this.syllabus = syllabus || [];
    this.settings = settings || {};
    this.createdAt = new Date();
    this.id = this.generateId();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  clone() {
    // Deep clone the course
    const clonedSyllabus = this.syllabus.map(module => ({ ...module }));
    const clonedSettings = JSON.parse(JSON.stringify(this.settings));
    
    const cloned = new CoursePrototype(
      this.title,
      this.category,
      this.difficulty,
      this.duration,
      clonedSyllabus,
      clonedSettings
    );
    
    // Copy other properties (but generate new ID and timestamp)
    cloned.id = this.generateId();
    cloned.createdAt = new Date();
    
    return cloned;
  }

  updateTitle(newTitle) {
    this.title = newTitle;
    return this;
  }

  addModule(module) {
    this.syllabus.push(module);
    return this;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this;
  }

  getInfo() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      difficulty: this.difficulty,
      duration: this.duration,
      modules: this.syllabus.length,
      settings: this.settings,
      createdAt: this.createdAt
    };
  }
}

// Learning Path prototype
class LearningPathPrototype extends Prototype {
  constructor(name, description, courses, prerequisites, estimatedTime) {
    super();
    this.name = name;
    this.description = description;
    this.courses = courses || [];
    this.prerequisites = prerequisites || [];
    this.estimatedTime = estimatedTime;
    this.settings = {
      autoEnroll: false,
      sequentialOrder: true,
      certificateAwarded: false
    };
    this.id = this.generateId();
    this.createdAt = new Date();
  }

  generateId() {
    return `path_${Math.random().toString(36).substr(2, 9)}`;
  }

  clone() {
    const clonedCourses = this.courses.map(course => ({ ...course }));
    const clonedPrerequisites = [...this.prerequisites];
    const clonedSettings = { ...this.settings };
    
    const cloned = new LearningPathPrototype(
      this.name,
      this.description,
      clonedCourses,
      clonedPrerequisites,
      this.estimatedTime
    );
    
    cloned.settings = clonedSettings;
    cloned.id = this.generateId();
    cloned.createdAt = new Date();
    
    return cloned;
  }

  updateName(newName) {
    this.name = newName;
    return this;
  }

  addCourse(course) {
    this.courses.push(course);
    return this;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      coursesCount: this.courses.length,
      prerequisites: this.prerequisites,
      estimatedTime: this.estimatedTime,
      settings: this.settings,
      createdAt: this.createdAt
    };
  }
}

// Assignment prototype
class AssignmentPrototype extends Prototype {
  constructor(title, description, type, maxScore, timeLimit, questions) {
    super();
    this.title = title;
    this.description = description;
    this.type = type; // 'quiz', 'essay', 'project', 'coding'
    this.maxScore = maxScore;
    this.timeLimit = timeLimit; // in minutes
    this.questions = questions || [];
    this.settings = {
      allowRetakes: false,
      showCorrectAnswers: true,
      randomizeQuestions: false,
      passingScore: 70
    };
    this.id = this.generateId();
    this.createdAt = new Date();
  }

  generateId() {
    return `assign_${Math.random().toString(36).substr(2, 9)}`;
  }

  clone() {
    const clonedQuestions = this.questions.map(q => ({ ...q }));
    const clonedSettings = { ...this.settings };
    
    const cloned = new AssignmentPrototype(
      this.title,
      this.description,
      this.type,
      this.maxScore,
      this.timeLimit,
      clonedQuestions
    );
    
    cloned.settings = clonedSettings;
    cloned.id = this.generateId();
    cloned.createdAt = new Date();
    
    return cloned;
  }

  updateTitle(newTitle) {
    this.title = newTitle;
    return this;
  }

  addQuestion(question) {
    this.questions.push(question);
    return this;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this;
  }

  getInfo() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      maxScore: this.maxScore,
      timeLimit: this.timeLimit,
      questionsCount: this.questions.length,
      settings: this.settings,
      createdAt: this.createdAt
    };
  }
}

// Prototype registry for managing templates
class PrototypeRegistry {
  constructor() {
    this.prototypes = new Map();
  }

  register(name, prototype) {
    this.prototypes.set(name, prototype);
    console.log(`📝 Registered prototype: ${name}`);
  }

  unregister(name) {
    this.prototypes.delete(name);
    console.log(`🗑️ Unregistered prototype: ${name}`);
  }

  get(name) {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Prototype '${name}' not found`);
    }
    return prototype.clone();
  }

  list() {
    return Array.from(this.prototypes.keys());
  }

  has(name) {
    return this.prototypes.has(name);
  }
}

// Course template factory using prototypes
class CourseTemplateFactory {
  constructor() {
    this.registry = new PrototypeRegistry();
    this.initializeDefaultTemplates();
  }

  initializeDefaultTemplates() {
    // JavaScript course template
    const jsTemplate = new CoursePrototype(
      'JavaScript Course Template',
      'Programming',
      'Beginner',
      40,
      [
        { title: 'Introduction to JavaScript', duration: 2, type: 'video' },
        { title: 'Variables and Data Types', duration: 3, type: 'lesson' },
        { title: 'Functions', duration: 4, type: 'lesson' },
        { title: 'Objects and Arrays', duration: 3, type: 'lesson' },
        { title: 'Final Project', duration: 8, type: 'project' }
      ],
      {
        allowDiscussions: true,
        certificateRequired: true,
        prerequisitesRequired: false
      }
    );

    // Python course template
    const pythonTemplate = new CoursePrototype(
      'Python Course Template',
      'Programming',
      'Beginner',
      50,
      [
        { title: 'Python Basics', duration: 3, type: 'video' },
        { title: 'Data Structures', duration: 5, type: 'lesson' },
        { title: 'Control Flow', duration: 4, type: 'lesson' },
        { title: 'Functions and Modules', duration: 5, type: 'lesson' },
        { title: 'Web Development Project', duration: 10, type: 'project' }
      ],
      {
        allowDiscussions: true,
        certificateRequired: true,
        prerequisitesRequired: false
      }
    );

    // Design course template
    const designTemplate = new CoursePrototype(
      'Design Course Template',
      'Design',
      'Intermediate',
      30,
      [
        { title: 'Design Principles', duration: 3, type: 'lesson' },
        { title: 'Color Theory', duration: 2, type: 'lesson' },
        { title: 'Typography', duration: 3, type: 'lesson' },
        { title: 'Design Tools', duration: 4, type: 'practical' },
        { title: 'Portfolio Project', duration: 8, type: 'project' }
      ],
      {
        allowDiscussions: true,
        certificateRequired: false,
        prerequisitesRequired: true
      }
    );

    // Register templates
    this.registry.register('javascript-beginner', jsTemplate);
    this.registry.register('python-beginner', pythonTemplate);
    this.registry.register('design-intermediate', designTemplate);
  }

  createCourse(templateName, customizations = {}) {
    const course = this.registry.get(templateName);
    
    // Apply customizations
    if (customizations.title) {
      course.updateTitle(customizations.title);
    }
    
    if (customizations.additionalModules) {
      customizations.additionalModules.forEach(module => {
        course.addModule(module);
      });
    }
    
    if (customizations.settings) {
      course.updateSettings(customizations.settings);
    }
    
    return course;
  }

  getAvailableTemplates() {
    return this.registry.list();
  }
}

// Learning path factory using prototypes
class LearningPathFactory {
  constructor() {
    this.registry = new PrototypeRegistry();
    this.initializeDefaultPaths();
  }

  initializeDefaultPaths() {
    // Full-stack development path
    const fullStackPath = new LearningPathPrototype(
      'Full-Stack Developer Path',
      'Complete path to become a full-stack developer',
      [
        { courseId: 'html-css-basics', order: 1 },
        { courseId: 'javascript-fundamentals', order: 2 },
        { courseId: 'react-basics', order: 3 },
        { courseId: 'node-express', order: 4 },
        { courseId: 'database-design', order: 5 }
      ],
      ['basic-computer-skills'],
      150 // hours
    );

    // Data science path
    const dataSciencePath = new LearningPathPrototype(
      'Data Science Path',
      'Comprehensive data science learning journey',
      [
        { courseId: 'python-basics', order: 1 },
        { courseId: 'statistics-fundamentals', order: 2 },
        { courseId: 'data-analysis-pandas', order: 3 },
        { courseId: 'machine-learning', order: 4 },
        { courseId: 'data-visualization', order: 5 }
      ],
      ['mathematics-basics'],
      120 // hours
    );

    this.registry.register('full-stack-developer', fullStackPath);
    this.registry.register('data-scientist', dataSciencePath);
  }

  createLearningPath(templateName, customizations = {}) {
    const path = this.registry.get(templateName);
    
    if (customizations.name) {
      path.updateName(customizations.name);
    }
    
    if (customizations.additionalCourses) {
      customizations.additionalCourses.forEach(course => {
        path.addCourse(course);
      });
    }
    
    if (customizations.settings) {
      path.updateSettings(customizations.settings);
    }
    
    return path;
  }
}

// Usage example
function demonstratePrototype() {
  console.log('=== Prototype Pattern Demo ===\n');

  // Course template factory demo
  console.log('1. Creating courses from templates:');
  const courseFactory = new CourseTemplateFactory();
  
  console.log('Available templates:', courseFactory.getAvailableTemplates());
  
  // Create JavaScript course from template
  const jsCourse = courseFactory.createCourse('javascript-beginner', {
    title: 'Advanced JavaScript for Web Development',
    additionalModules: [
      { title: 'ES6 Features', duration: 3, type: 'lesson' },
      { title: 'Async Programming', duration: 4, type: 'lesson' }
    ],
    settings: { allowDiscussions: false }
  });
  
  console.log('Created JavaScript course:', jsCourse.getInfo());

  // Create Python course from template
  const pythonCourse = courseFactory.createCourse('python-beginner', {
    title: 'Python for Data Analysis'
  });
  
  console.log('Created Python course:', pythonCourse.getInfo());

  console.log('\n2. Creating learning paths from templates:');
  const pathFactory = new LearningPathFactory();
  
  const customFullStackPath = pathFactory.createLearningPath('full-stack-developer', {
    name: 'Full-Stack Developer - 2024 Edition',
    additionalCourses: [
      { courseId: 'typescript-basics', order: 6 },
      { courseId: 'deployment-aws', order: 7 }
    ],
    settings: { autoEnroll: true, certificateAwarded: true }
  });
  
  console.log('Created learning path:', customFullStackPath.getInfo());

  console.log('\n3. Manual prototype cloning:');
  
  // Create an assignment template
  const quizTemplate = new AssignmentPrototype(
    'Module Quiz Template',
    'Standard quiz for module completion',
    'quiz',
    100,
    30,
    [
      { question: 'Sample question 1', type: 'multiple-choice', options: ['A', 'B', 'C'], answer: 'A' },
      { question: 'Sample question 2', type: 'multiple-choice', options: ['X', 'Y', 'Z'], answer: 'Y' }
    ]
  );
  
  // Clone and customize for different modules
  const module1Quiz = quizTemplate.clone()
    .updateTitle('Module 1: Introduction Quiz')
    .addQuestion({ question: 'What is JavaScript?', type: 'short-answer', answer: 'Programming language' });
  
  const module2Quiz = quizTemplate.clone()
    .updateTitle('Module 2: Variables Quiz')
    .updateSettings({ allowRetakes: true, passingScore: 80 });
  
  console.log('Original template:', quizTemplate.getInfo());
  console.log('Module 1 quiz:', module1Quiz.getInfo());
  console.log('Module 2 quiz:', module2Quiz.getInfo());

  console.log('\n4. Prototype registry usage:');
  const customRegistry = new PrototypeRegistry();
  
  // Register custom prototypes
  customRegistry.register('basic-quiz', quizTemplate);
  customRegistry.register('advanced-course', jsCourse);
  
  console.log('Registry contents:', customRegistry.list());
  
  // Create instances from registry
  const newQuiz = customRegistry.get('basic-quiz');
  newQuiz.updateTitle('Custom Quiz from Registry');
  
  console.log('New quiz from registry:', newQuiz.getInfo());
  console.log('Original template unchanged:', quizTemplate.getInfo());
}

module.exports = {
  Prototype,
  CoursePrototype,
  LearningPathPrototype,
  AssignmentPrototype,
  PrototypeRegistry,
  CourseTemplateFactory,
  LearningPathFactory,
  demonstratePrototype
};