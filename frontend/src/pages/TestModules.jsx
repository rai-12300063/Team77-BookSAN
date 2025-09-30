import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const TestModules = () => {
    const [testResults, setTestResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTestResults();
    }, []);

    const fetchTestResults = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching test results from:', '/api/test/results');
            const response = await axios.get('/api/test/results');
            console.log('✅ Test results received:', response.data);
            setTestResults(response.data);
            setError(null);
        } catch (error) {
            console.error('❌ Error fetching test results:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url
            });
            setError(`Failed to load test results: ${error.response?.status || error.message}`);
            
            // Fallback test data for development
            console.log('🔧 Using fallback test data');
            const fallbackData = {
                summary: {
                    totalTests: 60,
                    passedTests: 28,
                    failedTests: 32,
                    coverage: 75,
                    duration: 3200,
                    timestamp: new Date().toISOString(),
                    framework: 'Mocha + Chai + Sinon'
                },
                modules: [
                    {
                        name: 'Authentication',
                        icon: '🔐',
                        functions: ['registerUser', 'loginUser', 'getProfile'],
                        status: 'passed',
                        tests: 12,
                        passed: 11,
                        failed: 1,
                        coverage: 92
                    },
                    {
                        name: 'Module System',
                        icon: '📚',
                        functions: ['getCourseModules', 'getModule', 'createModule', 'updateModule'],
                        status: 'failed',
                        tests: 10,
                        passed: 1,
                        failed: 9,
                        coverage: 45
                    },
                    {
                        name: 'Module Progress',
                        icon: '📈',
                        functions: ['getModuleProgress', 'updateModuleProgress', 'completeModule'],
                        status: 'failed',
                        tests: 5,
                        passed: 0,
                        failed: 5,
                        coverage: 30
                    }
                ],
                recentTests: [
                    {
                        name: 'Module System',
                        status: 'failed',
                        duration: 890,
                        timestamp: new Date(Date.now() - 180000).toISOString()
                    },
                    {
                        name: 'Module Progress',
                        status: 'failed',
                        duration: 450,
                        timestamp: new Date(Date.now() - 150000).toISOString()
                    }
                ]
            };
            setTestResults(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'passed': 
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': 
                return 'bg-red-100 text-red-800 border-red-200';
            case 'warning': 
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'running': 
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default: 
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'passed': 
                return '✅';
            case 'failed': 
                return '❌';
            case 'warning': 
                return '⚠️';
            case 'running': 
                return '🔄';
            default: 
                return '⏳';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading test results...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Test Modules System</h1>
                <p className="text-gray-600">Comprehensive testing dashboard for all backend functions</p>
            </div>

            {/* Test Summary */}
            {testResults?.summary && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Test Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalTests}</div>
                            <div className="text-sm text-gray-600">Total Tests</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{testResults.summary.passedTests}</div>
                            <div className="text-sm text-gray-600">Passed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{testResults.summary.failedTests}</div>
                            <div className="text-sm text-gray-600">Failed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{testResults.summary.coverage}%</div>
                            <div className="text-sm text-gray-600">Coverage</div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Framework: {testResults.summary.framework} | 
                        Duration: {Math.round(testResults.summary.duration / 1000)}s |
                        Last Run: {new Date(testResults.summary.timestamp).toLocaleString()}
                    </div>
                </div>
            )}

            {/* Test Modules */}
            {testResults?.modules && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Test Modules</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testResults.modules.map((module, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(module.status)}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold flex items-center">
                                        <span className="mr-2">{module.icon}</span>
                                        {module.name}
                                    </h3>
                                    <span className="text-lg">{getStatusIcon(module.status)}</span>
                                </div>
                                <div className="text-sm mb-2">
                                    <div>Tests: {module.tests} | Passed: {module.passed} | Failed: {module.failed}</div>
                                    <div>Coverage: {module.coverage}%</div>
                                </div>
                                <div className="text-xs">
                                    <strong>Functions:</strong>
                                    <div className="mt-1">
                                        {module.functions.map((func, i) => (
                                            <span key={i} className="inline-block bg-white bg-opacity-50 rounded px-2 py-1 mr-1 mb-1">
                                                {func}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Test Runs */}
            {testResults?.recentTests && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Recent Test Runs</h2>
                    <div className="space-y-3">
                        {testResults.recentTests.map((test, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center">
                                    <span className="mr-3">{getStatusIcon(test.status)}</span>
                                    <div>
                                        <div className="font-medium">{test.name}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(test.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {test.duration}ms
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Run Tests Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={fetchTestResults}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    🔄 Refresh Test Results
                </button>
            </div>
        </div>
    );
};

export default TestModules;