/**
 * Simplified MVC Framework with Design Patterns and OOP
 * Base classes that implement core MVC functionality with integrated patterns
 */

const EventEmitter = require('events');

/**
 * Abstract Base Controller - Template Method Pattern
 * Defines the skeleton of request processing with customizable steps
 */
class BaseController extends EventEmitter {
    constructor() {
        super();
        this.middleware = [];
        this.validators = new Map();
        this.observers = [];
    }

    /**
     * Template Method - defines the algorithm structure
     * Subclasses can override individual steps
     */
    async handleRequest(req, res, next) {
        try {
            // Step 1: Preprocessing
            await this.preProcess(req, res);
            
            // Step 2: Validation
            await this.validate(req);
            
            // Step 3: Authorization
            await this.authorize(req, res);
            
            // Step 4: Execute business logic
            const result = await this.execute(req, res);
            
            // Step 5: Post-processing
            const processedResult = await this.postProcess(result, req, res);
            
            // Step 6: Send response
            await this.sendResponse(processedResult, res);
            
            // Step 7: Notify observers
            this.notifyObservers('request_completed', { req, res, result: processedResult });
            
        } catch (error) {
            await this.handleError(error, req, res, next);
        }
    }

    // Template methods - can be overridden by subclasses
    async preProcess(req, res) {
        // Default implementation
        this.emit('pre_process', { req, res });
    }

    async validate(req) {
        // Strategy Pattern - use different validation strategies
        const validator = this.validators.get(req.route?.path) || this.getDefaultValidator();
        if (validator) {
            return await validator.validate(req);
        }
    }

    async authorize(req, res) {
        // Default implementation
        return true;
    }

    // Abstract method - must be implemented by subclasses
    async execute(req, res) {
        throw new Error('execute() method must be implemented by subclass');
    }

    async postProcess(result, req, res) {
        // Default implementation
        return result;
    }

    async sendResponse(result, res) {
        const response = this.formatResponse(result);
        res.status(response.status || 200).json(response);
    }

    async handleError(error, req, res, next) {
        console.error('Controller Error:', error);
        
        const errorResponse = {
            success: false,
            message: error.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        };
        
        res.status(error.status || 500).json(errorResponse);
    }

    // Observer Pattern - for event handling
    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (typeof observer.update === 'function') {
                observer.update(event, data);
            }
        });
    }

    // Strategy Pattern - for validation
    setValidator(path, validator) {
        this.validators.set(path, validator);
    }

    getDefaultValidator() {
        return null; // No validation by default
    }

    // Helper method to format responses consistently
    formatResponse(data) {
        if (data && typeof data === 'object' && 'success' in data) {
            return data; // Already formatted
        }
        
        return {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Abstract Base Model - Active Record Pattern with OOP
 */
class BaseModel {
    constructor(data = {}) {
        this.attributes = { ...data };
        this.errors = [];
        this.observers = [];
        this._original = { ...data };
    }

    // Getter/Setter with Encapsulation
    get(key) {
        return this.attributes[key];
    }

    set(key, value) {
        const oldValue = this.attributes[key];
        this.attributes[key] = value;
        
        // Notify observers of changes
        this.notifyObservers('attribute_changed', { key, oldValue, newValue: value });
        
        return this;
    }

    // Template Method for validation
    async validate() {
        this.errors = [];
        
        // Run validation rules
        await this.runValidationRules();
        
        // Custom validation hook
        await this.customValidation();
        
        return this.errors.length === 0;
    }

    // Check if model is valid
    isValid() {
        return this.errors.length === 0;
    }

    async runValidationRules() {
        // Override in subclasses
    }

    async customValidation() {
        // Override in subclasses
    }

    // Active Record methods
    async save() {
        if (!await this.validate()) {
            throw new Error(`Validation failed: ${this.errors.join(', ')}`);
        }

        const isNew = !this.attributes.id;
        
        if (isNew) {
            await this.create();
            this.notifyObservers('model_created', this);
        } else {
            await this.update();
            this.notifyObservers('model_updated', this);
        }
        
        this._original = { ...this.attributes };
        return this;
    }

    async create() {
        // Override in subclasses
        throw new Error('create() method must be implemented');
    }

    async update() {
        // Override in subclasses
        throw new Error('update() method must be implemented');
    }

    async delete() {
        // Override in subclasses
        await this.destroy();
        this.notifyObservers('model_deleted', this);
    }

    async destroy() {
        throw new Error('destroy() method must be implemented');
    }

    // Observer Pattern
    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (typeof observer.update === 'function') {
                observer.update(event, data);
            }
        });
    }

    // Check if model has been modified
    isDirty() {
        return JSON.stringify(this.attributes) !== JSON.stringify(this._original);
    }

    // Get only changed attributes
    getChanges() {
        const changes = {};
        for (const key in this.attributes) {
            if (this.attributes[key] !== this._original[key]) {
                changes[key] = {
                    old: this._original[key],
                    new: this.attributes[key]
                };
            }
        }
        return changes;
    }

    // Convert to JSON
    toJSON() {
        return { ...this.attributes };
    }
}

/**
 * Base Service - Business Logic Layer with Strategy Pattern
 */
class BaseService {
    constructor() {
        this.strategies = new Map();
        this.cache = new Map();
        this.observers = [];
    }

    // Strategy Pattern - for different business logic approaches
    setStrategy(name, strategy) {
        this.strategies.set(name, strategy);
    }

    getStrategy(name) {
        return this.strategies.get(name);
    }

    // Template Method for service operations
    async execute(operation, data, context = {}) {
        try {
            // Pre-execution hook
            await this.beforeExecute(operation, data, context);
            
            // Execute with strategy if available
            const strategy = this.getStrategy(operation);
            let result;
            
            if (strategy) {
                result = await strategy.execute(data, context);
            } else {
                result = await this.defaultExecute(operation, data, context);
            }
            
            // Post-execution hook
            result = await this.afterExecute(operation, result, context);
            
            // Cache result if cacheable
            if (this.isCacheable(operation)) {
                this.cache.set(this.getCacheKey(operation, data), result);
            }
            
            // Notify observers
            this.notifyObservers('service_executed', { operation, data, result });
            
            return result;
            
        } catch (error) {
            await this.onError(error, operation, data, context);
            throw error;
        }
    }

    async beforeExecute(operation, data, context) {
        // Override in subclasses
    }

    async defaultExecute(operation, data, context) {
        throw new Error(`No strategy found for operation: ${operation}`);
    }

    async afterExecute(operation, result, context) {
        return result;
    }

    async onError(error, operation, data, context) {
        console.error(`Service error in ${operation}:`, error);
    }

    // Caching methods
    isCacheable(operation) {
        return false; // Override in subclasses
    }

    getCacheKey(operation, data) {
        return `${operation}_${JSON.stringify(data)}`;
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Observer Pattern
    addObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            if (typeof observer.update === 'function') {
                observer.update(event, data);
            }
        });
    }
}

/**
 * MVC Framework Factory - Factory Pattern for creating MVC components
 */
class MVCFactory {
    static controllers = new Map();
    static models = new Map();
    static services = new Map();

    static registerController(name, controllerClass) {
        this.controllers.set(name, controllerClass);
    }

    static registerModel(name, modelClass) {
        this.models.set(name, modelClass);
    }

    static registerService(name, serviceClass) {
        this.services.set(name, serviceClass);
    }

    static createController(name, ...args) {
        const ControllerClass = this.controllers.get(name);
        if (!ControllerClass) {
            throw new Error(`Controller '${name}' not registered`);
        }
        return new ControllerClass(...args);
    }

    static createModel(name, data = {}) {
        const ModelClass = this.models.get(name);
        if (!ModelClass) {
            throw new Error(`Model '${name}' not registered`);
        }
        return new ModelClass(data);
    }

    static createService(name, ...args) {
        const ServiceClass = this.services.get(name);
        if (!ServiceClass) {
            throw new Error(`Service '${name}' not registered`);
        }
        return new ServiceClass(...args);
    }

    static listRegistered() {
        return {
            controllers: Array.from(this.controllers.keys()),
            models: Array.from(this.models.keys()),
            services: Array.from(this.services.keys())
        };
    }
}

/**
 * Request/Response Decorators - Decorator Pattern
 */
class RequestDecorator {
    constructor(handler) {
        this.handler = handler;
    }

    async handle(req, res, next) {
        return await this.handler.handle(req, res, next);
    }
}

class LoggingDecorator extends RequestDecorator {
    async handle(req, res, next) {
        const start = Date.now();
        console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.path}`);
        
        const result = await super.handle(req, res, next);
        
        const duration = Date.now() - start;
        console.log(`✅ Request completed in ${duration}ms`);
        
        return result;
    }
}

class ValidationDecorator extends RequestDecorator {
    constructor(handler, validator) {
        super(handler);
        this.validator = validator;
    }

    async handle(req, res, next) {
        if (this.validator) {
            const isValid = await this.validator.validate(req);
            if (!isValid) {
                const error = new Error('Validation failed');
                error.status = 400;
                error.details = this.validator.errors;
                throw error;
            }
        }
        
        return await super.handle(req, res, next);
    }
}

class CachingDecorator extends RequestDecorator {
    constructor(handler, cacheStore, ttl = 300000) {
        super(handler);
        this.cache = cacheStore;
        this.ttl = ttl;
    }

    async handle(req, res, next) {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return await super.handle(req, res, next);
        }

        const cacheKey = this.getCacheKey(req);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            console.log(`💾 Cache hit: ${cacheKey}`);
            return cached.data;
        }

        const result = await super.handle(req, res, next);
        
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        
        console.log(`📭 Cached result: ${cacheKey}`);
        return result;
    }

    getCacheKey(req) {
        return `${req.method}_${req.path}_${JSON.stringify(req.query)}`;
    }
}

module.exports = {
    BaseController,
    BaseModel,
    BaseService,
    MVCFactory,
    RequestDecorator,
    LoggingDecorator,
    ValidationDecorator,
    CachingDecorator
};