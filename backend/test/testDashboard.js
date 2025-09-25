const axios = require('axios');

const testDashboard = async () => {
  try {
    // Test login first
    console.log('🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Test enrolled courses
    console.log('📚 Testing enrolled courses API...');
    const enrolledResponse = await axios.get('http://localhost:5001/api/courses/enrolled/my', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Enrolled courses:', enrolledResponse.data);
    
    // Test analytics
    console.log('📊 Testing analytics API...');
    const analyticsResponse = await axios.get('http://localhost:5001/api/progress/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Analytics:', analyticsResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testDashboard();
