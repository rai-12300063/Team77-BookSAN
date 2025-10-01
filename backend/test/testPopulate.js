const axios = require('axios');

async function testPopulateEndpoint() {
    try {
        console.log('🧪 Testing populate endpoint...');
        
        const response = await axios.post('http://localhost:5001/api/modules/populate-all-demo', {}, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Response received:', {
            status: response.status,
            message: response.data.message,
            moduleStatus: {
                total: response.data.totalModules,
                populated: response.data.populatedModules,
                empty: response.data.emptyModules,
                newlyPopulated: response.data.newlyPopulated
            }
        });
        
        if (response.data.moduleDetails) {
            console.log('\n📚 Sample modules with content:');
            response.data.moduleDetails.forEach((module, index) => {
                console.log(`   ${index + 1}. ${module.title} - ${module.contentCount} items (${module.duration} min)`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing populate endpoint:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

// Wait a moment for server to start, then test
setTimeout(testPopulateEndpoint, 3000);