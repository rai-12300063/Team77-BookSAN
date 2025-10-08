/**
 * ModuleDetailPage.jsx - Individual module learning page with rich content display
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    useEffect(() => {
        fetchModuleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, moduleId]);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            
            // Fetch module details and progress in parallel
            const [moduleResponse, progressResponse] = await Promise.all([
                axios.get(`/api/modules/${moduleId}`),
                axios.get(`/api/module-progress/${moduleId}`).catch(() => ({ data: null }))
            ]);

            const moduleData = moduleResponse.data;
            const progressData = progressResponse.data;

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
                setSelectedContent(moduleData.contents[0]);
            }

            console.log('📚 Module data loaded:', { moduleData, progressData });
            
        } catch (error) {
            console.error('Error fetching module data:', error);
            setError('Failed to load module content');
        } finally {
            setLoading(false);
        }
    };

    const handleContentSelect = async (content) => {
        setSelectedContent(content);
        
        // Mark content as started if not already
        if (!contentProgress[content.contentId] || contentProgress[content.contentId].status === 'not-started') {
            try {
                await axios.post(`/api/module-progress/${moduleId}/content/${content.contentId}`, {
                    action: 'start'
                });
                
                // Update local progress
                setContentProgress(prev => ({
                    ...prev,
                    [content.contentId]: {
                        ...prev[content.contentId],
                        status: 'in-progress',
                        startedAt: new Date().toISOString()
                    }
                }));
            } catch (error) {
                console.error('Error starting content:', error);
            }
        }
    };

    const handleContentComplete = async (contentId) => {
        try {
            await axios.post(`/api/module-progress/${moduleId}/content/${contentId}`, {
                action: 'complete'
            });
            
            // Update local progress
            setContentProgress(prev => ({
                ...prev,
                [contentId]: {
                    ...prev[contentId],
                    status: 'completed',
                    completedAt: new Date().toISOString()
                }
            }));

            // Refresh module progress
            const progressResponse = await axios.get(`/api/module-progress/${moduleId}`);
            setModuleProgress(progressResponse.data);
            
        } catch (error) {
            console.error('Error completing content:', error);
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
                <div className="flex items-center justify-center h-64 text-gray-500">
                    Select a content item to view

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
                    {selectedContent.type === 'text' && contentData?.content && (
                        <div 
                            className="content-display"
                            dangerouslySetInnerHTML={{ __html: contentData.content }}
                        />
                    )}
                    
                    {selectedContent.type === 'video' && contentData && (
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
                                        <p>No content available</p>
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