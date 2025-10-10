/**
 * ModuleDetailPage.jsx - Individual module learning page with rich content display
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import axios from '../axiosConfig';

const ModuleDetailPage = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    // const { } = useAuth(); // Commented out unused auth hook
    
    const [module, setModule] = useState(null);
    const [moduleProgress, setModuleProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [contentProgress, setContentProgress] = useState({});
    const [debugInfo, setDebugInfo] = useState({
        hasToken: !!localStorage.getItem('token'),
        lastApiCall: null,
        lastApiResponse: null,
        lastApiError: null
    });

    useEffect(() => {
        fetchModuleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, moduleId]);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Fetching module data for:', { courseId, moduleId });
            
            // Fetch module details and progress in parallel
            const [moduleResponse, progressResponse] = await Promise.all([
                axios.get(`/api/modules/${moduleId}`).catch(err => {
                    console.error('Module API error:', err.response?.data || err.message);
                    throw err;
                }),
                axios.get(`/api/module-progress/${moduleId}`).catch(err => {
                    console.warn('Progress API error (non-critical):', err.response?.data || err.message);
                    return { data: null };
                })
            ]);

            console.log('📊 API Responses:', {
                moduleResponse: moduleResponse?.data,
                progressResponse: progressResponse?.data
            });

            // Handle different response structures
            let moduleData = moduleResponse.data;
            
            // Check if response has nested module structure
            if (moduleData && moduleData.module) {
                moduleData = moduleData.module;
            }

            const progressData = progressResponse?.data;

            console.log('📚 Processed data:', {
                moduleData: {
                    id: moduleData?._id,
                    title: moduleData?.title,
                    contentsCount: moduleData?.contents?.length || 0,
                    contents: moduleData?.contents?.map(c => ({
                        contentId: c.contentId,
                        type: c.type,
                        title: c.title
                    })) || []
                },
                progressData: progressData ? { 
                    id: progressData._id,
                    completionPercentage: progressData.completionPercentage
                } : null
            });

            if (!moduleData) {
                throw new Error('No module data received from API');
            }

            setModule(moduleData);
            setModuleProgress(progressData);

            // Set initial content progress
            if (progressData?.contentProgress) {
                const progressMap = {};
                progressData.contentProgress.forEach(cp => {
                    progressMap[cp.contentId] = cp;
                });
                setContentProgress(progressMap);
            }

            // Select first content item by default
            if (moduleData.contents && moduleData.contents.length > 0) {
                console.log('✅ Setting first content item:', moduleData.contents[0]);
                setSelectedContent(moduleData.contents[0]);
            } else {
                console.warn('⚠️ No contents found in module');
            }
            
        } catch (error) {
            console.error('❌ Error fetching module data:', error);
            
            let errorMessage = 'Failed to load module content';
            if (error.response?.status === 404) {
                errorMessage = 'Module not found';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied to this module';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleContentSelect = async (content) => {
        setSelectedContent(content);
        
        // Mark content as started if not already
        const currentProgress = contentProgress[content.contentId];
        if (!currentProgress || currentProgress.status === 'not-started') {
            try {
                console.log('🔄 Starting content:', { contentId: content.contentId, moduleId });
                
                const response = await axios.post(`/api/module-progress/${moduleId}/content/${content.contentId}`, {
                    action: 'start'
                });
                
                console.log('✅ Content start response:', response.data);
                
                // Update local progress
                setContentProgress(prev => ({
                    ...prev,
                    [content.contentId]: {
                        ...prev[content.contentId],
                        status: 'in-progress',
                        startedAt: new Date().toISOString(),
                        timeSpent: 0
                    }
                }));
            } catch (error) {
                console.error('❌ Error starting content:', error);
                // Don't show an alert for start errors - this is less critical
            }
        }
    };

    const handleContentComplete = async (contentId) => {
        try {
            // Debug information
            const debugInfo = {
                contentId,
                moduleId,
                userToken: localStorage.getItem('token') ? 'Present' : 'Missing',
                apiEndpoint: `/api/module-progress/${moduleId}/content/${contentId}`,
                timestamp: new Date().toISOString()
            };
            
            console.log('🔄 Marking content as complete - Debug Info:', debugInfo);
            
            const response = await axios.post(`/api/module-progress/${moduleId}/content/${contentId}`, {
                action: 'complete'
            });
            
            console.log('✅ Content completion response:', response.data);
            console.log('📊 Response headers:', response.headers);
            console.log('🔢 Response status:', response.status);
            
            // Update debug info
            setDebugInfo(prev => ({
                ...prev,
                lastApiCall: debugInfo.apiEndpoint,
                lastApiResponse: response.data,
                lastApiError: null
            }));
            
            // Update local progress
            setContentProgress(prev => ({
                ...prev,
                [contentId]: {
                    ...prev[contentId],
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    isCompleted: true,
                    completionPercentage: 100
                }
            }));

            // Refresh module progress
            try {
                const progressResponse = await axios.get(`/api/module-progress/${moduleId}`);
                setModuleProgress(progressResponse.data?.moduleProgress || progressResponse.data);
                console.log('📊 Updated module progress:', progressResponse.data);
            } catch (progressError) {
                console.warn('⚠️ Could not refresh module progress:', progressError.message);
            }
            
            // Show success feedback
            alert('Content marked as complete! ✅');
            
        } catch (error) {
            console.error('❌ Error completing content:', error);
            console.error('❌ Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            // Update debug info with error
            setDebugInfo(prev => ({
                ...prev,
                lastApiCall: `/api/module-progress/${moduleId}/content/${contentId}`,
                lastApiResponse: null,
                lastApiError: {
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    timestamp: new Date().toISOString()
                }
            }));
            
            let errorMessage = 'Failed to mark content as complete';
            if (error.response?.status === 404) {
                errorMessage = 'Module or content not found';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed - please log in again';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(`Error: ${errorMessage}`);
        }
    };

    const renderContentItem = (content) => {
        const progress = contentProgress[content.contentId];
        const isCompleted = progress?.status === 'completed';
        const isInProgress = progress?.status === 'in-progress';
        
        return (
            <div
                key={content.contentId}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedContent?.contentId === content.contentId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleContentSelect(content)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Content Type Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            content.type === 'video' ? 'bg-red-100 text-red-600' :
                            content.type === 'text' ? 'bg-blue-100 text-blue-600' :
                            content.type === 'interactive' ? 'bg-green-100 text-green-600' :
                            content.type === 'assignment' ? 'bg-orange-100 text-orange-600' :
                            content.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {content.type === 'video' && '🎥'}
                            {content.type === 'text' && '📖'}
                            {content.type === 'interactive' && '🧪'}
                            {content.type === 'assignment' && '📝'}
                            {content.type === 'quiz' && '❓'}
                        </div>
                        
                        {/* Content Info */}
                        <div>
                            <h4 className="font-medium text-gray-800">{content.title}</h4>
                            <p className="text-sm text-gray-600">{content.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">⏱️ {content.duration} min</span>
                                {content.isRequired && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Required</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Status */}
                    <div className="flex items-center">
                        {isCompleted && (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                        {isInProgress && !isCompleted && (
                            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">⋯</span>
                            </div>
                        )}
                        {!isInProgress && !isCompleted && (
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>

                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContentDisplay = () => {
        if (!selectedContent) {
            return (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📖</div>
                    <h3 className="text-xl font-medium mb-2">Select Content to Begin</h3>
                    <p>Choose a content item from the sidebar to start learning</p>
                    {module && module.contents && module.contents.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800">
                                This module doesn't have content yet. Please check back later or contact your instructor.
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        const { contentData } = selectedContent;
        const progress = contentProgress[selectedContent.contentId];
        const isCompleted = progress?.status === 'completed';

        return (
            <div className="space-y-6">
                {/* Content Header */}
                <div className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedContent.title}</h2>
                            <p className="text-gray-600 mt-1">{selectedContent.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500">⏱️ {selectedContent.duration} minutes</span>
                                <span className={`text-sm px-2 py-1 rounded ${
                                    selectedContent.type === 'video' ? 'bg-red-100 text-red-600' :
                                    selectedContent.type === 'text' ? 'bg-blue-100 text-blue-600' :
                                    selectedContent.type === 'interactive' ? 'bg-green-100 text-green-600' :
                                    selectedContent.type === 'assignment' ? 'bg-orange-100 text-orange-600' :
                                    selectedContent.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {selectedContent.type.charAt(0).toUpperCase() + selectedContent.type.slice(1)}
                                </span>
                            </div>
                        </div>
                        
                        {!isCompleted && (
                            <button
                                onClick={() => handleContentComplete(selectedContent.contentId)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                            >
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="prose max-w-none">
                    {/* Text Content */}
                    {selectedContent.type === 'text' && (
                        <div className="space-y-4">
                            {contentData?.content ? (
                                <div 
                                    className="content-display"
                                    dangerouslySetInnerHTML={{ __html: contentData.content }}
                                />
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="text-4xl mb-4 text-center">📖</div>
                                    <h3 className="text-lg font-medium mb-2">Text Content</h3>
                                    <p className="text-gray-600">
                                        {selectedContent.description || 'Reading material for this lesson will be available here.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Video Content */}
                    {selectedContent.type === 'video' && (
                        <div className="space-y-4">
                            <div className="bg-gray-100 rounded-lg p-8 text-center">
                                <div className="text-6xl mb-4">🎥</div>
                                <h3 className="text-lg font-medium mb-2">Video Content</h3>
                                <p className="text-gray-600">{contentData.transcript || 'Video content will be displayed here'}</p>
                                {contentData.videoUrl && (
                                    <a 
                                        href={contentData.videoUrl} 
                                        className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Watch Video
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {selectedContent.type === 'interactive' && contentData && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-4">🧪 Interactive Exercise</h3>
                                <p className="mb-4">{contentData.instructions || 'Interactive exercise instructions'}</p>
                                
                                {contentData.exercises && contentData.exercises.map((exercise, index) => (
                                    <div key={exercise.id || index} className="bg-white border rounded p-4 mb-4">
                                        <h4 className="font-medium mb-2">{exercise.title}</h4>
                                        <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                                        
                                        {exercise.starterCode && (
                                            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                                                <pre>{exercise.starterCode}</pre>
                                            </div>
                                        )}
                                        
                                        {exercise.hints && (
                                            <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-700">💡 Hints:</p>
                                                <ul className="text-sm text-gray-600 mt-1">
                                                    {exercise.hints.map((hint, hintIndex) => (
                                                        <li key={hintIndex} className="ml-4">• {hint}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {selectedContent.type === 'assignment' && contentData && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-4">📝 Assignment</h3>
                                <div 
                                    className="assignment-content"
                                    dangerouslySetInnerHTML={{ __html: contentData.instructions || 'Assignment instructions will appear here' }}
                                />
                                
                                {contentData.dueDate && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-sm">
                                            <strong>Due Date:</strong> {new Date(contentData.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                
                                {contentData.maxScore && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Max Score:</strong> {contentData.maxScore} points
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {selectedContent.type === 'quiz' && contentData && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-4">❓ Knowledge Check Quiz</h3>
                                <p className="mb-4">This quiz has {contentData.questions?.length || 0} questions.</p>
                                
                                {contentData.passingScore && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        <strong>Passing Score:</strong> {contentData.passingScore}%
                                    </p>
                                )}
                                
                                <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition duration-200">
                                    Start Quiz
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Fallback for missing content data or unknown types */}
                    {(!contentData || (selectedContent.type !== 'text' && selectedContent.type !== 'video' && 
                      selectedContent.type !== 'interactive' && selectedContent.type !== 'assignment' && 
                      selectedContent.type !== 'quiz')) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="text-center">
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="text-lg font-medium mb-2">{selectedContent.title}</h3>
                                <p className="text-gray-600 mb-4">
                                    {selectedContent.description || 'Content for this item is being prepared.'}
                                </p>
                                <div className="text-sm text-gray-500">
                                    <p>Content Type: {selectedContent.type}</p>
                                    <p>Duration: {selectedContent.duration} minutes</p>
                                </div>
                                {!contentData && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-sm text-yellow-800">
                                            Content data is not available yet. Please check back later.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading module content...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Module</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate(`/courses/${courseId}/modules`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Back to Modules
                    </button>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested module could not be found.</p>
                    <button
                        onClick={() => navigate(`/courses/${courseId}/modules`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Back to Modules
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/courses/${courseId}/modules`)}
                        className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
                    >
                        ← Back to Modules
                    </button>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{module.title}</h1>
                        <p className="text-gray-600 mb-4">{module.description}</p>
                        
                        {/* Progress Bar */}
                        {moduleProgress && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Progress</span>
                                    <span>{moduleProgress.completionPercentage || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${moduleProgress.completionPercentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        
                        {/* Debug Panel - Only show if there's an error or in development */}
                        {(debugInfo.lastApiError || process.env.NODE_ENV === 'development') && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Info</h4>
                                <div className="text-xs text-yellow-700 space-y-1">
                                    <div>Auth Token: {debugInfo.hasToken ? '✅ Present' : '❌ Missing'}</div>
                                    {debugInfo.lastApiCall && (
                                        <div>Last API: {debugInfo.lastApiCall}</div>
                                    )}
                                    {debugInfo.lastApiError && (
                                        <div className="text-red-600">
                                            Error: {debugInfo.lastApiError.status} - {debugInfo.lastApiError.message}
                                        </div>
                                    )}
                                    {debugInfo.lastApiResponse && (
                                        <div className="text-green-600">
                                            Success: {debugInfo.lastApiResponse.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Content Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Content</h3>
                            <div className="space-y-3">
                                            {module.contents && module.contents.length > 0 ? (
                                    module.contents
                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                                        .map(renderContentItem)
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">📚</div>
                                        <p>No content available for this module</p>
                                        <p className="text-sm mt-2">Content may still be being generated</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {renderContentDisplay()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleDetailPage;