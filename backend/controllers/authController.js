
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: '7d', // Shorter expiry for better security and performance
        algorithm: 'HS256' // Explicit algorithm for faster signing
    });
};

// Configure email transporter
const createEmailTransporter = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production email service (e.g., SendGrid, SES)
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Development/testing - log emails to console
        return nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
    }
};

/**
 * FACTORY PATTERN IMPLEMENTATION
 * User Registration - Creates different user types based on role
 * 
 * FACTORY PATTERN: Dynamic user creation based on role parameter
 * ENCAPSULATION: User creation logic hidden from client
 * VALIDATION: Business rules encapsulated within function
 */
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // ENCAPSULATION: Business rule validation
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // *** FACTORY PATTERN IMPLEMENTATION ***
        // Creates base user data
        const userData = { name, email, password };
        
        // FACTORY: Conditionally adds role-specific properties
        // STRATEGY: Different user types based on role parameter
        if (role && ['student', 'instructor', 'admin'].includes(role)) {
            userData.role = role; // Factory determines user type
        }

        // FACTORY: Creates appropriate user instance
        // ABSTRACTION: Complex user creation hidden behind simple interface
        const user = await User.create(userData);
        res.status(201).json({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            token: generateToken(user.id) 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const startTime = Date.now();
    const { email, password } = req.body;
    
    // Quick validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
        // Optimized query: Use index, minimal fields, and lean() for speed
        const queryStart = Date.now();
        const user = await User.findOne({ email })
            .select('_id email password name role')
            .lean() // Returns plain JS object for better performance
            .hint({ email: 1 }); // Force use of email index
        
        const queryTime = Date.now() - queryStart;
        console.log(`🔍 User query took ${queryTime}ms`);
        
        if (!user) {
            // Add small delay to prevent timing attacks but don't make it too long
            await new Promise(resolve => setTimeout(resolve, 100));
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Parallel operations for better performance
        const bcryptStart = Date.now();
        const [isValidPassword, token] = await Promise.all([
            bcrypt.compare(password, user.password),
            // Pre-generate token while password is being verified
            Promise.resolve(generateToken(user._id))
        ]);
        
        const bcryptTime = Date.now() - bcryptStart;
        console.log(`🔐 Password verification took ${bcryptTime}ms`);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Login completed in ${totalTime}ms for user: ${user.email}`);
        
        // Send minimal response for speed
        res.json({ 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            token: token
        });
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Login error after ${totalTime}ms:`, error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        university: user.university,
        address: user.address,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.university = university || user.university;
        user.address = address || user.address;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, university: updatedUser.university, address: updatedUser.address, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Request password reset
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // In a real application, you would send an email here
        // For demo purposes, we'll return the token in the response
        res.json({
            message: 'Password reset token generated',
            resetToken: resetToken, // Remove this in production!
            resetUrl: `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,

            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {

            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();


        res.json({
            message: 'Password has been reset successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id)
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    getProfile, 
    requestPasswordReset, 
    resetPassword 
};
