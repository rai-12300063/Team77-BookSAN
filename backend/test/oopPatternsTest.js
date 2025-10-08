const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Import controllers and services
const authController = require('../controllers/authController');
const courseController = require('../controllers/courseController');
const moduleController = require('../controllers/moduleController');
const quizController = require('../controllers/quizController');
const progressController = require('../controllers/progressController');

// Import any patterns
const patterns = require('../patterns');

chai.use(chaiHttp);

describe('Advanced OOP and Design Patterns Tests', function() {

  before(function() {
    console.log('Setting up OOP and Design Pattern tests...');
  });

  after(function() {
    console.log('Completed OOP and Design Pattern tests.');
    sinon.restore();
  });

  beforeEach(function() {
    sinon.restore();
  });

  describe('Singleton Pattern Tests', function() {
    it('should create only one instance of a singleton', function() {
      // Get singleton instance
      const instance1 = patterns.singleton.getInstance();
      const instance2 = patterns.singleton.getInstance();
      
      // Expect both instances to be the same object
      expect(instance1).to.equal(instance2);
    });
    
    it('should maintain state across singleton instances', function() {
      const instance1 = patterns.singleton.getInstance();
      instance1.setValue('test-value');
      
      const instance2 = patterns.singleton.getInstance();
      expect(instance2.getValue()).to.equal('test-value');
    });
  });

  describe('Factory Pattern Tests', function() {
    it('should create different objects based on type parameter', function() {
      const studentObject = patterns.factory.createUser('student', { name: 'Student Name' });
      const instructorObject = patterns.factory.createUser('instructor', { name: 'Instructor Name' });
      
      // Check if the created objects have different types/properties
      expect(studentObject.type).to.equal('student');
      expect(instructorObject.type).to.equal('instructor');
      expect(studentObject.constructor).to.not.equal(instructorObject.constructor);
    });
    
    it('should apply appropriate behaviors to created objects', function() {
      const studentObject = patterns.factory.createUser('student', { name: 'Student Name' });
      const instructorObject = patterns.factory.createUser('instructor', { name: 'Instructor Name' });
      
      // Test object-specific methods
      expect(studentObject.canEnrollInCourse).to.be.a('function');
      expect(instructorObject.canCreateCourse).to.be.a('function');
    });
  });

  describe('Observer Pattern Tests', function() {
    it('should notify all observers when subject state changes', function() {
      const subject = new patterns.observer.Subject();
      
      // Create mock observers with spies
      const observer1 = { update: sinon.spy() };
      const observer2 = { update: sinon.spy() };
      
      // Add observers
      subject.addObserver(observer1);
      subject.addObserver(observer2);
      
      // Change state and notify
      subject.setState('new state');
      
      // Verify all observers were notified
      expect(observer1.update.calledOnce).to.be.true;
      expect(observer2.update.calledOnce).to.be.true;
      expect(observer1.update.calledWith('new state')).to.be.true;
      expect(observer2.update.calledWith('new state')).to.be.true;
    });
    
    it('should not notify removed observers', function() {
      const subject = new patterns.observer.Subject();
      
      // Create mock observers with spies
      const observer1 = { update: sinon.spy() };
      const observer2 = { update: sinon.spy() };
      
      // Add observers
      subject.addObserver(observer1);
      subject.addObserver(observer2);
      
      // Remove one observer
      subject.removeObserver(observer1);
      
      // Change state and notify
      subject.setState('another state');
      
      // Verify only observer2 was notified
      expect(observer1.update.called).to.be.false;
      expect(observer2.update.calledOnce).to.be.true;
    });
  });

  describe('Strategy Pattern Tests', function() {
    it('should execute different strategies based on context', function() {
      // Create context with initial strategy
      const context = new patterns.strategy.Context(new patterns.strategy.BasicQuizStrategy());
      
      // Execute with basic strategy
      const basicResult = context.executeStrategy('quiz data');
      expect(basicResult).to.include('basic');
      
      // Change strategy
      context.setStrategy(new patterns.strategy.AdvancedQuizStrategy());
      
      // Execute with advanced strategy
      const advancedResult = context.executeStrategy('quiz data');
      expect(advancedResult).to.include('advanced');
    });
  });

  describe('Decorator Pattern Tests', function() {
    it('should enhance object behavior with decorators', function() {
      // Create base component
      const baseComponent = new patterns.decorator.BasicCourse('Programming 101');
      expect(baseComponent.getDescription()).to.equal('Programming 101');
      expect(baseComponent.getCost()).to.equal(100); // Assume base cost of 100
      
      // Add decorators
      const withVideos = new patterns.decorator.WithVideos(baseComponent);
      expect(withVideos.getDescription()).to.equal('Programming 101, with video lessons');
      expect(withVideos.getCost()).to.be.greaterThan(100);
      
      // Add more decorators
      const withCertificate = new patterns.decorator.WithCertificate(withVideos);
      expect(withCertificate.getDescription()).to.equal('Programming 101, with video lessons, with certificate');
      expect(withCertificate.getCost()).to.be.greaterThan(withVideos.getCost());
    });
  });

  describe('Adapter Pattern Tests', function() {
    it('should adapt one interface to another', function() {
      // Create old system object
      const legacySystem = {
        fetchUserDetails: function(id) {
          return { userId: id, userName: 'Legacy User', role: 'student' };
        }
      };
      
      // Create adapter
      const adapter = new patterns.adapter.LegacySystemAdapter(legacySystem);
      
      // Test the adapted interface
      const result = adapter.getUserInfo('123');
      expect(result).to.have.property('id');
      expect(result).to.have.property('name');
      expect(result).to.have.property('role');
    });
  });

  describe('Facade Pattern Tests', function() {
    it('should provide a simplified interface to complex subsystems', function() {
      // Create spy subsystems
      const enrollmentSystem = { enrollStudent: sinon.spy() };
      const notificationSystem = { sendNotification: sinon.spy() };
      const progressSystem = { initializeProgress: sinon.spy() };
      
      // Create facade with the subsystems
      const facade = new patterns.facade.CourseFacade(
        enrollmentSystem, 
        notificationSystem, 
        progressSystem
      );
      
      // Use the facade
      facade.enrollStudentInCourse('student1', 'course1');
      
      // Verify all subsystems were called correctly
      expect(enrollmentSystem.enrollStudent.calledWith('student1', 'course1')).to.be.true;
      expect(notificationSystem.sendNotification.called).to.be.true;
      expect(progressSystem.initializeProgress.calledWith('student1', 'course1')).to.be.true;
    });
  });

  describe('Proxy Pattern Tests', function() {
    it('should control access to the subject object', function() {
      // Create a real subject
      const realCourse = { getDetails: () => 'Course details' };
      
      // Create a proxy with access control
      const proxy = new patterns.proxy.CourseProxy(realCourse);
      
      // Set up the proxy with permissions
      proxy.setPermissions('student1', true);
      
      // Test access granted
      const resultGranted = proxy.getDetails('student1');
      expect(resultGranted).to.equal('Course details');
      
      // Test access denied
      const resultDenied = proxy.getDetails('student2');
      expect(resultDenied).to.not.equal('Course details');
      expect(resultDenied).to.include('denied');
    });
  });

  describe('Prototype Pattern Tests', function() {
    it('should clone objects with their properties', function() {
      // Create a prototype course
      const prototypeCourse = new patterns.prototype.CoursePrototype();
      prototypeCourse.setTitle('JavaScript Basics');
      prototypeCourse.setDescription('Learn JS fundamentals');
      prototypeCourse.addModule('Variables and Data Types');
      
      // Clone the prototype
      const clonedCourse = prototypeCourse.clone();
      
      // Verify the clone has the same properties
      expect(clonedCourse.getTitle()).to.equal('JavaScript Basics');
      expect(clonedCourse.getDescription()).to.equal('Learn JS fundamentals');
      expect(clonedCourse.getModules()).to.include('Variables and Data Types');
      
      // Verify it's a different object (not the same reference)
      expect(clonedCourse).to.not.equal(prototypeCourse);
    });
  });

  describe('OOP Implementation Tests', function() {
    it('should demonstrate inheritance with proper method overriding', function() {
      // Assuming a User base class and Student/Instructor subclasses
      const student = new patterns.oop.Student('John', 'john@example.com');
      const instructor = new patterns.oop.Instructor('Jane', 'jane@example.com');
      
      // Test inheritance
      expect(student instanceof patterns.oop.User).to.be.true;
      expect(instructor instanceof patterns.oop.User).to.be.true;
      
      // Test specific methods
      expect(student.getRole()).to.equal('student');
      expect(instructor.getRole()).to.equal('instructor');
      
      // Test overridden methods
      expect(student.getDetails()).to.not.equal(instructor.getDetails());
    });
    
    it('should demonstrate polymorphism with different behaviors', function() {
      // Create array of different user types
      const users = [
        new patterns.oop.Student('Student1', 'student1@example.com'),
        new patterns.oop.Instructor('Instructor1', 'instructor1@example.com'),
        new patterns.oop.Admin('Admin1', 'admin1@example.com')
      ];
      
      // Test polymorphic behavior
      users.forEach(user => {
        expect(user.getDetails()).to.be.a('string');
        expect(user.canAccessCourse).to.be.a('function');
        
        // Different behaviors based on type
        if (user instanceof patterns.oop.Student) {
          expect(user.canEnrollInCourse()).to.be.true;
          expect(user.canCreateCourse()).to.be.false;
        } else if (user instanceof patterns.oop.Instructor) {
          expect(user.canCreateCourse()).to.be.true;
        } else if (user instanceof patterns.oop.Admin) {
          expect(user.canManageUsers()).to.be.true;
        }
      });
    });
    
    it('should demonstrate encapsulation with private properties', function() {
      // Create a user with private properties
      const user = new patterns.oop.User('Test User', 'test@example.com');
      
      // Should have getters but not direct access to properties
      expect(user.getName()).to.equal('Test User');
      expect(user.getEmail()).to.equal('test@example.com');
      
      // Direct property access should be undefined or throw error
      expect(user._name).to.be.undefined;
      expect(user._email).to.be.undefined;
    });
  });
});