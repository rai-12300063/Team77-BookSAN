
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Enhanced validation
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (typeof email !== 'string') {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        if (email.length > 254) {
            return res.status(400).json({ message: 'Email address is too long' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Check if user recently requested a reset (rate limiting)
        if (user && user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
            const timeLeft = Math.ceil((user.resetPasswordExpires - Date.now()) / (1000 * 60));
            if (timeLeft > 50) { // If more than 50 minutes left, they just requested
                return res.status(429).json({
                    message: `Please wait ${timeLeft} minutes before requesting another password reset.`
                });
            }
        }

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before storing in database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Create reset URL
        const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // Email content
        const message = `
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset for your QUT-MIT Learning Progress Tracker account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${resetURL}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>QUT-MIT Learning Progress Tracker Team</p>
        `;

        // Send email
        const transporter = createEmailTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@qut-mit-tracker.com',
            to: user.email,
            subject: 'Password Reset Request - QUT-MIT Learning Tracker',
            html: message
        };

        if (process.env.NODE_ENV === 'production') {
            await transporter.sendMail(mailOptions);
        } else {
            // In development, log the email content
            console.log('\n=== PASSWORD RESET EMAIL ===');
            console.log(`To: ${user.email}`);
            console.log(`Reset URL: ${resetURL}`);
            console.log('=============================\n');
        }

        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Hash the token to compare with database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    getProfile,
    forgotPassword,
    resetPassword
};
