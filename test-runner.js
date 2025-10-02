#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class RoleBasedTestRunner {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, total: 0 },
      frontend: { passed: 0, failed: 0, total: 0 },
      overall: { passed: 0, failed: 0, total: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runCommand(command, args, cwd, description) {
    return new Promise((resolve, reject) => {
      this.log(`Starting: ${description}`, 'test');

      const process = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          this.log(`Completed: ${description}`, 'success');
          resolve({ stdout, stderr, code });
        } else {
          this.log(`Failed: ${description} (Exit code: ${code})`, 'error');
          resolve({ stdout, stderr, code });
        }
      });

      process.on('error', (error) => {
        this.log(`Error in ${description}: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  parseTestResults(output) {
    const results = { passed: 0, failed: 0, total: 0 };

    // Parse Mocha output
    const mochaMatch = output.match(/(\d+) passing/);
    const mochaFailMatch = output.match(/(\d+) failing/);

    if (mochaMatch) {
      results.passed = parseInt(mochaMatch[1]);
    }
    if (mochaFailMatch) {
      results.failed = parseInt(mochaFailMatch[1]);
    }

    // Parse Jest output
    const jestMatch = output.match(/Tests:\s+(\d+) failed,\s+(\d+) passed/);
    const jestPassMatch = output.match(/Tests:\s+(\d+) passed/);

    if (jestMatch) {
      results.failed = parseInt(jestMatch[1]);
      results.passed = parseInt(jestMatch[2]);
    } else if (jestPassMatch) {
      results.passed = parseInt(jestPassMatch[1]);
    }

    results.total = results.passed + results.failed;
    return results;
  }

  async runBackendTests() {
    this.log('🔧 Running Backend Integration Tests', 'info');

    const backendPath = path.join(__dirname, 'backend');

    try {
      // Run the comprehensive integration test suite
      const result = await this.runCommand(
        'npm',
        ['test', '--', '--grep', 'Complete Role-Based Access Control Integration Test Suite'],
        backendPath,
        'Backend Role-Based Integration Tests'
      );

      this.results.backend = this.parseTestResults(result.stdout + result.stderr);

      if (result.code !== 0) {
        this.log('Some backend tests failed, but continuing with frontend tests', 'warning');
      }

      return result;
    } catch (error) {
      this.log(`Backend test execution failed: ${error.message}`, 'error');
      return { code: 1, stdout: '', stderr: error.message };
    }
  }

  async runFrontendTests() {
    this.log('⚛️ Running Frontend Role-Based Tests', 'info');

    const frontendPath = path.join(__dirname, 'frontend');

    try {
      // Run frontend role-based tests
      const result = await this.runCommand(
        'npm',
        ['test', '--', '--watchAll=false', '--testNamePattern=(Role.*Test|route.*Protection)', '--verbose'],
        frontendPath,
        'Frontend Role-Based UI Tests'
      );

      this.results.frontend = this.parseTestResults(result.stdout + result.stderr);

      if (result.code !== 0) {
        this.log('Some frontend tests failed', 'warning');
      }

      return result;
    } catch (error) {
      this.log(`Frontend test execution failed: ${error.message}`, 'error');
      return { code: 1, stdout: '', stderr: error.message };
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    this.results.overall.passed = this.results.backend.passed + this.results.frontend.passed;
    this.results.overall.failed = this.results.backend.failed + this.results.frontend.failed;
    this.results.overall.total = this.results.overall.passed + this.results.overall.failed;

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ROLE-BASED ACCESS CONTROL TEST SUITE REPORT');
    console.log('='.repeat(80));

    console.log('\n📊 BACKEND INTEGRATION TESTS:');
    console.log(`   ✅ Passed: ${this.results.backend.passed}`);
    console.log(`   ❌ Failed: ${this.results.backend.failed}`);
    console.log(`   📈 Total:  ${this.results.backend.total}`);

    console.log('\n🖥️  FRONTEND UI TESTS:');
    console.log(`   ✅ Passed: ${this.results.frontend.passed}`);
    console.log(`   ❌ Failed: ${this.results.frontend.failed}`);
    console.log(`   📈 Total:  ${this.results.frontend.total}`);

    console.log('\n🎯 OVERALL RESULTS:');
    console.log(`   ✅ Total Passed: ${this.results.overall.passed}`);
    console.log(`   ❌ Total Failed: ${this.results.overall.failed}`);
    console.log(`   📈 Total Tests:  ${this.results.overall.total}`);
    console.log(`   ⏱️  Duration:     ${duration}s`);

    const successRate = this.results.overall.total > 0
      ? ((this.results.overall.passed / this.results.overall.total) * 100).toFixed(1)
      : 0;

    console.log(`   📊 Success Rate: ${successRate}%`);

    console.log('\n🔍 TEST COVERAGE AREAS:');
    console.log('   • Student role functionality and restrictions');
    console.log('   • Instructor role capabilities and boundaries');
    console.log('   • Admin role system management and oversight');
    console.log('   • Cross-role interactions and data isolation');
    console.log('   • Frontend UI component role-based visibility');
    console.log('   • Route protection and access control');
    console.log('   • Authentication and authorization security');

    console.log('\n' + '='.repeat(80));

    if (this.results.overall.failed === 0) {
      this.log('🎉 All role-based tests passed successfully!', 'success');
      return 0;
    } else {
      this.log(`⚠️ ${this.results.overall.failed} test(s) failed. Please review the output above.`, 'warning');
      return 1;
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive Role-Based Access Control Test Suite', 'info');

    // Check if required directories exist
    const backendExists = fs.existsSync(path.join(__dirname, 'backend'));
    const frontendExists = fs.existsSync(path.join(__dirname, 'frontend'));

    if (!backendExists) {
      this.log('Backend directory not found!', 'error');
      return 1;
    }

    if (!frontendExists) {
      this.log('Frontend directory not found!', 'error');
      return 1;
    }

    try {
      // Run backend tests
      await this.runBackendTests();

      // Run frontend tests
      await this.runFrontendTests();

      // Generate final report
      return this.generateReport();

    } catch (error) {
      this.log(`Test suite execution failed: ${error.message}`, 'error');
      return 1;
    }
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  const runner = new RoleBasedTestRunner();
  runner.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = RoleBasedTestRunner;