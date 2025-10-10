/**
 * Analytics Test Script
 * Tests the analytics endpoints to verify they're working correctly
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

async function testAnalytics() {
    try {
        console.log('🔍 Testing Analytics API Endpoints...\n');

        // Test 1: Analytics endpoint (requires auth)
        console.log('1. Testing /api/progress/analytics');
        try {
            const analyticsResponse = await axios.get(`${BASE_URL}/api/progress/analytics`);
            console.log('✅ Analytics endpoint accessible');
            console.log('📊 Sample response structure:', Object.keys(analyticsResponse.data));
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  Analytics endpoint requires authentication (expected)');
            } else {
                console.log('❌ Analytics endpoint error:', error.message);
            }
        }

        // Test 2: Streaks endpoint
        console.log('\n2. Testing /api/progress/streaks');
        try {
            const streaksResponse = await axios.get(`${BASE_URL}/api/progress/streaks`);
            console.log('✅ Streaks endpoint accessible');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  Streaks endpoint requires authentication (expected)');
            } else {
                console.log('❌ Streaks endpoint error:', error.message);
            }
        }

        // Test 3: Learning Goals endpoint
        console.log('\n3. Testing /api/progress/learning-goals');
        try {
            const goalsResponse = await axios.get(`${BASE_URL}/api/progress/learning-goals`);
            console.log('✅ Learning Goals endpoint accessible');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('⚠️  Learning Goals endpoint requires authentication (expected)');
            } else {
                console.log('❌ Learning Goals endpoint error:', error.message);
            }
        }

        // Test 4: Server health
        console.log('\n4. Testing server health');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/`);
            console.log('✅ Server is running');
        } catch (error) {
            console.log('❌ Server health check failed:', error.message);
        }

        console.log('\n🎯 Analytics Testing Complete!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Login to the frontend to test with authentication');
        console.log('   2. Complete some learning activities to generate data');
        console.log('   3. Check dashboard for updated analytics');

    } catch (error) {
        console.error('💥 Test script error:', error.message);
    }
}

testAnalytics();