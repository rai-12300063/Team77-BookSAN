/**
 * Test Routes
 * API endpoints for accessing test results and running tests
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');

// Get comprehensive test results
router.get('/results', testController.getTestResults);

// Run comprehensive tests
router.post('/run', testController.runComprehensiveTests);

// Get specific test module details
router.get('/module/:moduleName', testController.getTestModule);

module.exports = router;