import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, streaksRes, enrolledRes] = await Promise.all([
        axiosInstance.get('/api/progress/analytics'),
        axiosInstance.get('/api/progress/streaks'),
        axiosInstance.get('/api/courses/enrolled/my')
      ]);
      setAnalytics(analyticsRes.data);
      setStreaks(streaksRes.data);
      setEnrolledCourses(enrolledRes.data);
      console.log('📊 Dashboard data loaded:', {
        analytics: analyticsRes.data,
        streaks: streaksRes.data,
        enrolled: enrolledRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      {/* Debug Panel */}
{/* 
      <div className="bg-gray-100 border rounded-lg p-4 mb-6 text-sm">
        <strong>Dashboard Debug Info:</strong> 
        User: {user?.name || 'Not logged in'} | 
        Analytics: {analytics ? 'Loaded' : 'Loading'} | 
        Enrolled Courses: {enrolledCourses?.length || 0} | 
        Token: {localStorage.getItem('token') ? 'Present' : 'Missing'} | 
        Loading: {loading.toString()}
        {analytics && (
          <div className="mt-1">
            Total Courses: {analytics.totalCourses} | 
            Completed: {analytics.completedCourses} | 
            Time Spent: {analytics.totalTimeSpent}h
          </div>
        )}
      </div> */}

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
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2M7 7h2a2 2 0 012 2v1" />
                              </svg>
                              Continue Learning
                            </Link>
                            <button 
                              onClick={() => handleUnenrollment(course?._id, course?.title)}
                              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 flex items-center"
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

        {/* Learning Goals & Achievements */}
        <div className="space-y-6">
          {/* Learning Goals */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Goals</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Daily Goal</span>
                  <span>30 min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-green-600 mt-1">21 min completed today</p>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Weekly Goal</span>
                  <span>5 hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">2.25 hours completed this week</p>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Monthly Goal</span>
                  <span>20 hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: '35%' }}></div>
                </div>
                <p className="text-xs text-purple-600 mt-1">7 hours completed this month</p>
              </div>
            </div>
          </div>

          {/* Learning Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Avg. Session Time</span>
                </div>
                <span className="text-sm font-bold text-gray-800">25 min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Best Subject</span>
                </div>
                <span className="text-sm font-bold text-gray-800">JavaScript</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Avg. Score</span>
                </div>
                <span className="text-sm font-bold text-gray-800">87%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Weekly Streak</span>
                </div>
                <span className="text-sm font-bold text-gray-800">5 days</span>
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
                to="/tasks" 
                className="flex items-center justify-center w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-md hover:from-gray-700 hover:to-gray-800 transition duration-200 transform hover:scale-105 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Manage Tasks
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center justify-center w-full border-2 border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 hover:border-gray-400 transition duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Update Profile
              </Link>
              <button 
                className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-md hover:from-green-600 hover:to-green-700 transition duration-200 transform hover:scale-105 shadow-md"
                onClick={() => alert('Start Learning Session feature coming soon!')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h6m-7 4h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Start Learning Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
