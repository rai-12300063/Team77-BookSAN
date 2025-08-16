import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          axiosInstance.get(`/api/courses/${courseId}`),
          axiosInstance.get(`/api/progress/course/${courseId}`)
        ]);
        setCourse(courseRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error('Error fetching course data:', error);
        if (error.response?.status === 404) {
          navigate('/courses');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const refetchData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        axiosInstance.get(`/api/courses/${courseId}`),
        axiosInstance.get(`/api/progress/course/${courseId}`)
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const handleModuleCompletion = async (moduleId, timeSpent = 30) => {
    try {
      await axiosInstance.put('/api/progress/module', {
        courseId,
        moduleId,
        timeSpent
      });
      
      // Refresh progress data
      refetchData();
      
      // Show completion message
      alert('Module completed! Great job!');
    } catch (error) {
      console.error('Error updating module completion:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const isModuleCompleted = (moduleId) => {
    return progress?.completedModules?.some(m => m.moduleId === moduleId) || false;
  };

  const getModuleCompletionTime = (moduleId) => {
    const completed = progress?.completedModules?.find(m => m.moduleId === moduleId);
    return completed ? new Date(completed.completedAt).toLocaleDateString() : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
        <button 
          onClick={() => navigate('/courses')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <button 
              onClick={() => navigate('/courses')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{course.category}</span>
              <span>Level: {course.difficulty}</span>
              <span>Duration: {course.estimatedCompletionTime} hours</span>
              <span>Instructor: {course.instructor?.name}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {progress?.completionPercentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress?.completionPercentage || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Course Modules</h2>
            
            {course.syllabus && course.syllabus.length > 0 ? (
              <div className="space-y-4">
                {course.syllabus.map((module, index) => {
                  const completed = isModuleCompleted(module._id);
                  const completionDate = getModuleCompletionTime(module._id);
                  
                  return (
                    <div 
                      key={module._id} 
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        activeModule === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {completed ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{module.moduleTitle}</h3>
                            <p className="text-sm text-gray-600">Duration: {module.estimatedHours} hours</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {completed && completionDate && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Completed {completionDate}
                            </span>
                          )}
                          <button
                            onClick={() => setActiveModule(activeModule === index ? -1 : index)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg 
                              className={`w-5 h-5 transition-transform ${activeModule === index ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {activeModule === index && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600 mb-4">
                            <strong>Topics Covered:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {module.topics?.map((topic, i) => (
                                <li key={i}>{topic}</li>
                              )) || <li>Complete this module</li>}
                            </ul>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <span>Estimated time: {module.estimatedHours} hours</span>
                            </div>
                            {!completed && (
                              <button
                                onClick={() => handleModuleCompletion(module._id, module.estimatedHours * 60)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No modules available for this course.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completion</span>
                  <span>{progress?.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${progress?.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="font-medium">{Math.round((progress?.timeSpent || 0) / 60)}h</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Modules Completed:</span>
                  <span className="font-medium">
                    {progress?.completedModules?.length || 0} / {course.syllabus?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Last Accessed:</span>
                  <span className="font-medium">
                    {progress?.lastAccessed 
                      ? new Date(progress.lastAccessed).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {progress?.achievements?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
              <div className="space-y-2">
                {progress.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 capitalize">
                      {achievement.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{course.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className="ml-2 font-medium">{course.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-medium">{course.estimatedCompletionTime} hours</span>
              </div>
              <div>
                <span className="text-gray-600">Instructor:</span>
                <span className="ml-2 font-medium">{course.instructor?.name}</span>
              </div>
              {course.prerequisites?.length > 0 && (
                <div>
                  <span className="text-gray-600">Prerequisites:</span>
                  <div className="mt-1">
                    {course.prerequisites.map((prereq, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
