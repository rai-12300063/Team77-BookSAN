const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getSystemStats,
    createUser,
    createInstructor,
    createStudent,
    deleteInstructor,
    deleteStudent,
    getUsersByRole
} = require('../controllers/adminController');
const { protect, requireAdmin, requirePermission } = require('../middleware/authMiddleware');
const { logApiAccess, requireOwnResourceOrRole } = require('../middleware/permissionMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireAdmin);
router.use(logApiAccess);

router.route('/users')
    .get(requirePermission('users:read'), getAllUsers)
    .post(requirePermission('users:write'), createUser);

router.route('/users/:id')
    .get(requirePermission('users:read'), requireOwnResourceOrRole('user', ['admin']), getUserById)
    .put(requirePermission('users:write'), requireOwnResourceOrRole('user', ['admin']), updateUserRole)
    .delete(requirePermission('users:delete'), requireOwnResourceOrRole('user', ['admin']), deleteUser);

router.get('/stats', requirePermission('system:manage'), getSystemStats);

// Role-specific user management routes
router.get('/users/role/:role', requirePermission('users:read'), getUsersByRole);
router.post('/instructors', requirePermission('users:write'), createInstructor);
router.post('/students', requirePermission('users:write'), createStudent);
router.delete('/instructors/:id', requirePermission('users:delete'), deleteInstructor);
router.delete('/students/:id', requirePermission('users:delete'), deleteStudent);

module.exports = router;