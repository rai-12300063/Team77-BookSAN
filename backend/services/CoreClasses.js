/**
 * OOP Implementation with Design Patterns
 * This file demonstrates 5+ interacting classes with all OOP principles
 * and integrates 7+ design patterns for the learning management system
 */

/**
 * Abstract Base Class - Demonstrates ABSTRACTION and ENCAPSULATION
 * This class defines the contract for all learning content types
 */
class Content {
    // Private fields (ENCAPSULATION)
    #id;
    #title;
    #description;
    #duration;
    #createdAt;
    #accessCount;

    constructor(id, title, description, duration) {
        if (this.constructor === Content) {
            throw new Error("Abstract class Content cannot be instantiated directly");
        }
        
        // Encapsulated properties
        this.#id = id;
        this.#title = title;
        this.#description = description;
        this.#duration = duration;
        this.#createdAt = new Date();
        this.#accessCount = 0;
    }

    // Public getters (ENCAPSULATION)
    get id() { return this.#id; }
    get title() { return this.#title; }
    get description() { return this.#description; }
    get duration() { return this.#duration; }
    get createdAt() { return this.#createdAt; }
    get accessCount() { return this.#accessCount; }

    // Protected method for subclasses
    _incrementAccess() {
        this.#accessCount++;
    }

    // Abstract methods (ABSTRACTION) - must be implemented by subclasses
    render() {
        throw new Error("Method 'render()' must be implemented");
    }

    getContentType() {
        throw new Error("Method 'getContentType()' must be implemented");
    }

    calculateProgress(userInteraction) {
        throw new Error("Method 'calculateProgress()' must be implemented");
    }

    // Template Method Pattern - defines algorithm skeleton
    processContent(user) {
        this._validateUser(user);
        this._logAccess(user);
        this._incrementAccess();
        return this.render();
    }

    _validateUser(user) {
        if (!user || !user.id) {
            throw new Error("Valid user required to access content");
        }
    }

    _logAccess(user) {
        console.log(`User ${user.name} accessed ${this.getContentType()}: ${this.#title}`);
    }
}

/**
 * Concrete Video Content Class - Demonstrates INHERITANCE and POLYMORPHISM
 */
class VideoContent extends Content {
    #videoUrl;
    #resolution;
    #subtitles;

    constructor(id, title, description, duration, videoUrl, resolution = '1080p') {
        super(id, title, description, duration); // INHERITANCE
        this.#videoUrl = videoUrl;
        this.#resolution = resolution;
        this.#subtitles = [];
    }

    // POLYMORPHISM - overriding abstract methods
    render() {
        return {
            type: 'video',
            content: {
                url: this.#videoUrl,
                resolution: this.#resolution,
                title: this.title,
                duration: this.duration,
                subtitles: this.#subtitles
            }
        };
    }

    getContentType() {
        return 'video';
    }

    calculateProgress(userInteraction) {
        const watchedTime = userInteraction.watchedTime || 0;
        return Math.min((watchedTime / this.duration) * 100, 100);
    }

    // Video-specific methods
    addSubtitles(language, subtitleFile) {
        this.#subtitles.push({ language, file: subtitleFile });
    }

    changeResolution(newResolution) {
        this.#resolution = newResolution;
    }
}

/**
 * Interactive Quiz Content Class - Demonstrates INHERITANCE and POLYMORPHISM
 */
class QuizContent extends Content {
    #questions;
    #passingScore;
    #maxAttempts;

    constructor(id, title, description, duration, questions, passingScore = 70) {
        super(id, title, description, duration);
        this.#questions = questions || [];
        this.#passingScore = passingScore;
        this.#maxAttempts = 3;
    }

    // POLYMORPHISM - different implementation than VideoContent
    render() {
        return {
            type: 'quiz',
            content: {
                title: this.title,
                questions: this.#questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    options: q.options,
                    // Don't include correct answers in render
                })),
                passingScore: this.#passingScore,
                maxAttempts: this.#maxAttempts
            }
        };
    }

    getContentType() {
        return 'quiz';
    }

    calculateProgress(userInteraction) {
        const score = userInteraction.score || 0;
        return score >= this.#passingScore ? 100 : 0;
    }

    // Quiz-specific methods
    addQuestion(question) {
        this.#questions.push(question);
    }

    checkAnswers(userAnswers) {
        let correctCount = 0;
        this.#questions.forEach((question, index) => {
            if (question.correctAnswer === userAnswers[index]) {
                correctCount++;
            }
        });
        return (correctCount / this.#questions.length) * 100;
    }
}

/**
 * Learning Module Class - Demonstrates COMPOSITION and AGGREGATION
 * Uses Strategy Pattern for grading and Observer Pattern for progress tracking
 */
class LearningModule {
    #id;
    #title;
    #contents; // COMPOSITION - module contains content
    #prerequisites;
    #observers; // Observer Pattern
    #gradingStrategy; // Strategy Pattern

    constructor(id, title, gradingStrategy) {
        this.#id = id;
        this.#title = title;
        this.#contents = new Map(); // Using Map for better performance
        this.#prerequisites = [];
        this.#observers = [];
        this.#gradingStrategy = gradingStrategy;
    }

    get id() { return this.#id; }
    get title() { return this.#title; }

    // COMPOSITION - module manages its contents
    addContent(content) {
        if (!(content instanceof Content)) {
            throw new Error("Only Content instances can be added");
        }
        this.#contents.set(content.id, content);
        this.notifyObservers('content_added', { contentId: content.id });
    }

    removeContent(contentId) {
        const removed = this.#contents.delete(contentId);
        if (removed) {
            this.notifyObservers('content_removed', { contentId });
        }
        return removed;
    }

    getContent(contentId) {
        return this.#contents.get(contentId);
    }

    getAllContents() {
        return Array.from(this.#contents.values());
    }

    // Observer Pattern implementation
    addObserver(observer) {
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.#observers.indexOf(observer);
        if (index > -1) {
            this.#observers.splice(index, 1);
        }
    }

    notifyObservers(event, data) {
        this.#observers.forEach(observer => {
            if (typeof observer.update === 'function') {
                observer.update(event, { moduleId: this.#id, ...data });
            }
        });
    }

    // Strategy Pattern - delegates grading to strategy
    calculateGrade(userProgress) {
        return this.#gradingStrategy.calculate(userProgress);
    }

    // Prerequisites management
    addPrerequisite(moduleId) {
        this.#prerequisites.push(moduleId);
    }

    checkPrerequisites(completedModules) {
        return this.#prerequisites.every(prereq => 
            completedModules.includes(prereq)
        );
    }
}

/**
 * User Class - Demonstrates ENCAPSULATION and INHERITANCE
 * Base class for different types of users
 */
class User {
    #id;
    #name;
    #email;
    #role;
    #enrolledCourses;
    #progress;

    constructor(id, name, email, role) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#role = role;
        this.#enrolledCourses = new Set();
        this.#progress = new Map();
    }

    // ENCAPSULATION - controlled access to properties
    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }
    get role() { return this.#role; }

    enrollInCourse(courseId) {
        this.#enrolledCourses.add(courseId);
    }

    unenrollFromCourse(courseId) {
        this.#enrolledCourses.delete(courseId);
        this.#progress.delete(courseId);
    }

    isEnrolledIn(courseId) {
        return this.#enrolledCourses.has(courseId);
    }

    updateProgress(courseId, moduleId, progressData) {
        if (!this.#progress.has(courseId)) {
            this.#progress.set(courseId, new Map());
        }
        this.#progress.get(courseId).set(moduleId, progressData);
    }

    getProgress(courseId, moduleId = null) {
        const courseProgress = this.#progress.get(courseId);
        if (!courseProgress) return null;
        
        return moduleId ? courseProgress.get(moduleId) : courseProgress;
    }

    // Abstract method for subclasses to implement
    getPermissions() {
        throw new Error("Method 'getPermissions()' must be implemented by subclass");
    }
}

/**
 * Student Class - Demonstrates INHERITANCE and POLYMORPHISM
 */
class Student extends User {
    #studyStreak;
    #preferences;

    constructor(id, name, email) {
        super(id, name, email, 'student'); // INHERITANCE
        this.#studyStreak = 0;
        this.#preferences = {
            notifications: true,
            difficulty: 'intermediate',
            learningStyle: 'visual'
        };
    }

    // POLYMORPHISM - specific implementation for students
    getPermissions() {
        return [
            'view_courses',
            'enroll_courses', 
            'submit_assignments',
            'view_progress',
            'participate_discussions'
        ];
    }

    updateStudyStreak() {
        this.#studyStreak++;
    }

    resetStudyStreak() {
        this.#studyStreak = 0;
    }

    get studyStreak() { return this.#studyStreak; }

    setPreference(key, value) {
        this.#preferences[key] = value;
    }

    getPreferences() {
        return { ...this.#preferences };
    }
}

/**
 * Instructor Class - Demonstrates INHERITANCE and POLYMORPHISM
 */
class Instructor extends User {
    #courses;
    #specializations;

    constructor(id, name, email) {
        super(id, name, email, 'instructor');
        this.#courses = new Set();
        this.#specializations = [];
    }

    // POLYMORPHISM - different permissions than Student
    getPermissions() {
        return [
            'create_courses',
            'edit_courses',
            'view_all_progress',
            'grade_assignments',
            'manage_modules',
            'create_assessments'
        ];
    }

    addCourse(courseId) {
        this.#courses.add(courseId);
    }

    removeCourse(courseId) {
        this.#courses.delete(courseId);
    }

    canManageCourse(courseId) {
        return this.#courses.has(courseId);
    }

    addSpecialization(specialization) {
        this.#specializations.push(specialization);
    }

    get specializations() {
        return [...this.#specializations];
    }
}

/**
 * Course Management System - Demonstrates FACADE PATTERN
 * Provides simplified interface to complex subsystem
 */
class LearningManagementSystem {
    #courses;
    #users;
    #contentFactory; // Factory Pattern
    #userFactory; // Factory Pattern
    #progressObserver; // Observer Pattern

    constructor() {
        this.#courses = new Map();
        this.#users = new Map();
        // Lazy initialization to avoid circular imports
        this.#contentFactory = null;
        this.#userFactory = null;
        this.#progressObserver = null;
    }

    getContentFactory() {
        if (!this.#contentFactory) {
            const { ContentFactory } = require('./DesignPatterns');
            this.#contentFactory = new ContentFactory();
        }
        return this.#contentFactory;
    }

    getUserFactory() {
        if (!this.#userFactory) {
            const { UserFactory } = require('./DesignPatterns');
            this.#userFactory = new UserFactory();
        }
        return this.#userFactory;
    }

    getProgressObserver() {
        if (!this.#progressObserver) {
            const { ProgressTracker } = require('./DesignPatterns');
            this.#progressObserver = new ProgressTracker();
        }
        return this.#progressObserver;
    }

    // Facade methods - simple interface to complex operations
    createUser(type, userData) {
        const user = this.getUserFactory().createUser(type, userData);
        this.#users.set(user.id, user);
        return user;
    }

    createCourse(courseData) {
        const course = {
            id: courseData.id,
            title: courseData.title,
            modules: new Map(),
            instructor: courseData.instructorId
        };
        
        this.#courses.set(course.id, course);
        return course;
    }

    enrollStudent(userId, courseId) {
        const user = this.#users.get(userId);
        const course = this.#courses.get(courseId);
        
        if (!user || !course) {
            throw new Error("User or course not found");
        }
        
        user.enrollInCourse(courseId);
        return true;
    }

    addModuleToCourse(courseId, moduleData) {
        const course = this.#courses.get(courseId);
        if (!course) {
            throw new Error("Course not found");
        }

        // Get grading strategy lazily to avoid circular imports
        const { WeightedGradingStrategy } = require('./DesignPatterns');
        
        const module = new LearningModule(
            moduleData.id, 
            moduleData.title, 
            new WeightedGradingStrategy()
        );
        
        module.addObserver(this.getProgressObserver());
        course.modules.set(module.id, module);
        
        return module;
    }

    addContentToModule(courseId, moduleId, contentData) {
        const course = this.#courses.get(courseId);
        if (!course) {
            throw new Error("Course not found");
        }

        const module = course.modules.get(moduleId);
        if (!module) {
            throw new Error("Module not found");
        }

        const content = this.getContentFactory().createContent(
            contentData.type, 
            contentData
        );
        
        module.addContent(content);
        return content;
    }

    getStudentProgress(userId, courseId) {
        const user = this.#users.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        return user.getProgress(courseId);
    }
}

module.exports = {
    Content,
    VideoContent,
    QuizContent,
    LearningModule,
    User,
    Student,
    Instructor,
    LearningManagementSystem
};