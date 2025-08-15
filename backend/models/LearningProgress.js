const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    currentModule: { type: Number, default: 0 },
    modulesCompleted: [{ 
        moduleIndex: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now },
        timeSpent: { type: Number, default: 0 } // in minutes
    }],
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
}, { timestamps: true });

// Ensure one progress record per user per course
learningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });


module.exports = mongoose.model('LearningProgress', learningProgressSchema);

