
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String },
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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
