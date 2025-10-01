/**
 * Test runner for all design patterns
 * Run this file to verify all patterns are working correctly
 */

const { demonstrateAllPatterns, demoSpecificPattern } = require('../patterns/index');

async function runTests() {
  console.log('🧪 DESIGN PATTERNS TEST SUITE');
  console.log('='.repeat(50));
  
  try {
    console.log('\n📋 Testing individual patterns...\n');
    
    const patterns = [
      'adapter', 'decorator', 'facade', 'factory', 'middleware',
      'observer', 'prototype', 'proxy', 'singleton', 'strategy'
    ];
    
    let passedTests = 0;
    let failedTests = 0;
    
    for (const pattern of patterns) {
      try {
        console.log(`Testing ${pattern}...`);
        await demoSpecificPattern(pattern);
        console.log(`✅ ${pattern} pattern test PASSED\n`);
        passedTests++;
      } catch (error) {
        console.error(`❌ ${pattern} pattern test FAILED:`, error.message);
        failedTests++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passedTests}/${patterns.length}`);
    console.log(`❌ Failed: ${failedTests}/${patterns.length}`);
    console.log(`📈 Success Rate: ${((passedTests / patterns.length) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Design patterns are working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the error messages above.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };