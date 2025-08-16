import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testCoursesApi = async () => {
    setLoading(true);
    try {
      console.log('Testing courses API...');
      const response = await axiosInstance.get('/api/courses');
      console.log('API Response:', response);
      setResult(`Success! Got ${response.data.courses?.length || 0} courses`);
    } catch (error) {
      console.error('API Error:', error);
      setResult(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <button 
        onClick={testCoursesApi}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Courses API'}
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre>{result}</pre>
      </div>
    </div>
  );
};

export default ApiTest;
