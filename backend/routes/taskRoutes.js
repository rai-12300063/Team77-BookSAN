const express = require('express');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, requireAnyRole, requirePermission } = require('../middleware/authMiddleware');
const {
    logApiAccess,
    validateResourceOwnership
} = require('../middleware/permissionMiddleware');
const router = express.Router();

// All task routes require authentication
router.use(protect);
router.use(requireAnyRole);
router.use(logApiAccess);

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', requirePermission('tasks:read'), getTasks);

// POST /api/tasks - Create a new task
router.post('/', requirePermission('tasks:write'), addTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', requirePermission('tasks:write'), validateResourceOwnership('task'), updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', requirePermission('tasks:delete'), validateResourceOwnership('task'), deleteTask);


module.exports = router;

