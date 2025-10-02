import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [learningGoals, setLearningGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, streaksRes, enrolledRes, goalsRes] = await Promise.all([
        axiosInstance.get('/api/progress/analytics').catch(() => ({ data: null })),
        axiosInstance.get('/api/progress/streaks').catch(() => ({ data: null })),
        axiosInstance.get('/api/courses/enrolled/my').catch(() => ({ data: [] })),
        axiosInstance.get('/api/progress/learning-goals').catch(() => ({ data: null }))
      ]);
      
      setAnalytics(analyticsRes.data || {
        totalCourses: enrolledRes.data?.length || 0,
        completedCourses: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestSubject: 'Not available'
      });
      
      setStreaks(streaksRes.data || {
        currentStreak: 0,
        longestStreak: 0,
        weeklyStreak: 0
      });
      
      setEnrolledCourses(enrolledRes.data || []);
      
      setLearningGoals(goalsRes.data || {
        daily: { target: 30, completed: 0, percentage: 0 },
        weekly: { target: 300, completed: 0, percentage: 0 },
        monthly: { target: 1200, completed: 0, percentage: 0 }
      });
      
      console.log('📊 Dashboard data loaded:', {
        analytics: analyticsRes.data,
        streaks: streaksRes.data,
        enrolled: enrolledRes.data,
        goals: goalsRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setAnalytics({
        totalCourses: 0,
        completedCourses: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestSubject: 'Not available'
      });
      setStreaks({
        currentStreak: 0,
        longestStreak: 0,
        weeklyStreak: 0
      });
      setLearningGoals({
        daily: { target: 30, completed: 0, percentage: 0 },
        weekly: { target: 300, completed: 0, percentage: 0 },
        monthly: { target: 1200, completed: 0, percentage: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle course unenrollment
  const handleUnenrollment = async (courseId, courseTitle) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to drop "${courseTitle}"?\n\nThis will remove all your progress and you'll need to re-enroll to continue learning.`
    );
    
    if (!isConfirmed) return;

    try {
      console.log('🔄 Attempting to unenroll from course:', courseId);
      await axiosInstance.post(`/api/courses/${courseId}/unenroll`);
      console.log('✅ Unenrollment successful');
      
      // Refresh dashboard data
      await fetchDashboardData();
      alert('Successfully dropped the course!');
    } catch (error) {
      console.error('❌ Error unenrolling from course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to drop course. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">QUT-MIT Learning Progress Tracker - Track your learning progress and achieve your educational goals</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalCourses || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{analytics?.completedCourses || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Learning Streak</p>
              <p className="text-2xl font-bold text-orange-600">{streaks?.currentStreak || 0} days</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hours Studied</p>
              <p className="text-2xl font-bold text-purple-600">{analytics?.totalTimeSpent || 0}h</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Enrolled Courses</h2>
              <Link to="/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Browse More Courses
              </Link>
            </div>
            
            {enrolledCourses?.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map((enrollment) => {
                  const course = enrollment.courseId;
                  const progress = enrollment;
                  
                  return (
                    <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">{course?.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{course?.category} • {course?.difficulty}</p>
                              <p className="text-sm text-gray-700">{course?.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {progress?.completionPercentage || 0}%
                              </div>
                              <div className="text-xs text-gray-500">Complete</div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{progress?.completionPercentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress?.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Course Stats */}
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="block font-medium">Time Spent</span>
                              <span className="text-gray-800">{Math.round((progress?.totalTimeSpent || 0) / 60)}h</span>
                            </div>
                            <div>
                              <span className="block font-medium">Modules</span>
                              <span className="text-gray-800">
                                {progress?.modulesCompleted?.length || 0} / {course?.syllabus?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="block font-medium">Last Accessed</span>
                              <span className="text-gray-800">
                                {progress?.lastAccessDate 
                                  ? new Date(progress.lastAccessDate).toLocaleDateString()
                                  : 'Never'
                                }
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <Link 
                              to={`/courses/${course?._id}`}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center text-sm"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2M7 7h2a2 2 0 012 2v1" />
                              </svg>
                              Continue
                            </Link>
                            <Link 
                              to={`/courses/${course?._id}/modules`}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center justify-center text-sm"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l-4 4m0 0l4 4m-14-4l4-4m-4 0l4 4" />
                              </svg>
                              Modules
                            </Link>
                            <button 
                              onClick={() => handleUnenrollment(course?._id, course?.title)}
                              className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-200 flex items-center text-sm"
                              title="Drop Course"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Drop
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No courses enrolled yet</h3>
                <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                <Link 
                  to="/courses" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Learning Goals & Analytics Combined */}
        <div className="space-y-6">
          {/* Combined Learning Goals & Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Learning Goals & Analytics</h2>
            
            {/* Learning Goals Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Progress Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Daily Goal</span>
                    <span>{learningGoals?.daily?.target || 30} min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(learningGoals?.daily?.percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {learningGoals?.daily?.completed || 0} min completed today
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Weekly Goal</span>
                    <span>{Math.round((learningGoals?.weekly?.target || 300) / 60)} hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(learningGoals?.weekly?.percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {Math.round((learningGoals?.weekly?.completed || 0) / 60 * 100) / 100} hours completed this week
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Monthly Goal</span>
                    <span>{Math.round((learningGoals?.monthly?.target || 1200) / 60)} hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(learningGoals?.monthly?.percentage || 0, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    {Math.round((learningGoals?.monthly?.completed || 0) / 60 * 100) / 100} hours completed this month
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Performance Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-xs font-medium">Avg. Session</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {analytics?.averageSessionTime || 0} min
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs font-medium">Best Subject</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {analytics?.bestSubject || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-xs font-medium">Avg. Score</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {analytics?.averageScore || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-xs font-medium">Weekly Streak</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {streaks?.weeklyStreak || streaks?.currentStreak || 0} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/courses" 
                className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-md hover:from-blue-700 hover:to-blue-800 transition duration-200 transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Browse Courses
              </Link>
              <Link 
                to="/test-modules"
                className="flex items-center justify-center w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-md hover:from-purple-600 hover:to-purple-700 transition duration-200 transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4l-4 4m0 0l4 4m-14-4l4-4m-4 0l4 4" />
                </svg>
                Test Modules System
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;