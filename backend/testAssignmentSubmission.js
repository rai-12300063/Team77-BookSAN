const axios = require('axios');

async function testAssignmentSubmission() {
    try {
        console.log('🧪 Testing assignment submission functionality...');
        
        // Create a test user
        const testUser = {
            name: 'Assignment Test User',
            email: `assignment_test_${Date.now()}@example.com`,
            password: 'test123'
        };
        
        const registerResponse = await axios.post('http://localhost:5001/api/auth/register', testUser);
        const token = registerResponse.data.token;
        console.log('✅ User authenticated');
        
        // Test module and content IDs
        const moduleId = '68db8117a36a4ea005a2b4f0';
        
        console.log(`\n📝 Getting module data for: ${moduleId}`);
        
        // Get module data to find assignment content ID
        const moduleResponse = await axios.get(`http://localhost:5001/api/modules/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const moduleData = moduleResponse.data.module || moduleResponse.data;
        const assignmentContent = moduleData.contents?.find(c => c.type === 'assignment');
        
        if (!assignmentContent) {
            throw new Error('No assignment content found in module');
        }
        
        const contentId = assignmentContent.contentId;
        console.log(`✅ Found assignment content: ${assignmentContent.title} (ID: ${contentId})`);
        
        // Enroll in the course first
        const courseId = moduleData.courseId;
        try {
            await axios.post(`http://localhost:5001/api/courses/${courseId}/enroll`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Enrolled in course');
        } catch (enrollError) {
            console.log('ℹ️ Already enrolled or enrollment failed');
        }
        
        // Start module progress
        try {
            await axios.post(`http://localhost:5001/api/module-progress/${moduleId}/start`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Module progress started');
        } catch (startError) {
            console.log('ℹ️ Module progress may already exist:', startError.response?.data?.message);
        }
        
        // Submit assignment
        const assignmentData = {
            status: 'completed',
            timeSpent: 30,
            score: 85,
            response: 'This is my test assignment submission. I have completed the practical exercise as requested.',
            submittedAt: new Date().toISOString()
        };
        
        const submissionResponse = await axios.put(
            `http://localhost:5001/api/module-progress/${moduleId}/content/${contentId}`,
            assignmentData,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        console.log('✅ Assignment submitted successfully!');
        console.log('📊 Response:', {
            message: submissionResponse.data.message,
            hasProgress: !!submissionResponse.data.moduleProgress
        });
        
        // Verify the submission by getting module progress
        const progressResponse = await axios.get(`http://localhost:5001/api/module-progress/${moduleId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const contentProgress = progressResponse.data.moduleProgress?.contentProgress?.find(cp => cp.contentId === contentId);
        
        if (contentProgress) {
            console.log('✅ Assignment progress verified:', {
                status: contentProgress.status,
                score: contentProgress.score,
                hasResponse: !!contentProgress.response,
                submittedAt: contentProgress.submittedAt
            });
        } else {
            console.log('❌ Assignment progress not found');
        }
        
    } catch (error) {
        console.error('❌ Error testing assignment submission:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testAssignmentSubmission();