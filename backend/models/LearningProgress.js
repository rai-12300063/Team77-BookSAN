const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    currentModule: { type: Number, default: 0 },
    // Updated to support both old index-based and new module-based tracking
    modulesCompleted: [{ 
        moduleIndex: { type: Number }, // deprecated but kept for backward compatibility
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }, // new module reference
        completedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 }, // in minutes
        score: { type: Number }, // module assessment score
        attempts: { type: Number, default: 1 }
    }],
    
    // Enhanced module progress tracking
    moduleProgress: {
        totalModules: { type: Number, default: 0 },
        completedModules: { type: Number, default: 0 },
        currentModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        averageModuleScore: { type: Number, default: 0 },
        strugglingModules: [{ 
            moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
            reason: { type: String },
            detectedAt: { type: Date, default: Date.now }
        }]
    },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    lastAccessDate: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    completionDate: { type: Date },
    grade: { type: Number, min: 0, max: 100 },
    certificateIssued: { type: Boolean, default: false },
    certificateId: { type: String },
    notes: { type: String },
    bookmarks: [{
        moduleIndex: { type: Number, required: true },
        topic: { type: String, required: true },
        note: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    achievements: [{
        type: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        description: { type: String }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure one progress record per user per course
learningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Virtual to get detailed module progress
learningProgressSchema.virtual('detailedModuleProgress', {
    ref: 'ModuleProgress',
    localField: '_id',
    foreignField: 'courseId',
    match: function() {
        return { userId: this.userId };
    }
});

// Virtual for module completion rate
learningProgressSchema.virtual('moduleCompletionRate').get(function() {
    if (this.moduleProgress.totalModules === 0) return 0;
    return (this.moduleProgress.completedModules / this.moduleProgress.totalModules) * 100;
});


module.exports = mongoose.model('LearningProgress', learningProgressSchema);

