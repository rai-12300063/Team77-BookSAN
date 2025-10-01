/**
 * Enhanced Patterns Routes - Additional design patterns demonstrations
 * Provides comprehensive API endpoints for 10+ design patterns
 */

const express = require('express');
const router = express.Router();
const enhancedPatternsController = require('../controllers/enhancedPatternsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route GET /api/patterns/demo/all
 * @desc Demonstrate all 10 design patterns
 * @access Public
 */
router.get('/demo/all', enhancedPatternsController.demonstrateAll);

/**
 * @route GET /api/patterns/demo/:pattern
 * @desc Demonstrate a specific design pattern
 * @access Public
 * @param {string} pattern - Pattern name (adapter, decorator, facade, factory, middleware, observer, prototype, proxy, singleton, strategy)
 */
router.get('/demo/:pattern', enhancedPatternsController.demonstrateSpecific);

/**
 * @route GET /api/patterns/test
 * @desc Run comprehensive pattern test suite
 * @access Public
 */
router.get('/test', enhancedPatternsController.runPatternTests);

/**
 * @route GET /api/patterns/list
 * @desc Get comprehensive list of all patterns with descriptions
 * @access Public
 */
router.get('/list', enhancedPatternsController.getPatternsList);

/**
 * @route GET /api/patterns/compare
 * @desc Compare different pattern implementations (OOP vs Additional)
 * @access Public
 */
router.get('/compare', enhancedPatternsController.comparePatterns);

/**
 * Individual Pattern Test Routes
 */

/**
 * @route GET /api/patterns/test/factory
 * @desc Test Factory pattern specifically
 * @access Public
 */
router.get('/test/factory', async (req, res) => {
    try {
        const { demonstrateFactory } = require('../patterns/factory');
        
        // Capture output
        const originalLog = console.log;
        let output = [];
        console.log = (...args) => {
            output.push(args.join(' '));
            originalLog(...args);
        };

        await demonstrateFactory();
        console.log = originalLog;

        res.json({
            success: true,
            message: 'Factory pattern test completed',
            data: {
                pattern: 'Factory Pattern',
                category: 'Creational',
                output: output
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Factory pattern test failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/patterns/test/observer
 * @desc Test Observer pattern specifically
 * @access Public
 */
router.get('/test/observer', async (req, res) => {
    try {
        const { demonstrateObserver } = require('../patterns/observer');
        
        // Capture output
        const originalLog = console.log;
        let output = [];
        console.log = (...args) => {
            output.push(args.join(' '));
            originalLog(...args);
        };

        await demonstrateObserver();
        console.log = originalLog;

        res.json({
            success: true,
            message: 'Observer pattern test completed',
            data: {
                pattern: 'Observer Pattern',
                category: 'Behavioral',
                output: output
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Observer pattern test failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/patterns/test/decorator
 * @desc Test Decorator pattern specifically
 * @access Public
 */
router.get('/test/decorator', async (req, res) => {
    try {
        const { demonstrateDecorator } = require('../patterns/decorator');
        
        // Capture output  
        const originalLog = console.log;
        let output = [];
        console.log = (...args) => {
            output.push(args.join(' '));
            originalLog(...args);
        };

        await demonstrateDecorator();
        console.log = originalLog;

        res.json({
            success: true,
            message: 'Decorator pattern test completed',
            data: {
                pattern: 'Decorator Pattern',
                category: 'Structural',
                output: output
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Decorator pattern test failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/patterns/test/singleton
 * @desc Test Singleton pattern specifically
 * @access Public
 */
router.get('/test/singleton', async (req, res) => {
    try {
        const { demonstrateSingleton } = require('../patterns/singleton');
        
        // Capture output
        const originalLog = console.log;
        let output = [];
        console.log = (...args) => {
            output.push(args.join(' '));
            originalLog(...args);
        };

        await demonstrateSingleton();
        console.log = originalLog;

        res.json({
            success: true,
            message: 'Singleton pattern test completed',
            data: {
                pattern: 'Singleton Pattern',
                category: 'Creational',
                output: output
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Singleton pattern test failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/patterns/test/strategy
 * @desc Test Strategy pattern specifically
 * @access Public
 */
router.get('/test/strategy', async (req, res) => {
    try {
        const { demonstrateStrategy } = require('../patterns/strategy');
        
        // Capture output
        const originalLog = console.log;
        let output = [];
        console.log = (...args) => {
            output.push(args.join(' '));
            originalLog(...args);
        };

        await demonstrateStrategy();
        console.log = originalLog;

        res.json({
            success: true,
            message: 'Strategy pattern test completed',
            data: {
                pattern: 'Strategy Pattern',
                category: 'Behavioral',
                output: output
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Strategy pattern test failed',
            error: error.message
        });
    }
});

/**
 * Educational Routes - Interactive pattern learning
 */

/**
 * @route GET /api/patterns/learn/:pattern
 * @desc Get educational information about a specific pattern
 * @access Public
 */
router.get('/learn/:pattern', async (req, res) => {
    try {
        const { pattern } = req.params;
        
        const patternInfo = {
            adapter: {
                name: 'Adapter Pattern',
                category: 'Structural',
                intent: 'Convert the interface of a class into another interface clients expect',
                motivation: 'Allows classes with incompatible interfaces to work together',
                structure: 'Client -> Adapter -> Adaptee',
                participants: ['Target', 'Adapter', 'Adaptee', 'Client'],
                use_cases: ['Legacy system integration', 'Third-party library integration', 'API compatibility'],
                example: 'Integrating external learning platforms with different APIs'
            },
            factory: {
                name: 'Factory Pattern',
                category: 'Creational',
                intent: 'Create objects without specifying the exact class to create',
                motivation: 'Provides an interface for creating families of related objects',
                structure: 'Client -> Factory -> ConcreteProduct',
                participants: ['Creator', 'ConcreteCreator', 'Product', 'ConcreteProduct'],
                use_cases: ['Object creation based on parameters', 'Plugin architecture', 'Dependency injection'],
                example: 'Creating different types of learning content (video, quiz, text)'
            },
            observer: {
                name: 'Observer Pattern',
                category: 'Behavioral',
                intent: 'Define a one-to-many dependency between objects',
                motivation: 'When one object changes state, all dependents are notified automatically',
                structure: 'Subject -> Observer -> ConcreteObserver',
                participants: ['Subject', 'Observer', 'ConcreteSubject', 'ConcreteObserver'],
                use_cases: ['Event handling', 'Model-View architectures', 'Notification systems'],
                example: 'Progress tracking and notification when students complete content'
            },
            singleton: {
                name: 'Singleton Pattern',
                category: 'Creational',
                intent: 'Ensure a class has only one instance and provide global access',
                motivation: 'Control access to shared resources like configuration or logging',
                structure: 'Client -> Singleton (single instance)',
                participants: ['Singleton'],
                use_cases: ['Configuration management', 'Logging', 'Connection pools'],
                example: 'Application configuration and system-wide settings management'
            },
            strategy: {
                name: 'Strategy Pattern',
                category: 'Behavioral',
                intent: 'Define a family of algorithms and make them interchangeable',
                motivation: 'Lets the algorithm vary independently from clients that use it',
                structure: 'Context -> Strategy -> ConcreteStrategy',
                participants: ['Strategy', 'ConcreteStrategy', 'Context'],
                use_cases: ['Different algorithms for same problem', 'Runtime algorithm selection', 'Payment processing'],
                example: 'Different grading strategies (weighted, pass/fail, curved)'
            }
        };

        const info = patternInfo[pattern.toLowerCase()];
        
        if (!info) {
            return res.status(404).json({
                success: false,
                message: 'Pattern not found',
                available_patterns: Object.keys(patternInfo)
            });
        }

        res.json({
            success: true,
            message: `Educational information for ${info.name}`,
            data: {
                pattern_info: info,
                demo_endpoint: `/api/patterns/demo/${pattern}`,
                test_endpoint: `/api/patterns/test/${pattern}`
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pattern information',
            error: error.message
        });
    }
});

/**
 * Error handling middleware for enhanced patterns routes
 */
router.use((error, req, res, next) => {
    console.error('Enhanced Patterns Route Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error in enhanced patterns system',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;