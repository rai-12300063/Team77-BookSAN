const axios = require('axios');

async function testModulePageFix() {
    try {
        console.log('🧪 Testing the fixed module endpoint...');
        
        // Create a test user
        const testUser = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'test123'
        };
        
        const registerResponse = await axios.post('http://localhost:5001/api/auth/register', testUser);
        const token = registerResponse.data.token;
        console.log('✅ User authenticated');
        
        // Test the specific module that was failing
        const moduleId = '68db8117a36a4ea005a2b4f0';
        console.log(`\n📍 Testing GET /api/modules/${moduleId}`);
        
        const moduleResponse = await axios.get(`http://localhost:5001/api/modules/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ API Response structure:', Object.keys(moduleResponse.data));
        
        // Check if we get the expected structure
        const response = moduleResponse.data;
        if (response.module) {
            console.log('✅ Module data found in response.module:', {
                id: response.module._id,
                title: response.module.title,
                courseId: response.module.courseId,
                contentsCount: response.module.contents?.length || 0
            });
        } else if (response._id) {
            console.log('✅ Module data found at root level:', {
                id: response._id,
                title: response.title,
                courseId: response.courseId,
                contentsCount: response.contents?.length || 0
            });
        } else {
            console.log('❌ No module data found in expected locations');
        }
        
        // Test the frontend-compatible access
        const moduleData = response.module || response;
        if (moduleData && moduleData.title && moduleData.contents) {
            console.log('✅ Frontend can now access:', {
                title: moduleData.title,
                hasContents: moduleData.contents.length > 0,
                firstContentTitle: moduleData.contents[0]?.title
            });
        } else {
            console.log('❌ Frontend would still have issues accessing module data');
        }
        
    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testModulePageFix();