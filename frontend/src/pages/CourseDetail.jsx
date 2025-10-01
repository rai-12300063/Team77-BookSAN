import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        console.log('🔄 Fetching course data for courseId:', courseId);
        const [courseRes, modulesRes, progressRes] = await Promise.all([
          axiosInstance.get(`/api/courses/${courseId}`),
          axiosInstance.get(`/api/modules/course/${courseId}`).catch((error) => {
            console.log('⚠️ Modules fetch failed:', error.response?.status);
            return { data: [] };
          }),
          axiosInstance.get(`/api/progress/course/${courseId}`).catch((error) => {
            console.log('⚠️ Progress fetch failed (user might not be enrolled):', error.response?.status);
            return { data: null };
          })
        ]);
        console.log('📚 Course data:', courseRes.data);
        console.log('📋 Modules data:', modulesRes.data);
        console.log('📈 Progress data:', progressRes.data);
        
        setCourse(courseRes.data);
        setModules(modulesRes.data || []);
        setProgress(progressRes.data);
        setIsEnrolled(!!progressRes.data); // User is enrolled if progress exists
        
        console.log('✅ Data fetch complete. isEnrolled:', !!progressRes.data, 'modules:', modulesRes.data?.length);
      } catch (error) {
        console.error('❌ Error fetching course data:', error);
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
      const [courseRes, modulesRes, progressRes] = await Promise.all([
        axiosInstance.get(`/api/courses/${courseId}`),
        axiosInstance.get(`/api/modules/course/${courseId}`).catch(() => ({ data: [] })),
        axiosInstance.get(`/api/progress/course/${courseId}`).catch(() => ({ data: null }))
      ]);
      setCourse(courseRes.data);
      setModules(modulesRes.data || []);
      setProgress(progressRes.data);
      setIsEnrolled(!!progressRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  // Handle course enrollment
  const handleEnrollment = async () => {
    try {
      console.log('🔄 Attempting to enroll in course:', courseId);
      const response = await axiosInstance.post(`/api/courses/${courseId}/enroll`);
      console.log('✅ Enrollment successful:', response.data);
      
      // Refresh course data
      await refetchData();
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      
      if (error.response?.status === 400) {
        alert('You are already enrolled in this course!');
      } else if (error.response?.status === 401) {
        alert('Please log in to enroll in courses.');
      } else {
        alert('Failed to enroll in course. Please try again.');
      }
    }
  };

  // Handle course unenrollment
  const handleUnenrollment = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to drop "${course?.title}"?\n\nThis will remove all your progress and you'll need to re-enroll to continue learning.`
    );
    
    if (!isConfirmed) {
      return; // User cancelled
    }

    try {
      console.log('🔄 Attempting to unenroll from course:', courseId);
      const response = await axiosInstance.post(`/api/courses/${courseId}/unenroll`);
      console.log('✅ Unenrollment successful:', response.data);
      
      // Refresh course data
      await refetchData();
      alert('Successfully dropped the course!');
      
      // Optional: Navigate back to courses page after a delay
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    } catch (error) {
      console.error('❌ Error unenrolling from course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to drop course. Please try again.';
      alert(errorMessage);
    }
  };

  const handleModuleCompletion = async (moduleId, timeSpent = 30) => {
    try {
      console.log('🎯 Marking module as complete:', moduleId);
      await axiosInstance.put('/api/progress/module', {
        courseId,
        moduleId,
        timeSpent
      });
      
      console.log('✅ Module completion recorded');
      
      // Refresh progress data
      refetchData();
      
      // Show completion message
      alert('Module completed! Great job! 🎉');
    } catch (error) {
      console.error('❌ Error completing module:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark module as complete. Please try again.';
      alert(errorMessage);
    }
  };

  const isModuleCompleted = (moduleId) => {
    // Check if this module index is in the completed modules array
    const moduleIndex = course?.syllabus?.findIndex(module => module._id === moduleId);
    return progress?.modulesCompleted?.some(completed => completed.moduleIndex === moduleIndex) || false;
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Panel */}
      <div className="bg-gray-100 border rounded-lg p-4 mb-4 text-sm">
        <strong>Debug Info:</strong> 
        CourseID: {courseId} | 
        IsEnrolled: {isEnrolled.toString()} | 
        Progress: {progress ? 'Yes' : 'No'} | 
        Course: {course ? 'Loaded' : 'Loading'} | 
        Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
        {progress && (
          <div className="mt-1">
            Completion: {progress.completionPercentage || 0}% | 
            Modules Completed: {progress.modulesCompleted?.length || 0} | 
            Time Spent: {Math.round((progress.totalTimeSpent || 0) / 60)}h
          </div>
        )}
      </div>

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
            {isEnrolled ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800" data-modules-section>Course Modules</h2>
                  <button
                    onClick={() => navigate(`/courses/${courseId}/modules`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    View All Modules
                  </button>
                </div>
                
                {modules && modules.length > 0 ? (
                  <div className="space-y-4">
                    {modules.map((module, index) => {
                      const completed = isModuleCompleted(module._id);
                      
                      return (
                        <div key={module._id || index} className="border border-gray-200 rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setActiveModule(activeModule === index ? -1 : index)}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                                completed ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                                {completed ? (
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-xs text-gray-600">{module.moduleNumber || index + 1}</span>
                                )}
                              </div>
                              <h3 className="text-lg font-medium text-gray-800">
                                {module.title || `Module ${index + 1}`}
                              </h3>
                            </div>
                            <svg 
                              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                activeModule === index ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          
                          {activeModule === index && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-600 mb-4">
                                <p><strong>Description:</strong> {module.description}</p>
                                {module.learningObjectives && module.learningObjectives.length > 0 && (
                                  <div className="mt-2">
                                    <strong>Learning Objectives:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                      {module.learningObjectives.map((objective, i) => (
                                        <li key={i}>{objective}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                  <span>Estimated time: {Math.round((module.estimatedDuration || 60) / 60)} hours</span>
                                  {module.difficulty && (
                                    <span className="ml-4">Difficulty: {module.difficulty}</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => navigate(`/courses/${courseId}/modules/${module._id}`)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                                  >
                                    Start Module
                                  </button>
                                  {!completed && (
                                    <button
                                      onClick={() => handleModuleCompletion(module._id, module.estimatedDuration || 60)}
                                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                                    >
                                      Mark Complete
                                    </button>
                                  )}
                                </div>
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
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Course Overview</h2>
                <p className="text-gray-600 mb-6">You need to enroll in this course to access the modules and track your progress.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    🎓 Ready to start learning? Enroll now to access all course materials and track your progress!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Actions</h3>
            {isEnrolled ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    console.log('🎯 Continue Learning clicked');
                    // Navigate to the first incomplete module or first module
                    const firstIncompleteModule = course.syllabus?.findIndex(module => !isModuleCompleted(module._id));
                    const targetModule = firstIncompleteModule !== -1 ? firstIncompleteModule : 0;
                    console.log('📍 Navigating to module:', targetModule);
                    setActiveModule(targetModule);
                    
                    // Scroll to the modules section
                    setTimeout(() => {
                      const modulesSection = document.querySelector('[data-modules-section]');
                      if (modulesSection) {
                        modulesSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2M7 7h2a2 2 0 012 2v1" />
                  </svg>
                  Continue Learning ({progress?.completionPercentage || 0}% Complete)
                </button>
                <button
                  onClick={handleUnenrollment}
                  className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors border-2 border-red-500 hover:border-red-600"
                >
                  Drop Course
                </button>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ Warning: Dropping the course will remove all your progress
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnrollment}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Enroll in Course
              </button>
            )}
          </div>

          {/* Course Stats - Only show if enrolled */}
          {isEnrolled && (
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
                    <span className="font-medium">{Math.round((progress?.totalTimeSpent || 0) / 60)}h</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Modules Completed:</span>
                    <span className="font-medium">
                      {progress?.modulesCompleted?.length || 0} / {modules?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Last Accessed:</span>
                    <span className="font-medium">
                      {progress?.lastAccessDate 
                        ? new Date(progress.lastAccessDate).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
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
