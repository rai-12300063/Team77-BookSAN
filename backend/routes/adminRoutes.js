const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getSystemStats,
    createUser
} = require('../controllers/adminController');
const { protect, requireAdmin, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/users')
    .get(requirePermission('users:read'), getAllUsers)
    .post(requirePermission('users:write'), createUser);

router.route('/users/:id')
    .get(requirePermission('users:read'), getUserById)
    .put(requirePermission('users:write'), updateUserRole)
    .delete(requirePermission('users:delete'), deleteUser);

router.get('/stats', requirePermission('system:manage'), getSystemStats);

module.exports = router;