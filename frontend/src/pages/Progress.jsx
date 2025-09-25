import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { Link } from 'react-router-dom';

const Progress = () => {
  // const { user } = useAuth(); // Not currently used
  const [analytics, setAnalytics] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const [analyticsRes, coursesRes, streaksRes] = await Promise.all([
        axiosInstance.get('/api/progress/analytics'),
        axiosInstance.get('/api/courses/enrolled/my'),
        axiosInstance.get('/api/progress/streaks')
      ]);

      setAnalytics(analyticsRes.data);
      setEnrolledCourses(coursesRes.data);
      setStreaks(streaksRes.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-blue-600">{analytics?.totalCourses || 0}</p>
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
              <p className="text-3xl font-bold text-green-600">{analytics?.completedCourses || 0}</p>
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
              <p className="text-sm font-medium text-gray-600">Hours Studied</p>
              <p className="text-3xl font-bold text-purple-600">{analytics?.totalTimeSpent || 0}h</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Learning Streak</p>
              <p className="text-3xl font-bold text-orange-600">{streaks?.currentStreak || 0} days</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 716.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'courses', label: 'Course Progress', icon: '📚' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'analytics', label: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  {analytics?.progressRecords?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.progressRecords.slice(0, 5).map((progress, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{progress.courseId?.title}</p>
                            <p className="text-sm text-gray-600">{progress.courseId?.category}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${getProgressTextColor(progress.completionPercentage)}`}>
                              {progress.completionPercentage}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(progress.lastAccessed).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No recent activity found</p>
                  )}
                </div>

                {/* Learning Streaks */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Streaks</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="text-2xl font-bold text-orange-600">{streaks?.currentStreak || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Longest Streak</span>
                      <span className="text-xl font-semibold text-gray-800">{streaks?.longestStreak || 0} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Learning Days</span>
                      <span className="text-xl font-semibold text-gray-800">{streaks?.totalDays || 0} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Progress Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Course Progress Overview</h3>
                <Link 
                  to="/courses" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Browse More Courses
                </Link>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((enrollment) => (
                    <div key={enrollment.courseId?._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{enrollment.courseId?.title}</h4>
                          <p className="text-sm text-gray-600">{enrollment.courseId?.category}</p>
                          <p className="text-sm text-gray-500">Level: {enrollment.courseId?.difficulty}</p>
                        </div>
                        <span className={`text-2xl font-bold ${getProgressTextColor(enrollment.completionPercentage)}`}>
                          {enrollment.completionPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(enrollment.completionPercentage)}`}
                            style={{ width: `${enrollment.completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Time Spent:</span>
                          <p className="font-semibold">{Math.round((enrollment.totalTimeSpent || 0) / 60)}h</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Accessed:</span>
                          <p className="font-semibold">
                            {enrollment.lastAccessDate 
                              ? new Date(enrollment.lastAccessDate).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex space-x-3">
                        <Link 
                          to={`/courses/${enrollment.courseId?._id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                        >
                          Continue Learning
                        </Link>
                        {enrollment.completionPercentage === 100 && (
                          <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
                            View Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses enrolled</h3>
                  <p className="mt-1 text-sm text-gray-500">Start your learning journey by enrolling in a course.</p>
                  <div className="mt-6">
                    <Link 
                      to="/courses" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Browse Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Your Achievements</h3>
              
              {analytics?.totalAchievements > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sample achievements - these would come from the analytics data */}
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">First Course</h4>
                        <p className="text-sm opacity-90">Completed your first course</p>
                      </div>
                      <div className="text-3xl">🎓</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">Study Warrior</h4>
                        <p className="text-sm opacity-90">Studied for 10+ hours</p>
                      </div>
                      <div className="text-3xl">⚔️</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">Streak Master</h4>
                        <p className="text-sm opacity-90">7-day learning streak</p>
                      </div>
                      <div className="text-3xl">🔥</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900">No achievements yet</h3>
                  <p className="text-gray-500">Start learning to unlock your first achievement!</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Learning Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Stats */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Learning Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Session Length</span>
                      <span className="font-semibold">
                        {analytics?.totalTimeSpent && analytics?.recentActivity 
                          ? Math.round((analytics.totalTimeSpent * 60) / analytics.recentActivity) + ' min'
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold">
                        {analytics?.totalCourses > 0 
                          ? Math.round((analytics.completedCourses / analytics.totalCourses) * 100) + '%'
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Days This Week</span>
                      <span className="font-semibold">{analytics?.recentActivity || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Chart Placeholder */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Progress Over Time</h4>
                  <div className="h-40 bg-white rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p className="text-gray-600">Chart visualization</p>
                      <p className="text-sm text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
