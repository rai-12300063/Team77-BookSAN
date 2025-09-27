const express = require('express');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, requireAnyRole, requirePermission } = require('../middleware/authMiddleware');
const router = express.Router();

// All task routes require authentication
router.use(protect);
router.use(requireAnyRole);

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', requirePermission('tasks:read'), getTasks);

// POST /api/tasks - Create a new task
router.post('/', requirePermission('tasks:write'), addTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', requirePermission('tasks:write'), updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', requirePermission('tasks:delete'), deleteTask);


module.exports = router;

