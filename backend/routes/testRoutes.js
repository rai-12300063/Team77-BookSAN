/**
 * Test Routes
 * API endpoints for accessing test results and running tests
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Test API is working', timestamp: new Date().toISOString() });
});

// Get comprehensive test results
router.get('/results', testController.getTestResults);

// Get current test status and health check
router.get('/status', testController.getTestStatus);

// Run tests dynamically
router.post('/run-live', testController.runTests);

// Run comprehensive tests (legacy)
router.post('/run', testController.runComprehensiveTests);

// Get specific test module details
router.get('/module/:moduleName', testController.getTestModule);

module.exports = router;