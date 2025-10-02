/**
 * ModuleDetailPage.jsx - Individual module learning page
 * Displays module content, progress tracking, and learning interface
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModuleCompletionStatus from '../components/modules/ModuleCompletionStatus';
import axios from '../axiosConfig';

const ModuleDetailPage = () => {
    const { courseId, moduleId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [module, setModule] = useState(null);
    const [moduleProgress, setModuleProgress] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeContentIndex, setActiveContentIndex] = useState(0);
    const [assignmentResponses, setAssignmentResponses] = useState({}); // Track assignment responses

    useEffect(() => {
        // Validate IDs before fetching
        if (!courseId || !moduleId) {
            setError('Invalid course or module ID');
            setLoading(false);
            return;
        }
        
        fetchModuleData();
    }, [courseId, moduleId]);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            
            console.log('Fetching module data for:', { courseId, moduleId });
            
            // Fetch module, course, and progress data
            const [moduleResponse, courseResponse, progressResponse] = await Promise.all([
                axios.get(`/api/modules/${moduleId}`),
                axios.get(`/api/courses/${courseId}`),
                axios.get(`/api/module-progress/${moduleId}`).catch(() => ({ data: null }))
            ]);

            console.log('Fetched data:', {
                module: moduleResponse.data,
                course: courseResponse.data,
                progress: progressResponse.data
            });

            // The backend returns { module: moduleData, progress: ..., recommendations: ... }
            const moduleData = moduleResponse.data.module || moduleResponse.data;
            setModule(moduleData);
            setCourse(courseResponse.data);
            setModuleProgress(progressResponse.data?.moduleProgress);

            // If no progress exists, try to start the module
            if (!progressResponse.data?.moduleProgress) {
                try {
                    const startResponse = await axios.post(`/api/module-progress/${moduleId}/start`);
                    setModuleProgress(startResponse.data.moduleProgress);
                } catch (startError) {
                    console.error('Error starting module:', startError);
                    // Continue without progress - user can still view content
                }
            }

        } catch (error) {
            console.error('Error fetching module data:', error);
            setError('Failed to load module. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateContentProgress = async (contentId, progressData) => {
        try {
            await axios.put(`/api/module-progress/${moduleId}/content/${contentId}`, progressData);
            // Refresh module progress
            const progressResponse = await axios.get(`/api/module-progress/${moduleId}`);
            setModuleProgress(progressResponse.data?.moduleProgress);
        } catch (error) {
            console.error('Error updating content progress:', error);
        }
    };

    const handleContentCompletion = async (contentIndex) => {
        const content = module.contents[contentIndex];
        if (!content) return;

        try {
            await updateContentProgress(content.contentId, {
                status: 'completed',
                timeSpent: 300, // 5 minutes default
                score: 100
            });

            // Move to next content if available
            if (contentIndex < module.contents.length - 1) {
                setActiveContentIndex(contentIndex + 1);
            }
        } catch (error) {
            console.error('Error completing content:', error);
        }
    };

    const handleAssignmentSubmission = async (contentIndex, assignmentResponse) => {
        const content = module.contents[contentIndex];
        if (!content || content.type !== 'assignment') return;

        try {
            console.log('📝 Submitting assignment:', content.title);
            
            // Submit the assignment with the user's response
            await updateContentProgress(content.contentId, {
                status: 'completed',
                timeSpent: content.duration || 30, // Use content duration or default
                score: 85, // Default score for assignment submission
                response: assignmentResponse, // Store the user's assignment response
                submittedAt: new Date().toISOString()
            });

            alert('Assignment submitted successfully! 🎉');

            // Move to next content if available
            if (contentIndex < module.contents.length - 1) {
                setActiveContentIndex(contentIndex + 1);
            } else {
                // If this was the last content, check if module is complete
                const allCompleted = module.contents.every((c, idx) => {
                    if (idx === contentIndex) return true; // Current one just completed
                    const progress = moduleProgress?.contentProgress?.find(cp => cp.contentId === c.contentId);
                    return progress?.status === 'completed';
                });
                
                if (allCompleted) {
                    alert('🎓 Congratulations! You have completed this module!');
                }
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            alert('Failed to submit assignment. Please try again.');
        }
    };

    const renderContent = (content, index) => {
        if (!content) return null;

        const progress = moduleProgress?.contentProgress?.find(cp => cp.contentId === content.contentId);
        const isCompleted = progress?.status === 'completed';
        const isActive = index === activeContentIndex;

        const getContentIcon = (type) => {
            switch (type) {
                case 'video':
                    return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                    );
                case 'quiz':
                    return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    );
                case 'assignment':
                    return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                    );
                default:
                    return (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                    );
            }
        };

        return (
            <div
                key={content.contentId}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setActiveContentIndex(index)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {getContentIcon(content.type)}
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">{content.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{content.type}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {content.duration && (
                            <span className="text-xs text-gray-500">{content.duration}min</span>
                        )}
                        {isCompleted && (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderActiveContent = () => {
        if (!module?.contents || module.contents.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
                        <p className="text-gray-500 mb-6">This module doesn't have any learning content yet.</p>
                        
                        {/* Add Sample Content Button (Development) */}
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    const response = await axios.post(`/api/modules/${moduleId}/add-sample-content`);
                                    console.log('Sample content added:', response.data);
                                    // Refresh the module data
                                    await fetchModuleData();
                                } catch (error) {
                                    console.error('Error adding sample content:', error);
                                    setError('Failed to add sample content');
                                }
                            }}
                            className="mb-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            🚀 Add Sample Content (Development)
                        </button>
                        
                        {/* Temporary demo content */}
                        <div className="bg-blue-50 rounded-lg p-6 text-left">
                            <h4 className="text-lg font-semibold text-blue-900 mb-3">Demo: {module.title}</h4>
                            <div className="prose text-blue-800">
                                <p className="mb-4">{module.description}</p>
                                
                                <h5 className="font-medium mb-2">Learning Objectives:</h5>
                                <ul className="list-disc list-inside mb-4 space-y-1">
                                    {module.learningObjectives?.map((objective, index) => (
                                        <li key={index}>{objective}</li>
                                    )) || [
                                        <li key="1">Master the fundamental concepts</li>,
                                        <li key="2">Apply knowledge through practical exercises</li>,
                                        <li key="3">Develop problem-solving skills</li>
                                    ]}
                                </ul>
                                
                                <div className="bg-white rounded p-4 border border-blue-200">
                                    <p className="text-sm text-blue-700">
                                        <strong>Note:</strong> This is a demo view. In a complete implementation, 
                                        this module would contain interactive lessons, videos, quizzes, and assignments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeContentIndex >= module.contents.length) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-500">Content not found</p>
                </div>
            );
        }

        const content = module.contents[activeContentIndex];
        const progress = moduleProgress?.contentProgress?.find(cp => cp.contentId === content.contentId);
        const isCompleted = progress?.status === 'completed';

        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{content.title}</h3>
                    {!isCompleted && (
                        <button
                            onClick={() => handleContentCompletion(activeContentIndex)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Mark Complete
                        </button>
                    )}
                </div>

                <div className="prose max-w-none">
                    {content.description && (
                        <p className="text-gray-600 mb-4">{content.description}</p>
                    )}
                    
                    {/* Content rendering based on type */}
                    {content.type === 'text' && (
                        <div className="prose max-w-none">
                            {content.contentData?.content ? (
                                <div dangerouslySetInnerHTML={{ __html: content.contentData.content }} />
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p>Text content would be rendered here.</p>
                                    <p className="text-sm text-gray-500 mt-4">
                                        This is a placeholder for {content.type} content.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {content.type === 'video' && (
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            {content.contentData?.videoUrl ? (
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe
                                        src={content.contentData.videoUrl}
                                        title={content.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-64"
                                    />
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                    <p>Video player would be embedded here.</p>
                                    <p className="text-sm text-gray-500 mt-2">Duration: {content.duration || 'N/A'} minutes</p>
                                </div>
                            )}
                            {content.contentData?.transcript && (
                                <div className="p-4 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-2">Transcript</h5>
                                    <p className="text-sm text-gray-600">{content.contentData.transcript}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {content.type === 'quiz' && (
                        <div className="bg-white border border-gray-200 rounded-lg">
                            {content.contentData?.questions && content.contentData.questions.length > 0 ? (
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-medium text-gray-900">Quiz Questions</h4>
                                            <span className="text-sm text-gray-500">
                                                {content.contentData.questions.length} questions • {content.duration} minutes
                                            </span>
                                        </div>
                                        {content.contentData.passingScore && (
                                            <p className="text-sm text-blue-600 mb-4">
                                                Passing Score: {content.contentData.passingScore}%
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {content.contentData.questions.map((question, qIndex) => (
                                            <div key={question.questionId || qIndex} className="border border-gray-200 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-900 mb-3">
                                                    Question {qIndex + 1}: {question.question}
                                                </h5>
                                                
                                                {question.type === 'multiple-choice' && question.options && (
                                                    <div className="space-y-2">
                                                        {question.options.map((option, oIndex) => (
                                                            <div key={oIndex} className={`p-2 rounded border ${
                                                                question.correctAnswer === oIndex 
                                                                    ? 'bg-green-50 border-green-200' 
                                                                    : 'bg-gray-50 border-gray-200'
                                                            }`}>
                                                                <span className="text-sm">{option}</span>
                                                                {question.correctAnswer === oIndex && (
                                                                    <span className="ml-2 text-green-600 text-xs">✓ Correct</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {question.explanation && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>Explanation:</strong> {question.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <button 
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            onClick={() => handleContentCompletion(index)}
                                            disabled={isCompleted}
                                        >
                                            {isCompleted ? '✅ Quiz Completed' : 'Complete Quiz'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <p>Interactive quiz would be rendered here.</p>
                                    <p className="text-sm text-gray-500 mt-2">Questions: {content.contentData?.questions?.length || 'Multiple'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {content.type === 'assignment' && (
                        <div className="bg-white border border-gray-200 rounded-lg">
                            {content.contentData?.instructions ? (
                                <div className="p-6">
                                    <div className="prose max-w-none mb-6">
                                        <div dangerouslySetInnerHTML={{ __html: content.contentData.instructions }} />
                                    </div>
                                    
                                    {content.contentData.rubric && content.contentData.rubric.length > 0 && (
                                        <div className="mb-6">
                                            <h5 className="font-medium text-gray-900 mb-3">Grading Rubric</h5>
                                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Criterion</th>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Points</th>
                                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {content.contentData.rubric.map((item, rIndex) => (
                                                            <tr key={rIndex} className="border-t border-gray-200">
                                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.criterion}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-600">{item.maxPoints}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Your Response
                                        </label>
                                        <textarea
                                            rows={8}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your assignment response here..."
                                            value={assignmentResponses[content.contentId] || ''}
                                            onChange={(e) => setAssignmentResponses(prev => ({
                                                ...prev,
                                                [content.contentId]: e.target.value
                                            }))}
                                        />
                                        <button 
                                            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            onClick={() => handleAssignmentSubmission(index, assignmentResponses[content.contentId] || '')}
                                            disabled={!assignmentResponses[content.contentId] || assignmentResponses[content.contentId].trim().length === 0 || isCompleted}
                                        >
                                            {isCompleted ? '✅ Assignment Submitted' : 'Submit Assignment'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                    <p>Assignment instructions would be displayed here.</p>
                                    <p className="text-sm text-gray-500 mt-2">Duration: {content.duration} minutes</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => setActiveContentIndex(Math.max(0, activeContentIndex - 1))}
                        disabled={activeContentIndex === 0}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    
                    <span className="text-sm text-gray-500 self-center">
                        {activeContentIndex + 1} of {module.contents.length}
                    </span>
                    
                    <button
                        onClick={() => setActiveContentIndex(Math.min(module.contents.length - 1, activeContentIndex + 1))}
                        disabled={activeContentIndex === module.contents.length - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading module...</span>
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
                        onClick={fetchModuleData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">Module not found</h3>
                    <p className="mt-1 text-sm text-gray-500">The module you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
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
                        {course?.title || 'Course'}
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <button
                        onClick={() => navigate(`/courses/${courseId}/modules`)}
                        className="hover:text-gray-700"
                    >
                        Modules
                    </button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">{module.title}</span>
                </nav>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h1>
                            <p className="text-gray-600 mb-4">{module.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {module.estimatedDuration || 'Self-paced'}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {module.contents?.length || 0} Contents
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {module.difficulty || 'Beginner'}
                                </span>
                            </div>

                            {/* Module Progress */}
                            {moduleProgress && (
                                <ModuleCompletionStatus 
                                    moduleProgress={moduleProgress}
                                    showDetails={true}
                                    size="large"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content List Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Contents</h3>
                        <div className="space-y-3">
                            {module.contents && module.contents.length > 0 ? (
                                module.contents.map((content, index) => renderContent(content, index))
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-4l-4 4m0 0l4 4m-14-4l4-4m-4 0l4 4" />
                                    </svg>
                                    <p className="text-gray-500 text-sm mb-4">No content items yet</p>
                                    
                                    {/* Demo content items */}
                                    <div className="space-y-2 text-left">
                                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Introduction</span>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Video Lesson</span>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Knowledge Check</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4">Demo content structure</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Content Display */}
                <div className="lg:col-span-2">
                    {renderActiveContent()}
                </div>
            </div>
        </div>
    );
};

export default ModuleDetailPage;