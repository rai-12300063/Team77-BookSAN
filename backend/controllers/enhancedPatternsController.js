/**
 * Enhanced Patterns Controller - Integrates additional design patterns with Express.js
 * Provides demonstrations for 10+ design patterns
 */

// Note: External pattern dependencies removed for standalone operation

/**
 * Enhanced Patterns Controller
 * Manages both OOP patterns and additional pattern demonstrations
 */
class EnhancedPatternsController {
    constructor() {
        // Bind methods to preserve 'this' context
        this.demonstrateAll = this.demonstrateAll.bind(this);
        this.demonstrateSpecific = this.demonstrateSpecific.bind(this);
        this.runPatternTests = this.runPatternTests.bind(this);
        this.getPatternsList = this.getPatternsList.bind(this);
        this.comparePatterns = this.comparePatterns.bind(this);
    }

    /**
     * GET /api/patterns/demo/all
     * Demonstrate all available design patterns
     */
    async demonstrateAll(req, res) {
        try {
            console.log('🚀 Running comprehensive patterns demonstration...');
            
            // Capture console output for API response
            const originalLog = console.log;
            let output = [];
            
            console.log = (...args) => {
                output.push(args.join(' '));
                originalLog(...args);
            };

            await demonstrateAllPatterns();
            
            // Restore original console.log
            console.log = originalLog;

            res.json({
                success: true,
                message: 'All design patterns demonstrated successfully',
                data: {
                    total_patterns: 10,
                    execution_output: output,
                    patterns_demonstrated: [
                        'Adapter Pattern - Interface compatibility',
                        'Decorator Pattern - Dynamic feature enhancement', 
                        'Facade Pattern - Simplified complex operations',
                        'Factory Pattern - Object creation abstraction',
                        'Middleware Pattern - Request/response pipeline',
                        'Observer Pattern - Event-driven notifications',
                        'Prototype Pattern - Object cloning and templates',
                        'Proxy Pattern - Access control and caching',
                        'Singleton Pattern - Single instance management',
                        'Strategy Pattern - Interchangeable algorithms'
                    ]
                }
            });

        } catch (error) {
            console.error('Error in patterns demonstration:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to demonstrate patterns',
                error: error.message
            });
        }
    }

    /**
     * GET /api/patterns/demo/:pattern
     * Demonstrate a specific design pattern
     */
    async demonstrateSpecific(req, res) {
        try {
            const { pattern } = req.params;
            
            const validPatterns = [
                'adapter', 'decorator', 'facade', 'factory', 'middleware',
                'observer', 'prototype', 'proxy', 'singleton', 'strategy'
            ];

            if (!validPatterns.includes(pattern.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pattern name',
                    valid_patterns: validPatterns
                });
            }

            console.log(`🎯 Demonstrating ${pattern} pattern...`);
            
            // Capture console output
            const originalLog = console.log;
            let output = [];
            
            console.log = (...args) => {
                output.push(args.join(' '));
                originalLog(...args);
            };

            await demoSpecificPattern(pattern.toLowerCase());
            
            // Restore original console.log
            console.log = originalLog;

            res.json({
                success: true,
                message: `${pattern} pattern demonstrated successfully`,
                data: {
                    pattern: pattern,
                    execution_output: output,
                    pattern_category: this.getPatternCategory(pattern)
                }
            });

        } catch (error) {
            console.error(`Error demonstrating ${req.params.pattern} pattern:`, error);
            res.status(500).json({
                success: false,
                message: `Failed to demonstrate ${req.params.pattern} pattern`,
                error: error.message
            });
        }
    }

    /**
     * GET /api/patterns/test
     * Run pattern test suite
     */
    async runPatternTests(req, res) {
        try {
            const patterns = [
                'adapter', 'decorator', 'facade', 'factory', 'middleware',
                'observer', 'prototype', 'proxy', 'singleton', 'strategy'
            ];

            const results = [];
            let passedTests = 0;
            let failedTests = 0;

            for (const pattern of patterns) {
                try {
                    await demoSpecificPattern(pattern);
                    results.push({
                        pattern: pattern,
                        status: 'PASSED',
                        error: null
                    });
                    passedTests++;
                } catch (error) {
                    results.push({
                        pattern: pattern,
                        status: 'FAILED',
                        error: error.message
                    });
                    failedTests++;
                }
            }

            const summary = {
                total_patterns: patterns.length,
                passed: passedTests,
                failed: failedTests,
                success_rate: `${Math.round((passedTests / patterns.length) * 100)}%`
            };

            res.json({
                success: failedTests === 0,
                message: `Pattern tests completed. ${passedTests}/${patterns.length} patterns passed.`,
                data: {
                    summary,
                    results
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to run pattern tests',
                error: error.message
            });
        }
    }

    /**
     * GET /api/patterns/list
     * Get comprehensive list of all patterns with descriptions
     */
    async getPatternsList(req, res) {
        try {
            const patterns = {
                creational: [
                    {
                        name: 'Factory Pattern',
                        description: 'Creates objects without specifying the exact class to create',
                        use_case: 'Creating different types of learning content and assessments',
                        endpoint: '/api/patterns/demo/factory',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Prototype Pattern', 
                        description: 'Creates objects by cloning existing instances',
                        use_case: 'Template-based course and assessment creation',
                        endpoint: '/api/patterns/demo/prototype',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Singleton Pattern',
                        description: 'Ensures a class has only one instance',
                        use_case: 'Configuration management and logging systems',
                        endpoint: '/api/patterns/demo/singleton',
                        complexity: 'Easy'
                    }
                ],
                structural: [
                    {
                        name: 'Adapter Pattern',
                        description: 'Allows incompatible interfaces to work together',
                        use_case: 'Integrating external learning platforms and APIs',
                        endpoint: '/api/patterns/demo/adapter',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Decorator Pattern',
                        description: 'Adds behavior to objects dynamically',
                        use_case: 'Adding features to courses and content without modification',
                        endpoint: '/api/patterns/demo/decorator',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Facade Pattern',
                        description: 'Provides a simplified interface to complex subsystems',
                        use_case: 'Simplifying complex learning management operations',
                        endpoint: '/api/patterns/demo/facade',
                        complexity: 'Easy'
                    },
                    {
                        name: 'Proxy Pattern',
                        description: 'Controls access to objects and adds functionality',
                        use_case: 'Content access control and caching mechanisms',
                        endpoint: '/api/patterns/demo/proxy',
                        complexity: 'Medium'
                    }
                ],
                behavioral: [
                    {
                        name: 'Observer Pattern',
                        description: 'Defines one-to-many dependency between objects',
                        use_case: 'Progress tracking and notification systems',
                        endpoint: '/api/patterns/demo/observer',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Strategy Pattern',
                        description: 'Defines family of algorithms and makes them interchangeable',
                        use_case: 'Different grading and assessment strategies',
                        endpoint: '/api/patterns/demo/strategy',
                        complexity: 'Medium'
                    },
                    {
                        name: 'Middleware Pattern',
                        description: 'Processes requests through a chain of handlers',
                        use_case: 'Request processing pipeline and authentication',
                        endpoint: '/api/patterns/demo/middleware',
                        complexity: 'Hard'
                    }
                ]
            };

            const statistics = {
                total_patterns: 10,
                by_category: {
                    creational: patterns.creational.length,
                    structural: patterns.structural.length,
                    behavioral: patterns.behavioral.length
                },
                by_complexity: {
                    easy: 2,
                    medium: 7,
                    hard: 1
                }
            };

            res.json({
                success: true,
                message: 'Complete design patterns catalog',
                data: {
                    patterns,
                    statistics,
                    learning_context: 'Online Learning Progress Tracker',
                    integration_status: 'Fully integrated with Express.js MVC architecture'
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve patterns list',
                error: error.message
            });
        }
    }

    /**
     * GET /api/patterns/compare
     * Compare different pattern implementations
     */
    async comparePatterns(req, res) {
        try {
            const comparison = {
                oop_patterns: {
                    location: 'services/DesignPatterns.js',
                    focus: 'Object-oriented learning management system',
                    patterns: [
                        'Factory Pattern', 'Strategy Pattern', 'Observer Pattern',
                        'Decorator Pattern', 'Proxy Pattern', 'Command Pattern',
                        'Adapter Pattern', 'Facade Pattern', 'Template Method'
                    ],
                    integration: 'Tightly integrated with OOP class hierarchy',
                    use_case: 'Advanced OOP principles demonstration'
                },
                additional_patterns: {
                    location: 'services/patterns/',
                    focus: 'Standalone pattern demonstrations',
                    patterns: [
                        'Adapter Pattern', 'Decorator Pattern', 'Facade Pattern',
                        'Factory Pattern', 'Middleware Pattern', 'Observer Pattern',
                        'Prototype Pattern', 'Proxy Pattern', 'Singleton Pattern',
                        'Strategy Pattern'
                    ],
                    integration: 'Independent pattern implementations',
                    use_case: 'Educational pattern demonstrations'
                },
                overlap: [
                    'Factory Pattern', 'Strategy Pattern', 'Observer Pattern',
                    'Decorator Pattern', 'Proxy Pattern', 'Adapter Pattern', 'Facade Pattern'
                ],
                unique_to_oop: ['Command Pattern', 'Template Method Pattern'],
                unique_to_additional: ['Prototype Pattern', 'Singleton Pattern', 'Middleware Pattern']
            };

            res.json({
                success: true,
                message: 'Pattern implementations comparison',
                data: comparison
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to compare patterns',
                error: error.message
            });
        }
    }

    /**
     * Helper method to categorize patterns
     */
    getPatternCategory(pattern) {
        const categories = {
            creational: ['factory', 'prototype', 'singleton'],
            structural: ['adapter', 'decorator', 'facade', 'proxy'],
            behavioral: ['observer', 'strategy', 'middleware']
        };

        for (const [category, patterns] of Object.entries(categories)) {
            if (patterns.includes(pattern.toLowerCase())) {
                return category;
            }
        }
        return 'unknown';
    }
}

module.exports = new EnhancedPatternsController();