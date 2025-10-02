/**
 * Strategy Pattern - Enables interchangeable algorithms at runtime
 * Use case: Different grading strategies, content delivery methods, assessment types
 */

// Strategy interface
class GradingStrategy {
  calculateGrade(scores) {
    throw new Error('calculateGrade() method must be implemented');
  }

  getDescription() {
    throw new Error('getDescription() method must be implemented');
  }
}

// Concrete grading strategies
class WeightedAverageStrategy extends GradingStrategy {
  constructor(weights = {}) {
    super();
    this.weights = {
      assignments: 0.4,
      quizzes: 0.3,
      finalExam: 0.3,
      ...weights
    };
  }

  calculateGrade(scores) {
    const { assignments = [], quizzes = [], finalExam = 0 } = scores;
    
    const avgAssignments = assignments.length > 0 
      ? assignments.reduce((sum, score) => sum + score, 0) / assignments.length 
      : 0;
    
    const avgQuizzes = quizzes.length > 0 
      ? quizzes.reduce((sum, score) => sum + score, 0) / quizzes.length 
      : 0;
    
    const weightedGrade = 
      (avgAssignments * this.weights.assignments) +
      (avgQuizzes * this.weights.quizzes) +
      (finalExam * this.weights.finalExam);
    
    return {
      finalGrade: Math.round(weightedGrade * 100) / 100,
      letterGrade: this.getLetterGrade(weightedGrade),
      breakdown: {
        assignments: { average: avgAssignments, weight: this.weights.assignments },
        quizzes: { average: avgQuizzes, weight: this.weights.quizzes },
        finalExam: { score: finalExam, weight: this.weights.finalExam }
      }
    };
  }

  getLetterGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getDescription() {
    return `Weighted Average (Assignments: ${this.weights.assignments * 100}%, Quizzes: ${this.weights.quizzes * 100}%, Final: ${this.weights.finalExam * 100}%)`;
  }
}

class PassFailStrategy extends GradingStrategy {
  constructor(passingThreshold = 70) {
    super();
    this.passingThreshold = passingThreshold;
  }

  calculateGrade(scores) {
    const { assignments = [], quizzes = [], finalExam = 0 } = scores;
    
    const allScores = [...assignments, ...quizzes, finalExam].filter(score => score > 0);
    const average = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 0;
    
    const passed = average >= this.passingThreshold;
    
    return {
      finalGrade: passed ? 'PASS' : 'FAIL',
      letterGrade: passed ? 'P' : 'F',
      numericScore: average,
      breakdown: {
        average,
        threshold: this.passingThreshold,
        status: passed ? 'PASSED' : 'FAILED'
      }
    };
  }

  getDescription() {
    return `Pass/Fail (Threshold: ${this.passingThreshold}%)`;
  }
}

class CompetencyBasedStrategy extends GradingStrategy {
  constructor(competencies = []) {
    super();
    this.competencies = competencies; // Array of competency requirements
  }

  calculateGrade(scores) {
    const { competencyScores = {} } = scores;
    
    const results = this.competencies.map(competency => {
      const score = competencyScores[competency.id] || 0;
      const mastered = score >= competency.masteryThreshold;
      
      return {
        competency: competency.name,
        score,
        threshold: competency.masteryThreshold,
        mastered
      };
    });
    
    const masteredCount = results.filter(r => r.mastered).length;
    const totalCount = results.length;
    const masteryPercentage = totalCount > 0 ? (masteredCount / totalCount) * 100 : 0;
    
    return {
      finalGrade: `${masteredCount}/${totalCount} Competencies`,
      letterGrade: this.getCompetencyGrade(masteryPercentage),
      masteryPercentage,
      breakdown: {
        masteredCompetencies: masteredCount,
        totalCompetencies: totalCount,
        competencyDetails: results
      }
    };
  }

  getCompetencyGrade(percentage) {
    if (percentage === 100) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  getDescription() {
    return `Competency-Based (${this.competencies.length} competencies)`;
  }
}

// Content delivery strategies
class ContentDeliveryStrategy {
  deliver(content, userProfile) {
    throw new Error('deliver() method must be implemented');
  }

  getDeliveryMethod() {
    throw new Error('getDeliveryMethod() method must be implemented');
  }
}

class SequentialDeliveryStrategy extends ContentDeliveryStrategy {
  deliver(content, userProfile) {
    const orderedContent = content.sort((a, b) => a.order - b.order);
    
    return {
      method: 'sequential',
      content: orderedContent,
      currentItem: orderedContent.find(item => !item.completed) || orderedContent[0],
      progress: {
        completed: orderedContent.filter(item => item.completed).length,
        total: orderedContent.length
      }
    };
  }

  getDeliveryMethod() {
    return 'Sequential - Complete items in order';
  }
}

class AdaptiveDeliveryStrategy extends ContentDeliveryStrategy {
  deliver(content, userProfile) {
    const { learningStyle, proficiencyLevel, weakAreas = [] } = userProfile;
    
    // Prioritize content based on user profile
    let prioritizedContent = content.map(item => {
      let priority = item.basePriority || 1;
      
      // Boost priority for weak areas
      if (weakAreas.includes(item.topic)) {
        priority += 2;
      }
      
      // Adjust for learning style
      if (item.type === learningStyle) {
        priority += 1;
      }
      
      // Adjust for proficiency level
      if (item.difficulty === proficiencyLevel) {
        priority += 1;
      }
      
      return { ...item, adaptivePriority: priority };
    });
    
    // Sort by adaptive priority
    prioritizedContent.sort((a, b) => b.adaptivePriority - a.adaptivePriority);
    
    return {
      method: 'adaptive',
      content: prioritizedContent,
      currentItem: prioritizedContent.find(item => !item.completed) || prioritizedContent[0],
      adaptations: {
        learningStyle,
        proficiencyLevel,
        weakAreas,
        prioritizedBy: 'weakness + style + proficiency'
      }
    };
  }

  getDeliveryMethod() {
    return 'Adaptive - Personalized based on user profile';
  }
}

class GameifiedDeliveryStrategy extends ContentDeliveryStrategy {
  deliver(content, userProfile) {
    const { level = 1, points = 0, achievements = [] } = userProfile.gamification || {};
    
    // Add gamification elements to content
    const gamifiedContent = content.map(item => {
      const pointsReward = this.calculatePoints(item);
      const requiredLevel = Math.max(1, Math.floor(item.difficulty * 2));
      const isUnlocked = level >= requiredLevel;
      
      return {
        ...item,
        pointsReward,
        requiredLevel,
        isUnlocked,
        gamificationElements: {
          badge: item.type === 'challenge' ? 'Challenge Master' : null,
          streak: item.completed ? 1 : 0
        }
      };
    });
    
    // Filter to unlocked content only
    const availableContent = gamifiedContent.filter(item => item.isUnlocked);
    
    return {
      method: 'gamified',
      content: availableContent,
      lockedContent: gamifiedContent.filter(item => !item.isUnlocked),
      currentItem: availableContent.find(item => !item.completed) || availableContent[0],
      gamification: {
        currentLevel: level,
        currentPoints: points,
        nextLevelPoints: (level + 1) * 100,
        achievements
      }
    };
  }

  calculatePoints(item) {
    const basePoints = {
      'lesson': 10,
      'quiz': 15,
      'assignment': 25,
      'project': 50,
      'challenge': 100
    };
    
    return (basePoints[item.type] || 10) * item.difficulty;
  }

  getDeliveryMethod() {
    return 'Gamified - Points, levels, and achievements';
  }
}

// Assessment strategies
class AssessmentStrategy {
  generateAssessment(topics, difficulty, userProfile) {
    throw new Error('generateAssessment() method must be implemented');
  }

  getAssessmentType() {
    throw new Error('getAssessmentType() method must be implemented');
  }
}

class QuizAssessmentStrategy extends AssessmentStrategy {
  constructor(questionsPerTopic = 3) {
    super();
    this.questionsPerTopic = questionsPerTopic;
  }

  generateAssessment(topics, difficulty, userProfile) {
    const questions = topics.flatMap(topic => 
      Array(this.questionsPerTopic).fill().map((_, index) => ({
        id: `${topic.id}_q${index + 1}`,
        topic: topic.name,
        question: `${topic.name} question ${index + 1}`,
        type: 'multiple-choice',
        difficulty,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        points: difficulty * 2
      }))
    );

    return {
      type: 'quiz',
      title: `${topics.map(t => t.name).join(', ')} Quiz`,
      questions,
      timeLimit: questions.length * 2, // 2 minutes per question
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      instructions: 'Select the best answer for each question.'
    };
  }

  getAssessmentType() {
    return `Multiple Choice Quiz (${this.questionsPerTopic} questions per topic)`;
  }
}

class ProjectAssessmentStrategy extends AssessmentStrategy {
  generateAssessment(topics, difficulty, userProfile) {
    const projectComplexity = difficulty >= 3 ? 'complex' : 'simple';
    
    return {
      type: 'project',
      title: `${topics.map(t => t.name).join(' & ')} Project`,
      description: `Create a ${projectComplexity} project incorporating ${topics.map(t => t.name).join(', ')}`,
      requirements: topics.map(topic => ({
        topic: topic.name,
        requirement: `Demonstrate understanding of ${topic.name}`,
        weight: 100 / topics.length
      })),
      deliverables: [
        'Working code/solution',
        'Documentation',
        'Reflection essay'
      ],
      timeLimit: difficulty * 7, // days
      totalPoints: 100,
      rubric: this.generateRubric(topics)
    };
  }

  generateRubric(topics) {
    return topics.map(topic => ({
      criterion: topic.name,
      levels: [
        { level: 'Excellent', points: 4, description: `Masterful use of ${topic.name}` },
        { level: 'Good', points: 3, description: `Good understanding of ${topic.name}` },
        { level: 'Satisfactory', points: 2, description: `Basic use of ${topic.name}` },
        { level: 'Needs Improvement', points: 1, description: `Limited understanding of ${topic.name}` }
      ]
    }));
  }

  getAssessmentType() {
    return 'Project-Based Assessment with Rubric';
  }
}

// Context classes that use strategies
class GradeCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
    console.log(`📊 Grading strategy changed to: ${strategy.getDescription()}`);
  }

  calculateStudentGrade(studentScores) {
    console.log(`🎓 Calculating grade using: ${this.strategy.getDescription()}`);
    return this.strategy.calculateGrade(studentScores);
  }
}

class ContentManager {
  constructor(deliveryStrategy) {
    this.deliveryStrategy = deliveryStrategy;
  }

  setDeliveryStrategy(strategy) {
    this.deliveryStrategy = strategy;
    console.log(`📚 Content delivery changed to: ${strategy.getDeliveryMethod()}`);
  }

  deliverContent(content, userProfile) {
    console.log(`📦 Delivering content using: ${this.deliveryStrategy.getDeliveryMethod()}`);
    return this.deliveryStrategy.deliver(content, userProfile);
  }
}

class AssessmentGenerator {
  constructor(assessmentStrategy) {
    this.assessmentStrategy = assessmentStrategy;
  }

  setAssessmentStrategy(strategy) {
    this.assessmentStrategy = strategy;
    console.log(`📝 Assessment strategy changed to: ${strategy.getAssessmentType()}`);
  }

  createAssessment(topics, difficulty, userProfile) {
    console.log(`📋 Generating assessment using: ${this.assessmentStrategy.getAssessmentType()}`);
    return this.assessmentStrategy.generateAssessment(topics, difficulty, userProfile);
  }
}

// Usage example
function demonstrateStrategy() {
  console.log('=== Strategy Pattern Demo ===\n');

  // Sample data
  const studentScores = {
    assignments: [85, 92, 78, 88],
    quizzes: [90, 85, 95],
    finalExam: 87,
    competencyScores: {
      'js-basics': 95,
      'react-fundamentals': 80,
      'node-backend': 75,
      'database-design': 85
    }
  };

  const competencies = [
    { id: 'js-basics', name: 'JavaScript Basics', masteryThreshold: 80 },
    { id: 'react-fundamentals', name: 'React Fundamentals', masteryThreshold: 75 },
    { id: 'node-backend', name: 'Node.js Backend', masteryThreshold: 70 },
    { id: 'database-design', name: 'Database Design', masteryThreshold: 80 }
  ];

  console.log('1. Grading Strategies:');
  
  const gradeCalculator = new GradeCalculator(new WeightedAverageStrategy());
  
  // Weighted average grading
  let result = gradeCalculator.calculateStudentGrade(studentScores);
  console.log('Weighted Average Result:', result);

  // Change to pass/fail
  gradeCalculator.setStrategy(new PassFailStrategy(75));
  result = gradeCalculator.calculateStudentGrade(studentScores);
  console.log('Pass/Fail Result:', result);

  // Change to competency-based
  gradeCalculator.setStrategy(new CompetencyBasedStrategy(competencies));
  result = gradeCalculator.calculateStudentGrade(studentScores);
  console.log('Competency-Based Result:', result);

  console.log('\n2. Content Delivery Strategies:');
  
  const sampleContent = [
    { id: 1, title: 'Introduction', type: 'video', difficulty: 1, topic: 'basics', order: 1, completed: true },
    { id: 2, title: 'Variables', type: 'lesson', difficulty: 1, topic: 'basics', order: 2, completed: true },
    { id: 3, title: 'Functions', type: 'lesson', difficulty: 2, topic: 'intermediate', order: 3, completed: false },
    { id: 4, title: 'Advanced Patterns', type: 'challenge', difficulty: 3, topic: 'advanced', order: 4, completed: false }
  ];

  const userProfile = {
    learningStyle: 'lesson',
    proficiencyLevel: 2,
    weakAreas: ['intermediate'],
    gamification: { level: 2, points: 150, achievements: ['First Steps'] }
  };

  const contentManager = new ContentManager(new SequentialDeliveryStrategy());
  
  // Sequential delivery
  let delivery = contentManager.deliverContent(sampleContent, userProfile);
  console.log('Sequential Delivery:', {
    method: delivery.method,
    currentItem: delivery.currentItem.title,
    progress: delivery.progress
  });

  // Change to adaptive delivery
  contentManager.setDeliveryStrategy(new AdaptiveDeliveryStrategy());
  delivery = contentManager.deliverContent(sampleContent, userProfile);
  console.log('Adaptive Delivery:', {
    method: delivery.method,
    currentItem: delivery.currentItem.title,
    adaptations: delivery.adaptations
  });

  // Change to gamified delivery
  contentManager.setDeliveryStrategy(new GameifiedDeliveryStrategy());
  delivery = contentManager.deliverContent(sampleContent, userProfile);
  console.log('Gamified Delivery:', {
    method: delivery.method,
    currentItem: delivery.currentItem?.title || 'None available',
    gamification: delivery.gamification,
    lockedCount: delivery.lockedContent.length
  });

  console.log('\n3. Assessment Strategies:');
  
  const topics = [
    { id: 'js', name: 'JavaScript' },
    { id: 'react', name: 'React' }
  ];

  const assessmentGenerator = new AssessmentGenerator(new QuizAssessmentStrategy(2));
  
  // Quiz assessment
  let assessment = assessmentGenerator.createAssessment(topics, 2, userProfile);
  console.log('Quiz Assessment:', {
    type: assessment.type,
    title: assessment.title,
    questionCount: assessment.questions.length,
    totalPoints: assessment.totalPoints,
    timeLimit: assessment.timeLimit
  });

  // Change to project assessment
  assessmentGenerator.setAssessmentStrategy(new ProjectAssessmentStrategy());
  assessment = assessmentGenerator.createAssessment(topics, 3, userProfile);
  console.log('Project Assessment:', {
    type: assessment.type,
    title: assessment.title,
    deliverables: assessment.deliverables,
    timeLimit: assessment.timeLimit,
    rubricCriteria: assessment.rubric.length
  });

  console.log('\n4. Dynamic Strategy Selection:');
  
  // Function to select grading strategy based on course type
  function selectGradingStrategy(courseType, studentLevel) {
    switch (courseType) {
      case 'certification':
        return new PassFailStrategy(80);
      case 'competency':
        return new CompetencyBasedStrategy(competencies);
      case 'traditional':
      default:
        const weights = studentLevel === 'advanced' 
          ? { assignments: 0.2, quizzes: 0.3, finalExam: 0.5 }
          : { assignments: 0.5, quizzes: 0.3, finalExam: 0.2 };
        return new WeightedAverageStrategy(weights);
    }
  }

  // Demonstrate dynamic selection
  const courses = [
    { type: 'traditional', level: 'beginner' },
    { type: 'traditional', level: 'advanced' },
    { type: 'certification', level: 'intermediate' },
    { type: 'competency', level: 'advanced' }
  ];

  courses.forEach((course, index) => {
    const strategy = selectGradingStrategy(course.type, course.level);
    gradeCalculator.setStrategy(strategy);
    const grade = gradeCalculator.calculateStudentGrade(studentScores);
    console.log(`Course ${index + 1} (${course.type}, ${course.level}):`, {
      strategy: strategy.getDescription(),
      finalGrade: grade.finalGrade,
      letterGrade: grade.letterGrade
    });
  });
}

module.exports = {
  // Grading strategies
  GradingStrategy,
  WeightedAverageStrategy,
  PassFailStrategy,
  CompetencyBasedStrategy,
  
  // Content delivery strategies
  ContentDeliveryStrategy,
  SequentialDeliveryStrategy,
  AdaptiveDeliveryStrategy,
  GameifiedDeliveryStrategy,
  
  // Assessment strategies
  AssessmentStrategy,
  QuizAssessmentStrategy,
  ProjectAssessmentStrategy,
  
  // Context classes
  GradeCalculator,
  ContentManager,
  AssessmentGenerator,
  
  // Demo function
  demonstrateStrategy
};