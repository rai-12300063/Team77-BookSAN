const mongoose = require('mongoose');

/**
 * Module Progress Model - Tracks detailed progress within modules
 * Integrates with Observer Pattern for real-time progress tracking
 * Supports Strategy Pattern for different progress calculation methods
 */

// Individual content progress tracking
const contentProgressSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    contentType: { 
        type: String, 
        required: true,
        enum: ['video', 'text', 'quiz', 'assignment', 'interactive', 'discussion', 'resource']
    },
    
    // Progress tracking
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'skipped', 'failed'],
        default: 'not-started'
    },
    
    // Time tracking
    timeSpent: { type: Number, default: 0 }, // in seconds
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
    
    // Attempt tracking
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    
    // Score and performance (for assessments)
    scores: [{
        attempt: { type: Number },
        score: { type: Number },
        maxScore: { type: Number },
        percentage: { type: Number },
        submittedAt: { type: Date },
        feedback: { type: String },
        gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        gradedAt: { type: Date }
    }],
    
    // Best score achieved
    bestScore: {
        score: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        achievedAt: { type: Date }
    },
    
    // Content-specific progress data
    progressData: {
        // Video progress
        watchTime: { type: Number, default: 0 }, // seconds watched
        totalDuration: { type: Number }, // total video duration
        watchPercentage: { type: Number, default: 0 },
        playbackPositions: [{ 
            timestamp: Number, 
            position: Number,
            recordedAt: { type: Date, default: Date.now }
        }],
        
        // Reading progress
        scrollPercentage: { type: Number, default: 0 },
        readingSpeed: { type: Number }, // words per minute
        
        // Quiz/Assessment specific
        questionResponses: [{
            questionId: { type: String },
            userAnswer: { type: mongoose.Schema.Types.Mixed },
            isCorrect: { type: Boolean },
            timeSpent: { type: Number }, // seconds
            attempts: { type: Number, default: 1 }
        }],
        
        // Assignment submissions
        submissions: [{
            submissionId: { type: String },
            submittedAt: { type: Date },
            submissionType: { type: String },
            submissionData: { type: mongoose.Schema.Types.Mixed },
            status: { 
                type: String, 
                enum: ['submitted', 'grading', 'graded', 'returned'], 
                default: 'submitted' 
            }
        }],
        
        // Interactive content
        interactionEvents: [{
            eventType: { type: String },
            eventData: { type: mongoose.Schema.Types.Mixed },
            timestamp: { type: Date, default: Date.now }
        }],
        
        // Discussion participation
        postsCount: { type: Number, default: 0 },
        repliesCount: { type: Number, default: 0 },
        lastPostAt: { type: Date }
    },
    
    // User notes and bookmarks
    notes: [{ 
        content: { type: String },
        timestamp: { type: Number }, // position in content (seconds for video, percentage for text)
        createdAt: { type: Date, default: Date.now }
    }],
    
    bookmarks: [{
        title: { type: String },
        timestamp: { type: Number },
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Flags and metadata
    isMandatory: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
    needsReview: { type: Boolean, default: false },
    
}, { _id: false });

const moduleProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    
    // Overall module progress
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed', 'failed', 'expired'],
        default: 'not-started'
    },
    
    // Time tracking
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
    totalTimeSpent: { type: Number, default: 0 }, // in seconds
    
    // Progress metrics
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    contentCompletionCount: { type: Number, default: 0 },
    totalContentCount: { type: Number, required: true },
    requiredContentCompletionCount: { type: Number, default: 0 },
    totalRequiredContentCount: { type: Number, required: true },
    
    // Detailed content progress
    contentProgress: [contentProgressSchema],
    
    // Assessment results
    moduleAssessment: {
        attempts: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
        bestScorePercentage: { type: Number, default: 0 },
        passingScore: { type: Number, default: 70 },
        hasPassed: { type: Boolean, default: false },
        lastAttemptAt: { type: Date },
        scores: [{
            attempt: { type: Number },
            score: { type: Number },
            percentage: { type: Number },
            completedAt: { type: Date },
            timeSpent: { type: Number } // seconds
        }]
    },
    
    // Learning path and sequence
    previousModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    nextModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    
    // Learning analytics
    analytics: {
        averageSessionDuration: { type: Number, default: 0 }, // seconds
        totalSessions: { type: Number, default: 0 },
        longestSession: { type: Number, default: 0 }, // seconds
        strugglingContents: [{ 
            contentId: String, 
            strugglingScore: Number // 1-10 scale
        }],
        strongContents: [{ 
            contentId: String, 
            strengthScore: Number // 1-10 scale
        }],
        learningVelocity: { type: Number, default: 0 }, // content per hour
        engagementScore: { type: Number, default: 0 } // 0-100
    },
    
    // Personalization and adaptation
    adaptiveData: {
        learningStyle: { 
            type: String, 
            enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'] 
        },
        difficultyPreference: { 
            type: String, 
            enum: ['easy', 'medium', 'hard', 'adaptive'] 
        },
        preferredContentTypes: [{ type: String }],
        recommendedNextContent: [{ 
            contentId: String, 
            reason: String,
            confidence: Number // 0-1
        }]
    },
    
    // Achievements and milestones
    achievements: [{
        type: { 
            type: String,
            enum: ['first-content', 'module-completion', 'perfect-score', 'quick-learner', 'persistent', 'explorer']
        },
        unlockedAt: { type: Date, default: Date.now },
        contentId: { type: String }, // if achievement is content-specific
        description: { type: String }
    }],
    
    // Streaks and momentum
    streaks: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActivityDate: { type: Date }
    },
    
    // Collaboration and social learning
    collaborationData: {
        studyGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' },
        peerInteractions: { type: Number, default: 0 },
        helpRequestsGiven: { type: Number, default: 0 },
        helpRequestsReceived: { type: Number, default: 0 }
    },
    
    // Flags and settings
    isActive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    pausedAt: { type: Date },
    resumedAt: { type: Date },
    
    // Metadata
    version: { type: String, default: '1.0.0' },
    syncedAt: { type: Date, default: Date.now } // for offline sync
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for efficient querying
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
moduleProgressSchema.index({ courseId: 1, userId: 1 });
moduleProgressSchema.index({ status: 1, lastAccessedAt: -1 });
moduleProgressSchema.index({ 'contentProgress.contentId': 1 });
moduleProgressSchema.index({ completionPercentage: 1 });

// Virtual for overall completion status
moduleProgressSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed' || this.completionPercentage >= 100;
});

// Virtual for required content completion rate
moduleProgressSchema.virtual('requiredCompletionRate').get(function() {
    if (this.totalRequiredContentCount === 0) return 100;
    return (this.requiredContentCompletionCount / this.totalRequiredContentCount) * 100;
});

// Virtual for average score
moduleProgressSchema.virtual('averageScore').get(function() {
    const scores = this.contentProgress
        .filter(cp => cp.bestScore && cp.bestScore.score > 0)
        .map(cp => cp.bestScore.percentage || 0);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
});

// Pre-save middleware to calculate completion percentage
moduleProgressSchema.pre('save', function(next) {
    // Update completion counts
    this.contentCompletionCount = this.contentProgress.filter(cp => cp.isCompleted).length;
    this.requiredContentCompletionCount = this.contentProgress
        .filter(cp => cp.isCompleted && cp.isMandatory).length;
    
    // Calculate completion percentage
    if (this.totalRequiredContentCount > 0) {
        this.completionPercentage = Math.round(
            (this.requiredContentCompletionCount / this.totalRequiredContentCount) * 100
        );
    }
    
    // Update status based on completion
    if (this.completionPercentage >= 100 && this.status !== 'completed') {
        this.status = 'completed';
        this.completedAt = new Date();
    } else if (this.completionPercentage > 0 && this.status === 'not-started') {
        this.status = 'in-progress';
        this.startedAt = this.startedAt || new Date();
    }
    
    // Calculate total time spent
    this.totalTimeSpent = this.contentProgress.reduce((total, cp) => {
        return total + (cp.timeSpent || 0);
    }, 0);
    
    // Update last accessed date
    this.lastAccessedAt = new Date();
    
    // Update sync timestamp
    this.syncedAt = new Date();
    
    next();
});

// Static method to get progress with detailed analytics
moduleProgressSchema.statics.getDetailedProgress = function(userId, moduleId) {
    return this.findOne({ userId, moduleId })
        .populate('moduleId', 'title contents estimatedDuration')
        .populate('courseId', 'title')
        .populate('userId', 'name email learningPreferences');
};

// Static method to get user's module progress for a course
moduleProgressSchema.statics.getCourseProgress = function(userId, courseId) {
    return this.find({ userId, courseId })
        .populate('moduleId', 'title moduleNumber estimatedDuration')
        .sort({ 'moduleId.moduleNumber': 1 });
};

// Instance method to update content progress
moduleProgressSchema.methods.updateContentProgress = function(contentId, progressData) {
    let contentProgress = this.contentProgress.find(cp => cp.contentId === contentId);
    
    if (!contentProgress) {
        contentProgress = {
            contentId,
            contentType: progressData.contentType || 'text'
        };
        this.contentProgress.push(contentProgress);
        contentProgress = this.contentProgress[this.contentProgress.length - 1];
    }
    
    // Update progress data
    Object.assign(contentProgress, progressData);
    
    // Update timestamps
    if (progressData.status === 'completed' && !contentProgress.completedAt) {
        contentProgress.completedAt = new Date();
        contentProgress.isCompleted = true;
    }
    
    if (!contentProgress.startedAt && progressData.status !== 'not-started') {
        contentProgress.startedAt = new Date();
    }
    
    contentProgress.lastAccessedAt = new Date();
    
    return this.save();
};

// Instance method to calculate learning velocity
moduleProgressSchema.methods.calculateLearningVelocity = function() {
    if (this.totalTimeSpent === 0) return 0;
    
    const hoursSpent = this.totalTimeSpent / 3600; // convert to hours
    return this.contentCompletionCount / hoursSpent;
};

// Instance method to get struggling areas
moduleProgressSchema.methods.getStrugglingAreas = function() {
    return this.contentProgress
        .filter(cp => {
            // Consider struggling if: low scores, many attempts, or long time spent
            const hasLowScore = cp.bestScore.percentage < 60;
            const tooManyAttempts = cp.attempts > 2;
            const tookTooLong = cp.timeSpent > (cp.estimatedDuration * 2);
            
            return hasLowScore || tooManyAttempts || tookTooLong;
        })
        .map(cp => ({
            contentId: cp.contentId,
            reasons: {
                lowScore: cp.bestScore.percentage < 60,
                manyAttempts: cp.attempts > 2,
                longDuration: cp.timeSpent > (cp.estimatedDuration * 2)
            }
        }));
};

// Instance method to generate personalized recommendations
moduleProgressSchema.methods.getPersonalizedRecommendations = function() {
    const strugglingAreas = this.getStrugglingAreas();
    const strongAreas = this.contentProgress
        .filter(cp => cp.bestScore.percentage >= 90 && cp.attempts <= 1)
        .map(cp => cp.contentId);
    
    return {
        reviewContent: strugglingAreas.map(area => area.contentId),
        skipCandidates: strongAreas,
        recommendedStudyTime: this.analytics.averageSessionDuration || 30 * 60, // default 30 minutes
        suggestedBreaks: this.analytics.longestSession > 2 * 60 * 60 // suggest breaks if sessions > 2 hours
    };
};

module.exports = mongoose.model('ModuleProgress', moduleProgressSchema);