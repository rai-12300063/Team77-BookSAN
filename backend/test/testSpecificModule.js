const axios = require('axios');

async function testSpecificModule() {
    try {
        // Test the specific module that's failing
        const moduleId = '68db8117a36a4ea005a2b4f0';
        const courseId = '68db8117a36a4ea005a2b4ed';
        
        console.log('🧪 Testing specific module:', moduleId);
        console.log('🧪 In course:', courseId);
        
        // Create a test user first
        const testUser = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'test123'
        };
        
        const registerResponse = await axios.post('http://localhost:5001/api/auth/register', testUser);
        const token = registerResponse.data.token;
        console.log('✅ User authenticated');
        
        // Test getting the specific module
        console.log('\n📍 Testing GET /api/modules/' + moduleId);
        const moduleResponse = await axios.get(`http://localhost:5001/api/modules/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const module = moduleResponse.data;
        console.log('✅ Module data received:', {
            id: module._id,
            title: module.title,
            courseId: module.courseId,
            hasContents: !!(module.contents && module.contents.length > 0),
            contentsCount: module.contents?.length || 0,
            estimatedDuration: module.estimatedDuration
        });
        
        if (module.contents && module.contents.length > 0) {
            console.log('\n📚 Module Contents:');
            module.contents.forEach((content, index) => {
                console.log(`   ${index + 1}. ${content.title} (${content.type}) - ${content.duration}min`);
                if (content.contentData) {
                    console.log(`      📄 Has content data: ${!!content.contentData.content || !!content.contentData.questions}`);
                }
            });
        } else {
            console.log('❌ No contents found in module!');
        }
        
        // Test getting the course
        console.log('\n📍 Testing GET /api/courses/' + courseId);
        const courseResponse = await axios.get(`http://localhost:5001/api/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Course data received:', {
            id: courseResponse.data._id,
            title: courseResponse.data.title,
            description: courseResponse.data.description
        });
        
    } catch (error) {
        console.error('❌ Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

// Wait a moment for server to be ready
setTimeout(testSpecificModule, 2000);