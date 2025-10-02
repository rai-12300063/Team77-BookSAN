// Test setup file
const dotenv = require('dotenv');

// Load environment variables for testing
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Global test configuration
global.testTimeout = 10000;
