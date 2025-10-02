
const express = require('express');

const { registerUser, loginUser, updateUserProfile, getProfile, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.post('/register', logApiAccess, registerUser);
router.post('/login', logApiAccess, loginUser);
router.post('/forgot-password', logApiAccess, forgotPassword);
router.post('/reset-password/:token', logApiAccess, resetPassword);

// Protected routes
router.get('/profile', protect, requireAnyRole, requirePermission('profile:read'), logApiAccess, getProfile);
router.put('/profile', protect, requireAnyRole, requirePermission('profile:write'), logApiAccess, updateUserProfile);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
