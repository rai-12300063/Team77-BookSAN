const express = require('express');

const logApiAccess = require('../middleware/logApiAccess');
const loginOptimization = require('../middleware/loginOptimization');
const { registerUser, loginUser, updateUserProfile, getProfile, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', logApiAccess, registerUser);
router.post('/login', loginOptimization, logApiAccess, loginUser);
// Add this if you want to use requestPasswordReset:
router.post('/forgot-password', logApiAccess, requestPasswordReset);
router.post('/reset-password/:token', logApiAccess, resetPassword);

// Protected routes
router.get('/profile', protect, logApiAccess, getProfile);
router.put('/profile', protect, logApiAccess, updateUserProfile);

module.exports = router;