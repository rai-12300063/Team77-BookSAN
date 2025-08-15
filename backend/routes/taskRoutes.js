const express = require('express');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// All task routes require authentication
router.use(protect);

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', getTasks);

// POST /api/tasks - Create a new task
router.post('/', addTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
