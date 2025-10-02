/**
 * Factory Pattern - Creates objects without specifying the exact class
 * Use case: Creating different types of learning content and assessments
 */

// Base Content class
class Content {
  constructor(title, duration) {
    this.title = title;
    this.duration = duration;
    this.createdAt = new Date();
  }

  getInfo() {
    return `${this.type}: ${this.title} (${this.duration} min)`;
  }

  start() {
    throw new Error('start() method must be implemented');
  }
}

// Concrete content types
class VideoContent extends Content {
  constructor(title, duration, videoUrl, resolution) {
    super(title, duration);
    this.type = 'Video';
    this.videoUrl = videoUrl;
    this.resolution = resolution;
  }

  start() {
    return `Starting video: ${this.title} at ${this.resolution} resolution`;
  }

  getVideoUrl() {
    return this.videoUrl;
  }
}

class TextContent extends Content {
  constructor(title, duration, wordCount, readingLevel) {
    super(title, duration);
    this.type = 'Text';
    this.wordCount = wordCount;
    this.readingLevel = readingLevel;
  }

  start() {
    return `Opening text content: ${this.title} (${this.wordCount} words)`;
  }

  getReadingInfo() {
    return { wordCount: this.wordCount, level: this.readingLevel };
  }
}

class QuizContent extends Content {
  constructor(title, duration, questions, passingScore) {
    super(title, duration);
    this.type = 'Quiz';
    this.questions = questions;
    this.passingScore = passingScore;
  }

  start() {
    return `Starting quiz: ${this.title} (${this.questions.length} questions)`;
  }

  getQuizInfo() {
    return { 
      questionCount: this.questions.length, 
      passingScore: this.passingScore 
    };
  }
}

class InteractiveContent extends Content {
  constructor(title, duration, interactionType, tools) {
    super(title, duration);
    this.type = 'Interactive';
    this.interactionType = interactionType;
    this.tools = tools;
  }

  start() {
    return `Launching interactive content: ${this.title} (${this.interactionType})`;
  }

  getInteractionInfo() {
    return { type: this.interactionType, tools: this.tools };
  }
}

// Factory class
class ContentFactory {
  static createContent(type, config) {
    switch (type.toLowerCase()) {
      case 'video':
        return new VideoContent(
          config.title,
          config.duration,
          config.videoUrl,
          config.resolution || '1080p'
        );
      
      case 'text':
        return new TextContent(
          config.title,
          config.duration,
          config.wordCount,
          config.readingLevel || 'intermediate'
        );
      
      case 'quiz':
        return new QuizContent(
          config.title,
          config.duration,
          config.questions || [],
          config.passingScore || 70
        );
      
      case 'interactive':
        return new InteractiveContent(
          config.title,
          config.duration,
          config.interactionType || 'simulation',
          config.tools || []
        );
      
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  // Factory method for creating content from templates
  static createFromTemplate(templateName, customConfig = {}) {
    const templates = {
      'intro-video': {
        type: 'video',
        title: 'Course Introduction',
        duration: 10,
        videoUrl: '/videos/intro.mp4',
        resolution: '720p'
      },
      'chapter-reading': {
        type: 'text',
        title: 'Chapter Reading',
        duration: 15,
        wordCount: 1500,
        readingLevel: 'intermediate'
      },
      'knowledge-check': {
        type: 'quiz',
        title: 'Knowledge Check',
        duration: 5,
        questions: [
          { question: 'Sample question?', options: ['A', 'B', 'C'], answer: 'A' }
        ],
        passingScore: 80
      },
      'coding-exercise': {
        type: 'interactive',
        title: 'Coding Exercise',
        duration: 30,
        interactionType: 'code-editor',
        tools: ['javascript', 'html', 'css']
      }
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    // Merge template with custom config
    const config = { ...template, ...customConfig };
    return this.createContent(config.type, config);
  }
}

// Course builder using factory
class CourseBuilder {
  constructor(courseName) {
    this.courseName = courseName;
    this.contents = [];
  }

  addContent(type, config) {
    const content = ContentFactory.createContent(type, config);
    this.contents.push(content);
    return this;
  }

  addFromTemplate(templateName, customConfig) {
    const content = ContentFactory.createFromTemplate(templateName, customConfig);
    this.contents.push(content);
    return this;
  }

  build() {
    return {
      courseName: this.courseName,
      contents: this.contents,
      totalDuration: this.contents.reduce((sum, content) => sum + content.duration, 0),
      contentCount: this.contents.length
    };
  }
}

// Usage example
function demonstrateFactory() {
  console.log('=== Factory Pattern Demo ===\n');

  // Creating individual content items
  console.log('1. Creating individual content items:');
  
  const video = ContentFactory.createContent('video', {
    title: 'JavaScript Basics',
    duration: 25,
    videoUrl: '/videos/js-basics.mp4',
    resolution: '1080p'
  });
  console.log(video.getInfo());
  console.log(video.start());
  
  const quiz = ContentFactory.createContent('quiz', {
    title: 'JavaScript Quiz',
    duration: 10,
    questions: [
      { question: 'What is a variable?', options: ['A', 'B', 'C'], answer: 'A' },
      { question: 'What is a function?', options: ['A', 'B', 'C'], answer: 'B' }
    ],
    passingScore: 75
  });
  console.log(quiz.getInfo());
  console.log(quiz.start());

  console.log('\n2. Creating from templates:');
  
  const introVideo = ContentFactory.createFromTemplate('intro-video', {
    title: 'Welcome to React Course'
  });
  console.log(introVideo.getInfo());
  console.log(introVideo.start());

  console.log('\n3. Building a complete course:');
  
  const course = new CourseBuilder('Full Stack Development')
    .addFromTemplate('intro-video', { title: 'Course Overview' })
    .addContent('text', {
      title: 'HTML Fundamentals',
      duration: 20,
      wordCount: 2000,
      readingLevel: 'beginner'
    })
    .addContent('interactive', {
      title: 'HTML Practice',
      duration: 45,
      interactionType: 'code-editor',
      tools: ['html', 'css']
    })
    .addFromTemplate('knowledge-check', { title: 'HTML Quiz' })
    .build();

  console.log(`Course: ${course.courseName}`);
  console.log(`Total Duration: ${course.totalDuration} minutes`);
  console.log(`Content Items: ${course.contentCount}`);
  console.log('\nContent List:');
  course.contents.forEach((content, index) => {
    console.log(`${index + 1}. ${content.getInfo()}`);
  });
}

module.exports = {
  Content,
  VideoContent,
  TextContent,
  QuizContent,
  InteractiveContent,
  ContentFactory,
  CourseBuilder,
  demonstrateFactory
};