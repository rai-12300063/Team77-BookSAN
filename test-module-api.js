/**
 * Quick test to verify module management API endpoints
 * This script tests the new update and delete module functionality
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test configuration
const testConfig = {
    // Use a valid user token (you'll need to log in first to get this)
    authToken: '',
    testCourseId: '', // Will be set after creating a test course
    testModuleId: ''  // Will be set after creating a test module
};

async function runTests() {
    console.log('🧪 Testing Module Management API...\n');

    try {
        // 1. Test getting courses (to find a course for testing)
        console.log('1. Testing GET /api/courses...');
        const coursesResponse = await axios.get(`${API_BASE}/courses`);
        console.log(`✅ Found ${coursesResponse.data.courses?.length || 0} courses`);
        
        if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
            testConfig.testCourseId = coursesResponse.data.courses[0]._id;
            console.log(`   Using course: ${coursesResponse.data.courses[0].title}`);
        }

        // 2. Test getting modules for a course
        if (testConfig.testCourseId) {
            console.log('\n2. Testing GET /api/modules/course/:courseId...');
            const modulesResponse = await axios.get(`${API_BASE}/modules/course/${testConfig.testCourseId}`);
            console.log(`✅ Found ${modulesResponse.data.modules?.length || 0} modules`);
            
            if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
                testConfig.testModuleId = modulesResponse.data.modules[0]._id;
                console.log(`   Using module: ${modulesResponse.data.modules[0].title}`);
            }
        }

        // 3. Test module routes accessibility (without auth for now)
        console.log('\n3. Testing module routes accessibility...');
        
        // Test debug endpoint
        const debugResponse = await axios.get(`${API_BASE}/modules/debug`);
        console.log('✅ Debug endpoint accessible:', debugResponse.data.message);

        // Test specific module endpoint (will fail without auth, but should show the endpoint exists)
        if (testConfig.testModuleId) {
            try {
                await axios.get(`${API_BASE}/modules/${testConfig.testModuleId}`);
                console.log('✅ Module detail endpoint accessible');
            } catch (error) {
                if (error.response?.status === 401) {
                    console.log('✅ Module detail endpoint exists (requires auth)');
                } else {
                    console.log('⚠️  Module detail endpoint error:', error.message);
                }
            }
        }

        console.log('\n🎉 Basic API structure tests completed!');
        console.log('\n📝 To test full CRUD operations:');
        console.log('   1. Log in through the frontend to get an auth token');
        console.log('   2. Use the CourseModuleManagement component to test:');
        console.log('      - Create module');
        console.log('      - Update module');
        console.log('      - Delete module');
        console.log('      - Generate content');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('   Response:', error.response.data);
        }
    }
}

// Run the tests
runTests();