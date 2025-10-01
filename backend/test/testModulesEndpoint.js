const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testModulesEndpoint() {
    try {
        // First, create a test user and login
        console.log('🔐 Creating test user...');
        
        const testUser = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'test123'
        };
        
        // Register
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        const token = registerResponse.data.token;
        console.log('✅ User registered successfully');
        
        // Test the modules endpoint
        const courseId = '68db8118a36a4ea005a2b50e'; // The course ID from the URL
        console.log(`🔍 Testing modules endpoint for course: ${courseId}`);
        
        const modulesResponse = await axios.get(
            `${API_BASE_URL}/modules/course/${courseId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Modules response:', {
            status: modulesResponse.status,
            totalModules: modulesResponse.data.totalModules,
            accessibleModules: modulesResponse.data.accessibleModules,
            modules: modulesResponse.data.modules?.length || 0
        });
        
        if (modulesResponse.data.modules && modulesResponse.data.modules.length > 0) {
            console.log('📚 First module:', {
                id: modulesResponse.data.modules[0]._id,
                title: modulesResponse.data.modules[0].title,
                moduleNumber: modulesResponse.data.modules[0].moduleNumber
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testModulesEndpoint();