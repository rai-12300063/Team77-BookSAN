
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true }, // Add index for faster login
    password: { type: String, required: true },
    address: { type: String },
    // Learning-specific fields
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    learningGoals: [{ type: String }],
    skillTags: [{ type: String }],
    learningPreferences: {
        preferredLearningTime: { type: String, enum: ['morning', 'afternoon', 'evening', 'any'], default: 'any' },
        learningPace: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
        notificationsEnabled: { type: Boolean, default: true }
    },
    totalLearningHours: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLearningDate: { type: Date },
    joinDate: { type: Date, default: Date.now },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // Reduce salt rounds from 10 to 8 for faster login (still secure)
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
