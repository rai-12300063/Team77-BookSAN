/**
 * Adapter Pattern - Allows incompatible interfaces to work together
 * Use case: Adapting different course data sources (internal, external APIs)
 */

// Legacy internal course format
class InternalCourse {
  constructor(id, name, instructor, lessons) {
    this.id = id;
    this.name = name;
    this.instructor = instructor;
    this.lessons = lessons;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      instructor: this.instructor,
      totalLessons: this.lessons.length
    };
  }
}

// External API course format (incompatible structure)
class ExternalCourse {
  constructor(courseId, title, teacher, modules) {
    this.courseId = courseId;
    this.title = title;
    this.teacher = teacher;
    this.modules = modules;
  }

  getCourseData() {
    return {
      id: this.courseId,
      courseName: this.title,
      teacherName: this.teacher,
      moduleCount: this.modules.length
    };
  }
}

// Adapter to make ExternalCourse compatible with InternalCourse interface
class ExternalCourseAdapter {
  constructor(externalCourse) {
    this.externalCourse = externalCourse;
  }

  getInfo() {
    const externalData = this.externalCourse.getCourseData();
    
    // Adapt external format to internal format
    return {
      id: externalData.id,
      name: externalData.courseName,
      instructor: externalData.teacherName,
      totalLessons: externalData.moduleCount
    };
  }
}

// Course manager that works with adapted courses
class CourseManager {
  constructor() {
    this.courses = [];
  }

  addCourse(course) {
    this.courses.push(course);
  }

  listCourses() {
    return this.courses.map(course => course.getInfo());
  }
}

// Usage example
function demonstrateAdapter() {
  const courseManager = new CourseManager();

  // Internal course (works directly)
  const internalCourse = new InternalCourse(
    1, 
    'JavaScript Fundamentals', 
    'John Doe', 
    ['Variables', 'Functions', 'Objects']
  );

  // External course (needs adapter)
  const externalCourse = new ExternalCourse(
    101, 
    'Python Basics', 
    'Jane Smith', 
    ['Syntax', 'Data Types', 'Control Flow']
  );

  // Add courses to manager
  courseManager.addCourse(internalCourse);
  courseManager.addCourse(new ExternalCourseAdapter(externalCourse));

  console.log('All courses:', courseManager.listCourses());
}

module.exports = {
  InternalCourse,
  ExternalCourse,
  ExternalCourseAdapter,
  CourseManager,
  demonstrateAdapter
};