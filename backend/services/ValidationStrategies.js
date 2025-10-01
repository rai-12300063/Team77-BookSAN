/**
 * Validation Strategies - Strategy Pattern for different validation approaches
 */

/**
 * Abstract Validation Strategy
 */
class ValidationStrategy {
    constructor() {
        this.errors = [];
    }

    async validate(data) {
        this.errors = [];
        await this.runValidation(data);
        return this.errors.length === 0;
    }

    async runValidation(data) {
        throw new Error('runValidation must be implemented by subclass');
    }

    addError(field, message) {
        this.errors.push({ field, message });
    }

    getErrors() {
        return this.errors;
    }
}

/**
 * Schema-based Validation Strategy
 */
class SchemaValidationStrategy extends ValidationStrategy {
    constructor(schema) {
        super();
        this.schema = schema;
    }

    async runValidation(data) {
        for (const [field, rules] of Object.entries(this.schema)) {
            const value = this.getFieldValue(data, field);
            await this.validateField(field, value, rules);
        }
    }

    getFieldValue(data, field) {
        // Support nested field access with dot notation
        return field.split('.').reduce((obj, key) => obj?.[key], data);
    }

    async validateField(field, value, rules) {
        for (const rule of rules) {
            if (!await this.applyRule(field, value, rule)) {
                break; // Stop on first error for this field
            }
        }
    }

    async applyRule(field, value, rule) {
        const ruleName = typeof rule === 'string' ? rule : rule.type;
        const ruleOptions = typeof rule === 'object' ? rule : {};

        switch (ruleName) {
            case 'required':
                if (value === undefined || value === null || value === '') {
                    this.addError(field, `${field} is required`);
                    return false;
                }
                break;

            case 'string':
                if (typeof value !== 'string') {
                    this.addError(field, `${field} must be a string`);
                    return false;
                }
                break;

            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    this.addError(field, `${field} must be a number`);
                    return false;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.addError(field, `${field} must be a valid email`);
                    return false;
                }
                break;

            case 'min':
                if (typeof value === 'string' || Array.isArray(value)) {
                    if (value.length < ruleOptions.value) {
                        this.addError(field, `${field} must be at least ${ruleOptions.value} characters`);
                        return false;
                    }
                } else if (typeof value === 'number') {
                    if (value < ruleOptions.value) {
                        this.addError(field, `${field} must be at least ${ruleOptions.value}`);
                        return false;
                    }
                }
                break;

            case 'max':
                if (typeof value === 'string' || Array.isArray(value)) {
                    if (value.length > ruleOptions.value) {
                        this.addError(field, `${field} must be at most ${ruleOptions.value} characters`);
                        return false;
                    }
                } else if (typeof value === 'number') {
                    if (value > ruleOptions.value) {
                        this.addError(field, `${field} must be at most ${ruleOptions.value}`);
                        return false;
                    }
                }
                break;

            case 'in':
                if (!ruleOptions.values.includes(value)) {
                    this.addError(field, `${field} must be one of: ${ruleOptions.values.join(', ')}`);
                    return false;
                }
                break;

            case 'regex':
                if (!ruleOptions.pattern.test(value)) {
                    this.addError(field, ruleOptions.message || `${field} format is invalid`);
                    return false;
                }
                break;

            case 'custom':
                const isValid = await ruleOptions.validator(value, field);
                if (!isValid) {
                    this.addError(field, ruleOptions.message || `${field} is invalid`);
                    return false;
                }
                break;
        }

        return true;
    }
}

/**
 * Learning Management System specific validation schemas
 */
class LMSValidationSchemas {
    static USER_CREATION = {
        name: ['required', 'string', { type: 'min', value: 2 }],
        email: ['required', 'email'],
        password: ['required', 'string', { type: 'min', value: 6 }],
        role: ['required', { type: 'in', values: ['student', 'instructor', 'admin'] }]
    };

    static COURSE_CREATION = {
        title: ['required', 'string', { type: 'min', value: 3 }],
        description: ['required', 'string', { type: 'min', value: 10 }],
        difficulty: [{ type: 'in', values: ['beginner', 'intermediate', 'advanced'] }],
        duration: ['number', { type: 'min', value: 1 }],
        instructorId: ['required', 'string']
    };

    static MODULE_CREATION = {
        title: ['required', 'string', { type: 'min', value: 3 }],
        description: ['string'],
        order: ['number', { type: 'min', value: 1 }],
        courseId: ['required', 'string']
    };

    static CONTENT_CREATION = {
        title: ['required', 'string', { type: 'min', value: 3 }],
        type: ['required', { type: 'in', values: ['video', 'text', 'quiz', 'assignment'] }],
        duration: ['number', { type: 'min', value: 1 }],
        moduleId: ['required', 'string']
    };

    static PROGRESS_UPDATE = {
        userId: ['required', 'string'],
        contentId: ['required', 'string'],
        progress: ['required', 'number', { type: 'min', value: 0 }, { type: 'max', value: 100 }],
        timeSpent: ['number', { type: 'min', value: 0 }]
    };

    static ASSESSMENT_SUBMISSION = {
        userId: ['required', 'string'],
        assessmentId: ['required', 'string'],
        responses: ['required'],
        timeSpent: ['number', { type: 'min', value: 0 }]
    };
}

/**
 * Business Rule Validation Strategy
 */
class BusinessRuleValidationStrategy extends ValidationStrategy {
    constructor(rules) {
        super();
        this.rules = rules || [];
    }

    async runValidation(data) {
        for (const rule of this.rules) {
            const isValid = await rule.validate(data);
            if (!isValid) {
                this.addError(rule.field || 'general', rule.message);
            }
        }
    }

    addRule(rule) {
        this.rules.push(rule);
    }
}

/**
 * Common Business Rules for Learning Management
 */
class LMSBusinessRules {
    static emailNotExists(userModel) {
        return {
            field: 'email',
            message: 'Email already exists',
            validate: async (data) => {
                if (!data.email) return true;
                const existing = await userModel.findByEmail(data.email);
                return !existing;
            }
        };
    }

    static instructorExists(userModel) {
        return {
            field: 'instructorId',
            message: 'Instructor does not exist',
            validate: async (data) => {
                if (!data.instructorId) return true;
                const instructor = await userModel.findById(data.instructorId);
                return instructor && instructor.role === 'instructor';
            }
        };
    }

    static courseExists(courseModel) {
        return {
            field: 'courseId',
            message: 'Course does not exist',
            validate: async (data) => {
                if (!data.courseId) return true;
                const course = await courseModel.findById(data.courseId);
                return !!course;
            }
        };
    }

    static userNotAlreadyEnrolled(enrollmentModel) {
        return {
            field: 'enrollment',
            message: 'User is already enrolled in this course',
            validate: async (data) => {
                if (!data.userId || !data.courseId) return true;
                const existing = await enrollmentModel.findByUserAndCourse(data.userId, data.courseId);
                return !existing;
            }
        };
    }

    static validProgress() {
        return {
            field: 'progress',
            message: 'Progress cannot go backwards',
            validate: async (data) => {
                // Custom business logic for progress validation
                if (data.currentProgress && data.newProgress < data.currentProgress) {
                    return false;
                }
                return true;
            }
        };
    }
}

/**
 * Validation Factory - Factory Pattern for creating validators
 */
class ValidationFactory {
    static createSchemaValidator(schemaName) {
        const schema = LMSValidationSchemas[schemaName];
        if (!schema) {
            throw new Error(`Schema '${schemaName}' not found`);
        }
        return new SchemaValidationStrategy(schema);
    }

    static createBusinessRuleValidator(rules) {
        return new BusinessRuleValidationStrategy(rules);
    }

    static createCompositeValidator(validators) {
        return new CompositeValidationStrategy(validators);
    }
}

/**
 * Composite Validation Strategy - Composite Pattern
 */
class CompositeValidationStrategy extends ValidationStrategy {
    constructor(validators = []) {
        super();
        this.validators = validators;
    }

    addValidator(validator) {
        this.validators.push(validator);
    }

    async runValidation(data) {
        for (const validator of this.validators) {
            const isValid = await validator.validate(data);
            if (!isValid) {
                this.errors.push(...validator.getErrors());
            }
        }
    }
}

module.exports = {
    ValidationStrategy,
    SchemaValidationStrategy,
    BusinessRuleValidationStrategy,
    CompositeValidationStrategy,
    LMSValidationSchemas,
    LMSBusinessRules,
    ValidationFactory
};