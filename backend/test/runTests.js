/**
 * Test Runner for Online Learning Progress Tracker
 * This script runs all test suites and provides a summary report.
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.bold.blue('\n======================================================'));
console.log(chalk.bold.blue('       ONLINE LEARNING PROGRESS TRACKER TESTS         '));
console.log(chalk.bold.blue('======================================================\n'));

const testSuites = [
  { 
    name: 'Main Functionality Tests', 
    command: 'npx mocha test/mainFunctionality.test.js --timeout 10000 --reporter spec'
  },
  { 
    name: 'API Functional Tests', 
    command: 'npx mocha test/functionalTest.js --timeout 10000 --reporter spec'
  },
  {
    name: 'OOP and Design Patterns Tests',
    command: 'npx mocha test/oopPatternsTest.js --timeout 10000 --reporter spec'
  }
];

let passedSuites = 0;
const totalSuites = testSuites.length;

for (const suite of testSuites) {
  console.log(chalk.cyan(`\n➤ Running ${suite.name}...\n`));
  
  try {
    execSync(suite.command, { stdio: 'inherit' });
    console.log(chalk.green(`\n✓ ${suite.name} completed successfully!`));
    passedSuites++;
  } catch (error) {
    console.log(chalk.red(`\n✗ ${suite.name} failed with errors.`));
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
  }
}

console.log(chalk.bold.blue('\n======================================================'));
console.log(chalk.bold.blue(`                     TEST SUMMARY                     `));
console.log(chalk.bold.blue('======================================================\n'));
console.log(`${passedSuites} of ${totalSuites} test suites passed`);

if (passedSuites === totalSuites) {
  console.log(chalk.green.bold('\n✅ All test suites passed!\n'));
  process.exit(0);
} else {
  console.log(chalk.yellow.bold(`\n⚠️ Some test suites failed. Please check the output above for details.\n`));
  process.exit(1);
}