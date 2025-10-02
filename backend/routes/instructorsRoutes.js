
const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/addinstructorController');
const { protect, adminOnly } = require('../middleware/auth');
console.log('🔥 INSTRUCTORS ROUTES LOADED'); // ADD THIS LINE

// Authentication required for all routes
router.use(protect);

// GET /api/instructors - Get all instructors (accessible by authenticated users)
router.get('/', instructorController.getAllInstructors);

// GET /api/instructors/stats - Get instructor statistics (accessible by authenticated users)
router.get('/stats', instructorController.getInstructorStats);

// GET /api/instructors/:id - Get instructor by ID (accessible by authenticated users)
router.get('/:id', instructorController.getInstructorById);

// Admin-only routes for creating/updating/deleting
router.post('/', adminOnly, instructorController.createInstructor);
router.put('/:id', adminOnly, instructorController.updateInstructor);
router.delete('/:id', adminOnly, instructorController.deleteInstructor);

module.exports = router;
