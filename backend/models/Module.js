const mongoose = require('mongoose');

/**
 * Module Model - Represents individual learning modules within courses
 * Integrates with Factory Pattern for creating different module types
 * Supports Observer Pattern for progress tracking
 */

// Base content schema for different content types
const contentSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['video', 'text', 'quiz', 'assignment', 'interactive', 'discussion', 'resource']
    },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // in minutes
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
    
    // Content-specific data (varies by type)
    contentData: {
        // Video content
        videoUrl: { type: String },
        thumbnailUrl: { type: String },
        transcript: { type: String },
        subtitles: [{ 
            language: String, 
            url: String 
        }],
        
        // Text content
        content: { type: String },
        readingTime: { type: Number }, // estimated reading time in minutes
        
        // Quiz/Assessment content
        questions: [{
            questionId: { type: String },
            type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'] },
            question: { type: String },
            options: [{ type: String }],
            correctAnswer: { type: mongoose.Schema.Types.Mixed },
            points: { type: Number, default: 1 },
            explanation: { type: String }
        }],
        passingScore: { type: Number, default: 70 },
        timeLimit: { type: Number }, // in minutes
        allowRetakes: { type: Boolean, default: true },
        
        // Assignment content
        instructions: { type: String },
        submissionFormat: { type: String, enum: ['text', 'file', 'url', 'code'] },
        rubric: [{
            criterion: { type: String },
            maxPoints: { type: Number },
            description: { type: String }
        }],
        dueDate: { type: Date },
        
        // Interactive content
        interactionType: { type: String },
        interactionUrl: { type: String },
        
        // Resource content
        resourceType: { type: String, enum: ['pdf', 'link', 'download', 'reference'] },
        resourceUrl: { type: String },
        fileSize: { type: Number }, // in bytes
        
        // Discussion content
        discussionPrompt: { type: String },
        requiresParticipation: { type: Boolean, default: false },
        minimumPosts: { type: Number, default: 1 }
    },
    
    // Prerequisites within the module
    prerequisites: [{ type: String }], // contentIds that must be completed first
    
    // Learning objectives for this content
    learningObjectives: [{ type: String }],
    
    // Difficulty and complexity
    complexity: { type: Number, min: 1, max: 10, default: 1 },
    
    // Access control (Proxy Pattern integration)
    accessControl: {
        requiresPremium: { type: Boolean, default: false },
        requiredRole: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
        availableFrom: { type: Date },
        availableUntil: { type: Date },
        ipRestrictions: [{ type: String }]
    }
}, { _id: false });

const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Module structure and organization
    learningObjectives: [{ type: String }],
    estimatedDuration: { type: Number, required: true }, // total minutes for the module
    difficulty: { 
        type: String, 
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    
    // Module content (using Factory Pattern structure)
    contents: [contentSchema],
    
    // Module prerequisites
    prerequisites: {
        modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
        skills: [{ type: String }],
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
    },
    
    // Assessment and evaluation
    assessment: {
        isRequired: { type: Boolean, default: false },
        type: { type: String, enum: ['quiz', 'assignment', 'project', 'peer-review'] },
        passingScore: { type: Number, default: 70 },
        weightInCourse: { type: Number, default: 0 }, // percentage weight in final course grade
        assessmentId: { type: String } // reference to specific assessment content
    },
    
    // Module settings and configuration
    settings: {
        isActive: { type: Boolean, default: true },
        allowSkip: { type: Boolean, default: false },
        sequentialAccess: { type: Boolean, default: true }, // must complete contents in order
        timeLimit: { type: Number }, // optional time limit in minutes
        maxAttempts: { type: Number, default: 3 },
        availableFrom: { type: Date },
        availableUntil: { type: Date }
    },
    
    // Analytics and tracking
    analytics: {
        totalEnrollments: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        averageTimeSpent: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        dropoffPoints: [{ 
            contentId: String, 
            dropoffRate: Number 
        }]
    },
    
    // Tags and categorization
    tags: [{ type: String }],
    category: { type: String },
    
    // Version control for content updates
    version: { type: String, default: '1.0.0' },
    lastUpdated: { type: Date, default: Date.now },
    
    // Creator and maintenance info
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    lastModifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    // Approval workflow
    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'published', 'archived'],
        default: 'draft'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for efficient querying
moduleSchema.index({ courseId: 1, moduleNumber: 1 }, { unique: true });
moduleSchema.index({ 'contents.contentId': 1 });
moduleSchema.index({ status: 1, 'settings.isActive': 1 });
moduleSchema.index({ tags: 1 });
moduleSchema.index({ createdBy: 1 });

// Virtual for total content count
moduleSchema.virtual('totalContents').get(function() {
    return this.contents.length;
});

// Virtual for required content count
moduleSchema.virtual('requiredContents').get(function() {
    return this.contents.filter(content => content.isRequired).length;
});

// Virtual for completion rate percentage
moduleSchema.virtual('completionRatePercent').get(function() {
    return Math.round(this.analytics.completionRate * 100) / 100;
});

// Pre-save middleware to update analytics
moduleSchema.pre('save', function(next) {
    // Update total duration based on content
    if (this.contents && this.contents.length > 0) {
        this.estimatedDuration = this.contents.reduce((total, content) => {
            return total + (content.duration || 0);
        }, 0);
    }
    
    // Update lastUpdated
    this.lastUpdated = new Date();
    
    next();
});

// Static method to get modules by course with population
moduleSchema.statics.getByCourse = function(courseId, options = {}) {
    const {
        includeInactive = false,
        populateContents = true,
        sortBy = 'moduleNumber'
    } = options;
    
    const query = { courseId };
    if (!includeInactive) {
        query['settings.isActive'] = true;
    }
    
    let moduleQuery = this.find(query).sort({ [sortBy]: 1 });
    
    if (populateContents) {
        moduleQuery = moduleQuery.populate('createdBy', 'name email')
                                 .populate('lastModifiedBy', 'name email');
    }
    
    return moduleQuery;
};

// Instance method to get next module in sequence
moduleSchema.methods.getNextModule = function() {
    return this.constructor.findOne({
        courseId: this.courseId,
        moduleNumber: { $gt: this.moduleNumber },
        'settings.isActive': true
    }).sort({ moduleNumber: 1 });
};

// Instance method to get previous module in sequence
moduleSchema.methods.getPreviousModule = function() {
    return this.constructor.findOne({
        courseId: this.courseId,
        moduleNumber: { $lt: this.moduleNumber },
        'settings.isActive': true
    }).sort({ moduleNumber: -1 });
};

// Instance method to check if user can access this module
moduleSchema.methods.canUserAccess = function(user, userProgress = null) {
    // Check role requirements
    if (this.contents.some(content => 
        content.accessControl.requiredRole && 
        content.accessControl.requiredRole !== user.role &&
        user.role !== 'admin'
    )) {
        return { canAccess: false, reason: 'Insufficient role permissions' };
    }
    
    // Check premium requirements
    if (this.contents.some(content => 
        content.accessControl.requiresPremium && 
        !user.isPremium && 
        user.role !== 'admin'
    )) {
        return { canAccess: false, reason: 'Premium subscription required' };
    }
    
    // Check availability dates
    const now = new Date();
    if (this.settings.availableFrom && now < this.settings.availableFrom) {
        return { canAccess: false, reason: 'Module not yet available' };
    }
    
    if (this.settings.availableUntil && now > this.settings.availableUntil) {
        return { canAccess: false, reason: 'Module access expired' };
    }
    
    // Check prerequisites if userProgress is provided
    if (userProgress && this.prerequisites.modules.length > 0) {
        const completedModules = userProgress.modulesCompleted.map(m => m.moduleId?.toString());
        const hasPrerequisites = this.prerequisites.modules.every(prereqId => 
            completedModules.includes(prereqId.toString())
        );
        
        if (!hasPrerequisites) {
            return { canAccess: false, reason: 'Prerequisites not completed' };
        }
    }
    
    return { canAccess: true };
};

module.exports = mongoose.model('Module', moduleSchema);