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

// All routes require authentication
router.use(protect);

router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .get(getUserById)
    .put(updateUserRole)
    .delete(deleteUser);

router.get('/stats', getSystemStats);

// Role-specific user management routes
router.get('/users/role/:role', getUsersByRole);
router.post('/instructors', createInstructor);
router.post('/students', createStudent);
router.delete('/instructors/:id', deleteInstructor);
router.delete('/students/:id', deleteStudent);

module.exports = router;