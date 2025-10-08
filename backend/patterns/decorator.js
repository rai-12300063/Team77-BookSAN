/**
 * Decorator Pattern - Enhances functionality of objects dynamically
 * Use case: Adding features to courses (certification analytics)
 */

// Base Course interface
class Course {
  constructor(title, price) {
    this.title = title;
    this.price = price;
  }

  getDescription() {
    return `Course: ${this.title}`;
  }

  getPrice() {
    return this.price;
  }

  getFeatures() {
    return ['Basic content access'];
  }
}

// Base decorator
class CourseDecorator extends Course {
  constructor(course) {
    super(course.title, course.price);
    this.course = course;
  }

  getDescription() {
    return this.course.getDescription();
  }

  getPrice() {
    return this.course.getPrice();
  }

  getFeatures() {
    return this.course.getFeatures();
  }
}

// Concrete decorators
class CertificationDecorator extends CourseDecorator {
  constructor(course) {
    super(course);
  }

  getDescription() {
    return `${this.course.getDescription()} + Certification`;
  }

  getPrice() {
    return this.course.getPrice() + 50; // Add certification fee
  }

  getFeatures() {
    return [...this.course.getFeatures(), 'Certificate of completion'];
  }
}

class PremiumAccessDecorator extends CourseDecorator {
  constructor(course) {
    super(course);
  }

  getDescription() {
    return `${this.course.getDescription()} + Premium Access`;
  }

  getPrice() {
    return this.course.getPrice() + 30; // Add premium fee
  }

  getFeatures() {
    return [...this.course.getFeatures(), 'Premium content', '1-on-1 support'];
  }
}

class AnalyticsDecorator extends CourseDecorator {
  constructor(course) {
    super(course);
  }

  getDescription() {
    return `${this.course.getDescription()} + Analytics`;
  }

  getPrice() {
    return this.course.getPrice() + 20; // Add analytics fee
  }

  getFeatures() {
    return [...this.course.getFeatures(), 'Detailed progress analytics', 'Performance insights'];
  }
}

class DownloadableContentDecorator extends CourseDecorator {
  constructor(course) {
    super(course);
  }

  getDescription() {
    return `${this.course.getDescription()} + Downloadable Content`;
  }

  getPrice() {
    return this.course.getPrice() + 15; // Add download fee
  }

  getFeatures() {
    return [...this.course.getFeatures(), 'Offline content download', 'PDF materials'];
  }
}

// Usage example
function demonstrateDecorator() {
  // Basic course
  let course = new Course('React Fundamentals', 100);
  console.log('Basic Course:');
  console.log(`Description: ${course.getDescription()}`);
  console.log(`Price: $${course.getPrice()}`);
  console.log(`Features: ${course.getFeatures().join(', ')}`);
  console.log('---');

  // Add certification
  course = new CertificationDecorator(course);
  console.log('With Certification:');
  console.log(`Description: ${course.getDescription()}`);
  console.log(`Price: $${course.getPrice()}`);
  console.log(`Features: ${course.getFeatures().join(', ')}`);
  console.log('---');

  // Add premium access
  course = new PremiumAccessDecorator(course);
  console.log('With Premium Access:');
  console.log(`Description: ${course.getDescription()}`);
  console.log(`Price: $${course.getPrice()}`);
  console.log(`Features: ${course.getFeatures().join(', ')}`);
  console.log('---');

  // Add analytics
  course = new AnalyticsDecorator(course);
  console.log('With Analytics:');
  console.log(`Description: ${course.getDescription()}`);
  console.log(`Price: $${course.getPrice()}`);
  console.log(`Features: ${course.getFeatures().join(', ')}`);
  console.log('---');

  // Add downloadable content
  course = new DownloadableContentDecorator(course);
  console.log('Fully Loaded Course:');
  console.log(`Description: ${course.getDescription()}`);
  console.log(`Price: $${course.getPrice()}`);
  console.log(`Features: ${course.getFeatures().join(', ')}`);
}

module.exports = {
  Course,
  CourseDecorator,
  CertificationDecorator,
  PremiumAccessDecorator,
  AnalyticsDecorator,
  DownloadableContentDecorator,
  demonstrateDecorator
};