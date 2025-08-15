const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Mobile Development', 'Web Development', 'Other']
    },
    difficulty: { 
        type: String, 
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    instructor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    duration: { 
        weeks: { type: Number, required: true },
        hoursPerWeek: { type: Number, required: true }
    },
    estimatedCompletionTime: { type: Number, required: true }, // in hours
    prerequisites: [{ type: String }],
    learningObjectives: [{ type: String }],
    syllabus: [{
        moduleTitle: { type: String, required: true },
        topics: [{ type: String }],
        estimatedHours: { type: Number, required: true }
    }],
    isActive: { type: Boolean, default: true },
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Course', courseSchema);