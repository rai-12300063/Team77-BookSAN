import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const InstructorQuizManagement = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchInstructorCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axiosInstance.get('/api/quiz/instructor/my-quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching instructor quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/quiz/instructor/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/quiz/instructor/${quizId}`);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const difficultyColors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800',
      5: 'bg-purple-100 text-purple-800'
    };

    const difficultyLabels = {
      1: 'Easy',
      2: 'Medium',
      3: 'Hard',
      4: 'Expert',
      5: 'Master'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[difficulty] || difficultyColors[1]}`}>
        {difficultyLabels[difficulty] || 'Easy'}
      </span>
    );
  };

  const filteredQuizzes = selectedCourse
    ? quizzes.filter(quiz => quiz.course._id === selectedCourse)
    : quizzes;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Course Quizzes</h1>
          <p className="text-gray-600 mt-1">Manage quizzes for your assigned courses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={courses.length === 0}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create New Quiz
        </button>
      </div>

      {/* No courses assigned message */}
      {courses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-yellow-800 font-medium">No Courses Assigned</h3>
              <p className="text-yellow-700 text-sm mt-1">
                You need to be assigned to courses before you can create quizzes. Please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All My Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchQuizzes}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Quizzes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">No quizzes found</p>
            {courses.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Create your first quiz
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">
                          {quiz.questionsCount} questions • {quiz.totalPoints} points
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quiz.course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quiz.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDifficultyBadge(quiz.difficulty)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quiz.stats.completedAttempts} / {quiz.stats.totalAttempts} attempts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/instructor/quiz/edit/${quiz.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={quiz.stats.totalAttempts > 0}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateInstructorQuizModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
};

// Create Instructor Quiz Modal Component
const CreateInstructorQuizModal = ({ courses, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    instructions: '',
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 70,
    difficulty: 1,
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(`/api/quiz/instructor/course/${formData.courseId}`, {
        ...formData,
        questions: [] // Start with empty questions, will be added in edit mode
      });

      onSuccess();
      // Navigate to quiz editor to add questions
      navigate(`/instructor/quiz/edit/${response.data.quiz.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Quiz</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instructions for students taking the quiz"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({...formData, maxAttempts: parseInt(e.target.value)})}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                  <option value={4}>Expert</option>
                  <option value={5}>Master</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Quiz & Add Questions'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorQuizManagement;