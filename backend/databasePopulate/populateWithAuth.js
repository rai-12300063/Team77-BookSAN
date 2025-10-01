const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Test user credentials (adjust if needed)
const testUser = {
    email: 'test@example.com',
    password: 'password123'
};

async function authenticateAndPopulate() {
    try {
        console.log('🔐 Creating new user for population...');
        
        // Always create a new user for this operation
        const populateUser = {
            name: 'Population Admin',
            email: `populate_${Date.now()}@example.com`,
            password: 'populate123'
        };
        
        try {
            // Register new user
            await axios.post(`${API_BASE_URL}/auth/register`, populateUser);
            console.log('✅ New user created');
        } catch (regError) {
            console.log('⚠️ User creation failed, trying existing credentials...');
        }
        
        // Login to get token
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: populateUser.email,
            password: populateUser.password
        });
        
        const token = loginResponse.data.token;
        
        if (!token) {
            // Fallback to test user
            console.log('🔄 Trying with test user credentials...');
            const fallbackResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
            return fallbackResponse.data.token;
        }
        
        console.log('✅ User authenticated successfully');
        return token;
        
    } catch (error) {
        console.error('❌ Authentication error:', error.response?.data?.message || error.message);
        throw error;
    }
}

async function populateModules(token) {
    try {
        console.log('🚀 Populating all modules with demo content...');
        
        const response = await axios.post(
            `${API_BASE_URL}/populate/populate-demo`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Success:', response.data.message);
        console.log('📊 Results:', response.data.results);
        
    } catch (error) {
        console.error('❌ Population error:', error.response?.data?.message || error.message);
        throw error;
    }
}

async function main() {
    try {
        const token = await authenticateAndPopulate();
        await populateModules(token);
        console.log('🎉 Module population completed successfully!');
    } catch (error) {
        console.error('💥 Failed to populate modules:', error.message);
    }
}

main();