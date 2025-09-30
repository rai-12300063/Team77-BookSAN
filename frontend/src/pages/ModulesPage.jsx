/**
 * ModulesPage.jsx - Main page for viewing course modules
 * Integrates with the new module system
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModuleList from '../components/modules/ModuleList';
import axios from '../axiosConfig';

const ModulesPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if debug mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug') === 'true';

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
            setError('Failed to load course');
            if (error.response?.status === 404) {
                navigate('/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModuleSelect = (moduleId) => {
        // Navigate to module learning page
        navigate(`/courses/${courseId}/modules/${moduleId}`);
    };

    // Enable debug mode with ?debug=true URL parameter
    if (debugMode) {
        return <ModuleDebug />;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading course modules...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                    <button
                        onClick={fetchCourseData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
                    <p className="mt-1 text-sm text-gray-500">The course you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Course Header */}
            <div className="mb-8">
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                    <button
                        onClick={() => navigate('/courses')}
                        className="hover:text-gray-700"
                    >
                        Courses
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="hover:text-gray-700"
                    >
                        {course.title}
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">Modules</span>
                </nav>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                            <p className="text-gray-600 mb-4">{course.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    {course.category}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {course.difficulty}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {course.estimatedDuration ? `${course.estimatedDuration} hours` : 'Self-paced'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <button
                                onClick={() => navigate(`/courses/${courseId}`)}
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Back to Course
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module List */}
            <ModuleList 
                courseId={courseId} 
                onModuleSelect={handleModuleSelect}
                className="mb-8"
            />

            {/* Course Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Course Overview
                    </button>
                    
                    {user?.role === 'instructor' && (
                        <button
                            onClick={() => alert('Module management for instructors coming soon!')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Manage Modules
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModulesPage;