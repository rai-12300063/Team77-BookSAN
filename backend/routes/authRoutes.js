
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect, requirePermission, requireAnyRole } = require('../middleware/authMiddleware');
const { logApiAccess } = require('../middleware/permissionMiddleware');
const router = express.Router();

// Public routes
router.post('/register', logApiAccess, registerUser);
router.post('/login', logApiAccess, loginUser);

// Protected routes
router.get('/profile', protect, requireAnyRole, requirePermission('profile:read'), logApiAccess, getProfile);
router.put('/profile', protect, requireAnyRole, requirePermission('profile:write'), logApiAccess, updateUserProfile);

module.exports = router;
