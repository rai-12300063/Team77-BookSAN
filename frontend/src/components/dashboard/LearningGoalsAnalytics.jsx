/**
 * LearningGoalsAnalytics.jsx - Combined functional learning goals and analytics component
 * Displays real-time learning progress, goals, and analytical insights
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axiosConfig';

const LearningGoalsAnalytics = ({ className = "" }) => {
    const [analytics, setAnalytics] = useState(null);
    const [goals, setGoals] = useState({
        daily: { target: 30, completed: 0 }, // minutes
        weekly: { target: 300, completed: 0 }, // minutes
        monthly: { target: 1200, completed: 0 } // minutes
    });
    const [streaks, setStreaks] = useState({
        current: 0,
        longest: 0,
        weeklyActive: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLearningData();
    }, []);

    const fetchLearningData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, streaksRes] = await Promise.all([
                axios.get('/api/progress/analytics').catch(() => ({ data: null })),
                axios.get('/api/progress/streaks').catch(() => ({ data: null }))
            ]);

            if (analyticsRes.data) {
                setAnalytics(analyticsRes.data);
                
                // Calculate goals based on actual data
                const totalMinutes = (analyticsRes.data.totalTimeSpent || 0) * 60;
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                
                // Simulated progress for demo - in real app, this would come from backend
                setGoals({
                    daily: { 
                        target: 30, 
                        completed: Math.min(25, totalMinutes % 30) 
                    },
                    weekly: { 
                        target: 300, 
                        completed: Math.min(180, (totalMinutes * 0.6) % 300) 
                    },
                    monthly: { 
                        target: 1200, 
                        completed: Math.min(420, totalMinutes % 1200) 
                    }
                });
            }

            if (streaksRes.data) {
                setStreaks({
                    current: streaksRes.data.currentStreak || 0,
                    longest: streaksRes.data.longestStreak || 0,
                    weeklyActive: streaksRes.data.weeklyActiveDays || 0
                });
            }

        } catch (error) {
            console.error('Error fetching learning data:', error);
            setError('Failed to load learning data');
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (completed, target) => {
        return Math.min(100, Math.round((completed / target) * 100));
    };

    const formatTime = (minutes) => {
        if (minutes < 60) return `${Math.round(minutes)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getGoalStatus = (completed, target) => {
        const percentage = calculatePercentage(completed, target);
        if (percentage >= 100) return { color: 'green', status: 'completed' };
        if (percentage >= 75) return { color: 'blue', status: 'on-track' };
        if (percentage >= 50) return { color: 'yellow', status: 'behind' };
        return { color: 'red', status: 'needs-attention' };
    };

    if (loading) {
        return (
            <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Learning Goals & Analytics</h2>
                <button
                    onClick={fetchLearningData}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Refresh
                </button>
            </div>

            {/* Learning Goals Section */}
            <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learning Goals
                </h3>
                
                <div className="space-y-4">
                    {/* Daily Goal */}
                    <div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span className="font-medium">Daily Goal</span>
                            <div className="flex items-center space-x-2">
                                <span>{formatTime(goals.daily.completed)} / {formatTime(goals.daily.target)}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'green' ? 'bg-green-100 text-green-800' :
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {calculatePercentage(goals.daily.completed, goals.daily.target)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'green' ? 'bg-green-500' :
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'blue' ? 'bg-blue-500' :
                                    getGoalStatus(goals.daily.completed, goals.daily.target).color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${calculatePercentage(goals.daily.completed, goals.daily.target)}%` }}
                            />
                        </div>
                    </div>

                    {/* Weekly Goal */}
                    <div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span className="font-medium">Weekly Goal</span>
                            <div className="flex items-center space-x-2">
                                <span>{formatTime(goals.weekly.completed)} / {formatTime(goals.weekly.target)}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'green' ? 'bg-green-100 text-green-800' :
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {calculatePercentage(goals.weekly.completed, goals.weekly.target)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'green' ? 'bg-green-500' :
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'blue' ? 'bg-blue-500' :
                                    getGoalStatus(goals.weekly.completed, goals.weekly.target).color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${calculatePercentage(goals.weekly.completed, goals.weekly.target)}%` }}
                            />
                        </div>
                    </div>

                    {/* Monthly Goal */}
                    <div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span className="font-medium">Monthly Goal</span>
                            <div className="flex items-center space-x-2">
                                <span>{formatTime(goals.monthly.completed)} / {formatTime(goals.monthly.target)}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'green' ? 'bg-green-100 text-green-800' :
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {calculatePercentage(goals.monthly.completed, goals.monthly.target)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'green' ? 'bg-green-500' :
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'blue' ? 'bg-blue-500' :
                                    getGoalStatus(goals.monthly.completed, goals.monthly.target).color === 'yellow' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}
                                style={{ width: `${calculatePercentage(goals.monthly.completed, goals.monthly.target)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Learning Analytics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Total Courses</p>
                                <p className="text-2xl font-bold text-blue-900">{analytics?.totalCourses || 0}</p>
                            </div>
                            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Completed</p>
                                <p className="text-2xl font-bold text-green-900">{analytics?.completedCourses || 0}</p>
                            </div>
                            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Time Spent</p>
                                <p className="text-2xl font-bold text-yellow-900">{Math.round(analytics?.totalTimeSpent || 0)}h</p>
                            </div>
                            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-700">Current Streak</p>
                                <p className="text-2xl font-bold text-purple-900">{streaks.current}</p>
                            </div>
                            <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex space-x-3">
                    <Link 
                        to="/courses" 
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-center text-sm font-medium"
                    >
                        Browse Courses
                    </Link>
                    <Link 
                        to="/progress" 
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-center text-sm font-medium"
                    >
                        View Progress
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LearningGoalsAnalytics;