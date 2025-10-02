import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

import SimpleQuizCreation from '../components/SimpleQuizCreation';

const AdminQuizManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(location.state?.selectedCourseId || '');
  const [showCreateModal, setShowCreateModal] = useState(!!location.state?.selectedCourseId);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axiosInstance.get('/api/quiz/admin/all');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      // Admin can fetch ALL courses (no restrictions)
      const response = await axiosInstance.get('/api/quiz/admin/courses');

      console.log('Courses fetched:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback: try getting courses from the main courses endpoint
      try {
        const fallbackResponse = await axiosInstance.get('/api/courses');
        console.log('Fallback courses:', fallbackResponse.data);
        const coursesData = fallbackResponse.data?.courses || fallbackResponse.data || [];
        setCourses(coursesData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/quiz/admin/${quizId}`);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError(error.response?.data?.message || 'Failed to delete quiz');
    }
  };



  // Group quizzes by course
  const courseQuizMap = {};
  quizzes.forEach(quiz => {
    const courseId = quiz.course?._id;
    if (courseId) {
      courseQuizMap[courseId] = quiz;
    }
  });

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

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <p className="text-gray-600">Manage quizzes for all courses</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded p-4">
          <p className="text-amber-800">
            ⚠️ No courses found. Please create a course first before creating quizzes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => {
            const quiz = courseQuizMap[course._id];
            return (
              <div key={course._id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.category} • {course.difficulty}</p>
                  </div>
                  <div className="flex gap-2">
                    {quiz ? (
                      <>
                        <button
                          onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Edit Quiz
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Delete Quiz
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCourse(course._id);
                          setShowCreateModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Add Quiz
                      </button>
                    )}
                  </div>
                </div>
                {quiz && (
                  <div className="mt-2 text-sm text-gray-600">
                    Quiz: {quiz.questionsCount} questions • {quiz.totalPoints} points
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (

        <SimpleQuizCreation
          userRole="admin"
          preselectedCourseId={selectedCourse || location.state?.selectedCourseId}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCourse('');
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedCourse('');
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
};

// Create Quiz Modal Component
const CreateQuizModal = ({ courses, preSelectedCourseId, onClose, onSuccess }) => {
  const navigate = useNavigate();


  console.log('CreateQuizModal - courses:', courses);
  console.log('CreateQuizModal - preSelectedCourseId:', preSelectedCourseId);

  // Auto-generate quiz title when course is selected
  const getQuizTitle = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course ? `Quiz: ${course.title}` : '';
  };

  const [formData, setFormData] = useState({
    courseId: preSelectedCourseId || '',
    title: preSelectedCourseId ? getQuizTitle(preSelectedCourseId) : '',
    instructions: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update title when courses are loaded and preSelectedCourseId is set
  useEffect(() => {
    if (preSelectedCourseId && courses.length > 0 && !formData.title) {
      setFormData(prev => ({
        ...prev,
        title: getQuizTitle(preSelectedCourseId)
      }));
    }
  }, [courses, preSelectedCourseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(`/api/quiz/admin/course/${formData.courseId}`, {
        ...formData,
        questions: [] // Start with empty questions, will be added in edit mode
      });

      onSuccess();
      // Navigate to quiz editor to add questions
      navigate(`/admin/quiz/edit/${response.data.quiz.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Create New Quiz</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select
                value={formData.courseId}
                onChange={(e) => {
                  const courseId = e.target.value;
                  console.log('Course selected:', courseId);

                  setFormData({
                    ...formData,
                    courseId: courseId,
                    title: getQuizTitle(courseId)
                  });
                }}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a course</option>
                {courses && courses.length > 0 ? (
                  courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No courses available</option>
                )}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {courses && courses.length > 0 ? `${courses.length} courses available` : 'Loading courses...'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows="3"
                className="w-full border rounded px-3 py-2"
                placeholder="Instructions for students"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizManagement;