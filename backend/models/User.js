
/**
 * User Model - Demonstrates OOP Concepts and Data Modeling Patterns
 * 
 * OOP CONCEPTS IMPLEMENTED:
 * 1. ENCAPSULATION - Data and behavior bundled together
 * 2. ABSTRACTION - Complex database operations hidden behind simple interface
 * 3. INHERITANCE - Inherits from Mongoose Model (implicit)
 * 4. POLYMORPHISM - Different user types (student/instructor/admin) with same interface
 * 
 * DESIGN PATTERNS:
 * 1. ACTIVE RECORD PATTERN - Model contains both data and business logic
 * 2. STRATEGY PATTERN - Different roles have different behaviors
 * 3. TEMPLATE METHOD PATTERN - Pre-save hook follows template method pattern
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * ENCAPSULATION EXAMPLE - User data structure and validation rules
 * All user-related data and constraints defined in one place
 * ABSTRACTION - Complex MongoDB schema abstracted as simple object
 */
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true, // Primary index for login queries
        lowercase: true, // Normalize email for consistent querying
        trim: true // Remove whitespace
    },
    password: { type: String, required: true },
    address: { type: String },
    // *** POLYMORPHISM IMPLEMENTATION ***
    // Same User model, different behaviors based on role
    role: { 
        type: String, 
        enum: ['student', 'instructor', 'admin'], 
        default: 'student',
        index: true // Add index for role-based queries
    },
    
    // ENCAPSULATION: Learning-specific data grouped together
    learningGoals: [{ type: String }],
    skillTags: [{ type: String }],
    
    // COMPOSITION: Complex object composed of simpler objects
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

/**
 * TEMPLATE METHOD PATTERN + ENCAPSULATION
 * Pre-save middleware - follows template method pattern
 * 
 * TEMPLATE METHOD: Mongoose provides template, we implement specific steps
 * ENCAPSULATION: Password hashing logic encapsulated in model
 * SECURITY PATTERN: Automatic password encryption before storage
 */
userSchema.pre('save', async function (next) {
    // GUARD CLAUSE: Only hash if password was modified
    if (!this.isModified('password')) return next();
    
    const hashStart = Date.now();
    
    // ENCAPSULATION: Password hashing details hidden from controllers
    // SECURITY: Use 6 rounds for development, 8-10 for production (faster hashing)
    const saltRounds = process.env.NODE_ENV === 'production' ? 8 : 6;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    
    const hashTime = Date.now() - hashStart;
    console.log(`🔐 Password hashing took ${hashTime}ms with ${saltRounds} rounds`);
    
    // TEMPLATE METHOD: Continue with save process
    next();
});

// Add compound indexes for common query patterns
userSchema.index({ email: 1, role: 1 }); // Login + role queries
userSchema.index({ role: 1, joinDate: -1 }); // Role-based listings
userSchema.index({ lastLearningDate: -1 }); // Activity tracking

module.exports = mongoose.model('User', userSchema);
