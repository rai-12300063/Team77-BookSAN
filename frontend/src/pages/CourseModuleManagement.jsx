/**
 * CourseModuleManagement.jsx - Course Module Management Interface
 * Allows instructors and admins to add, edit, and manage course modules
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CourseModuleManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [generatingContent, setGeneratingContent] = useState(null); // Store moduleId being processed
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        week: 1,
        estimatedDuration: 60,
        topics: '',
        learningObjectives: '',
        difficulty: 'Beginner',
        prerequisites: ''
    });

    // Function declarations first - using useCallback to prevent unnecessary re-renders
    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching courses...');
            const response = await axiosInstance.get('/api/courses');
            console.log('Courses response:', response.data);
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchModules = useCallback(async (courseId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/modules/course/${courseId}`);
            console.log('Modules response:', response.data);
            
            // Handle different response structures
            const moduleData = response.data;
            if (Array.isArray(moduleData)) {
                setModules(moduleData);
            } else if (moduleData && Array.isArray(moduleData.modules)) {
                setModules(moduleData.modules);
            } else if (moduleData && Array.isArray(moduleData.data)) {
                setModules(moduleData.data);
            } else {
                console.warn('Unexpected modules response structure:', moduleData);
                setModules([]);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
            setModules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // React hooks must be called before any conditional returns
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        if (selectedCourse) {
            fetchModules(selectedCourse);
        }
    }, [selectedCourse, fetchModules]);

    // Debug user role and modules state
    console.log('User in CourseModuleManagement:', user);
    console.log('Modules state:', modules, 'Type:', typeof modules, 'Is Array:', Array.isArray(modules));
    
    // Check if user has appropriate role
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Access Denied!</strong>
                    <span className="block sm:inline"> You need instructor or admin privileges to access this page. Current role: {user?.role || 'Not logged in'}</span>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim()) {
            alert('Please enter a module title');
            return;
        }
        
        if (!formData.description.trim()) {
            alert('Please enter a module description');
            return;
        }
        
        if (!selectedCourse) {
            alert('Please select a course first');
            return;
        }
        
        setSubmitting(true);
        
        // Prepare module data outside try block so it's accessible in catch
        const moduleData = {
            title: formData.title,
            description: formData.description,
            courseId: selectedCourse,
            topics: typeof formData.topics === 'string' 
                ? formData.topics.split(',').map(topic => topic.trim()).filter(t => t)
                : (Array.isArray(formData.topics) ? formData.topics : []),
            learningObjectives: typeof formData.learningObjectives === 'string'
                ? formData.learningObjectives.split(',').map(obj => obj.trim()).filter(o => o)
                : (Array.isArray(formData.learningObjectives) ? formData.learningObjectives : []),
            prerequisites: {
                modules: [],
                skills: typeof formData.prerequisites === 'string'
                    ? formData.prerequisites.split(',').map(prereq => prereq.trim()).filter(p => p)
                    : (Array.isArray(formData.prerequisites) ? formData.prerequisites : []),
                courses: []
            },
            week: parseInt(formData.week) || 1,
            estimatedDuration: parseInt(formData.estimatedDuration) || 60,
            difficulty: formData.difficulty || 'Beginner' // Ensure difficulty is always set
        };
        
        console.log('Form data before processing:', formData);
        console.log('Form data types:', {
            topics: typeof formData.topics,
            learningObjectives: typeof formData.learningObjectives,
            prerequisites: typeof formData.prerequisites
        });
        console.log('Submitting module data:', moduleData);
        console.log('User context:', user);
        console.log('Auth token exists:', !!localStorage.getItem('token'));
        
        try {

            if (editingModule) {
                await axiosInstance.put(`/api/modules/${editingModule._id}`, moduleData);
                alert('Module updated successfully!');
            } else {
                await axiosInstance.post('/api/modules', moduleData);
                alert('Module created successfully!');
            }

            // Reset form and refresh modules
            resetForm();
            fetchModules(selectedCourse);
        } catch (error) {
            console.error('Error saving module:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                moduleData: moduleData
            });
            
            let errorMessage = 'Error saving module';
            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. You need instructor or admin privileges.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (module) => {
        setEditingModule(module);
        setFormData({
            title: module.title || '',
            description: module.description || '',
            week: module.week || 1,
            estimatedDuration: module.estimatedDuration || 60,
            topics: Array.isArray(module.topics) ? module.topics.join(', ') : (typeof module.topics === 'string' ? module.topics : ''),
            learningObjectives: Array.isArray(module.learningObjectives) ? module.learningObjectives.join(', ') : (typeof module.learningObjectives === 'string' ? module.learningObjectives : ''),
            difficulty: module.difficulty || 'Beginner',
            prerequisites: module.prerequisites && module.prerequisites.skills && Array.isArray(module.prerequisites.skills) 
                ? module.prerequisites.skills.join(', ') 
                : (Array.isArray(module.prerequisites) ? module.prerequisites.join(', ') : (typeof module.prerequisites === 'string' ? module.prerequisites : ''))
        });
        setShowAddForm(true);
    };

    const handleDelete = async (moduleId) => {
        if (window.confirm('Are you sure you want to delete this module?')) {
            try {
                await axiosInstance.delete(`/api/modules/${moduleId}`);
                alert('Module deleted successfully!');
                fetchModules(selectedCourse);
            } catch (error) {
                console.error('Error deleting module:', error);
                alert('Error deleting module');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            week: 1,
            estimatedDuration: 60,
            topics: '',
            learningObjectives: '',
            difficulty: 'Beginner',
            prerequisites: ''
        });
        setEditingModule(null);
        setShowAddForm(false);
    };

    const generateModuleContent = async (moduleId) => {
        try {
            setGeneratingContent(moduleId);
            
            // Find the module to update
            const moduleToUpdate = modules.find(m => m._id === moduleId);
            if (!moduleToUpdate) {
                alert('Module not found');
                return;
            }
            
            console.log('Generating content for module:', moduleToUpdate);

            // Generate sample content
            const generatedContent = [
                {
                    type: 'video',
                    title: `${moduleToUpdate.title} - Introduction Video`,
                    duration: Math.floor(Math.random() * 20) + 10,
                    contentData: {
                        videoUrl: `https://example.com/video/${moduleId}`,
                        description: `Introduction to ${moduleToUpdate.title} concepts and objectives.`
                    }
                },
                {
                    type: 'text',
                    title: `${moduleToUpdate.title} - Reading Material`,
                    duration: 15,
                    contentData: {
                        content: `Comprehensive reading material covering ${moduleToUpdate.title} fundamentals, key concepts, and practical applications.`,
                        wordCount: 1500
                    }
                },
                {
                    type: 'interactive',
                    title: `${moduleToUpdate.title} - Interactive Exercise`,
                    duration: 25,
                    contentData: {
                        exerciseType: 'simulation',
                        description: `Hands-on interactive exercise to practice ${moduleToUpdate.title} concepts.`
                    }
                },
                {
                    type: 'assignment',
                    title: `${moduleToUpdate.title} - Assignment`,
                    duration: 60,
                    contentData: {
                        instructions: `Complete the assignment on ${moduleToUpdate.title} topics covered in this module.`,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        maxScore: 100
                    }
                },
                {
                    type: 'quiz',
                    title: `${moduleToUpdate.title} - Knowledge Check`,
                    duration: 20,
                    contentData: {
                        questionCount: 10,
                        timeLimit: 1200,
                        passingScore: 70
                    }
                },
                {
                    type: 'resources',
                    title: `${moduleToUpdate.title} - Additional Resources`,
                    duration: 5,
                    contentData: {
                        links: [
                            { title: 'Official Documentation', url: 'https://docs.example.com' },
                            { title: 'Tutorial Videos', url: 'https://tutorials.example.com' },
                            { title: 'Practice Exercises', url: 'https://practice.example.com' }
                        ]
                    }
                }
            ];

            // Update the module with generated content
            const updateData = {
                title: moduleToUpdate.title,
                description: moduleToUpdate.description,
                courseId: moduleToUpdate.courseId,
                difficulty: moduleToUpdate.difficulty || 'Beginner',
                estimatedDuration: moduleToUpdate.estimatedDuration || 60,
                learningObjectives: Array.isArray(moduleToUpdate.learningObjectives) 
                    ? moduleToUpdate.learningObjectives 
                    : [],
                topics: Array.isArray(moduleToUpdate.topics) 
                    ? moduleToUpdate.topics 
                    : [],
                prerequisites: {
                    modules: [],
                    skills: [],
                    courses: []
                },
                contents: generatedContent
            };

            console.log('Updating module with generated content:', updateData);
            
            await axiosInstance.put(`/api/modules/${moduleId}`, updateData);
            alert('Module content generated successfully!');
            await fetchModules(selectedCourse);
        } catch (error) {
            console.error('Error generating content:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            
            let errorMessage = 'Error generating module content';
            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. You need instructor or admin privileges.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(errorMessage);
        } finally {
            setGeneratingContent(null);
        }
    };

    if (loading && courses.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading courses...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Module Management</h1>
                <p className="text-gray-600">Add, edit, and manage modules for your courses</p>
            </div>

            {/* Course Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Course
                    </label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a course...</option>
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourse && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        {showAddForm ? 'Cancel' : 'Add New Module'}
                    </button>
                )}
            </div>

            {/* Add/Edit Module Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {editingModule ? 'Edit Module' : 'Add New Module'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Module Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Introduction to React"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Week Number
                                </label>
                                <input
                                    type="number"
                                    name="week"
                                    value={formData.week}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="52"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Detailed description of the module content and objectives"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty Level
                                </label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topics (comma-separated)
                            </label>
                            <input
                                type="text"
                                name="topics"
                                value={formData.topics}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Components, JSX, Props, State"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Learning Objectives (comma-separated)
                            </label>
                            <textarea
                                name="learningObjectives"
                                value={formData.learningObjectives}
                                onChange={handleInputChange}
                                rows="2"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Understand React components, Build interactive UIs, Manage component state"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prerequisites (comma-separated, optional)
                            </label>
                            <input
                                type="text"
                                name="prerequisites"
                                value={formData.prerequisites}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Basic JavaScript, HTML/CSS"
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2 rounded-md transition duration-200 ${
                                    submitting 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {editingModule ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : (
                                    editingModule ? 'Update Module' : 'Create Module'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modules List */}
            {selectedCourse && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Course Modules ({Array.isArray(modules) ? modules.length : 0})
                        </h2>
                        <span className="text-sm text-gray-600">
                            {courses.find(c => c._id === selectedCourse)?.title}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <span className="text-gray-600 mt-2">Loading modules...</span>
                        </div>
                    ) : (!Array.isArray(modules) || modules.length === 0) ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📚</div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No modules yet</h3>
                            <p className="text-gray-600 mb-4">Start by adding your first module to this course</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                            >
                                Add First Module
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Array.isArray(modules) && modules.map((module) => (
                                <div key={module._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {module.title}
                                                </h3>
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                    Week {module.week || 'TBD'}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                    module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {module.difficulty}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-600 mb-3">{module.description}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Duration:</span> {module.estimatedDuration || 0} min
                                                </div>
                                                <div>
                                                    <span className="font-medium">Topics:</span> {Array.isArray(module.topics) ? module.topics.length : (module.topics ? 1 : 0)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Content Items:</span> {module.contents?.length || 0}
                                                </div>
                                            </div>

                                            {module.topics && module.topics.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium text-gray-700">Topics: </span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {module.topics.slice(0, 5).map((topic, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                                            >
                                                                {topic}
                                                            </span>
                                                        ))}
                                                        {module.topics.length > 5 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{module.topics.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(module)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => generateModuleContent(module._id)}
                                                disabled={generatingContent === module._id}
                                                className={`px-3 py-1 rounded text-sm transition duration-200 ${
                                                    generatingContent === module._id
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } text-white`}
                                            >
                                                {generatingContent === module._id ? (
                                                    <span className="flex items-center">
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                        Generating...
                                                    </span>
                                                ) : (
                                                    'Generate Content'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(module._id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseModuleManagement;