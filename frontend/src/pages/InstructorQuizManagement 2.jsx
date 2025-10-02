import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const InstructorQuizManagement = () => {
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


  const filteredQuizzes = selectedCourse
    ? quizzes.filter(quiz => quiz.course?._id === selectedCourse)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Course Quizzes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={courses.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create New Quiz
        </button>
      </div>

      {/* No courses assigned message */}
      {courses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-yellow-800 font-medium">No Courses Assigned</p>
          <p className="text-yellow-700 text-sm mt-1">
            You need to be assigned to courses before you can create quizzes.
          </p>
        </div>
      )}

      {/* Filter */}
      {courses.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All My Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No quizzes found</p>
          {courses.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Create your first quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border rounded p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-medium">{quiz.title}</div>
                <div className="text-sm text-gray-600">
                  {quiz.course?.title} • {quiz.questionsCount} questions • {quiz.totalPoints} points
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/instructor/quiz/edit/${quiz.id}`)}
                  className="text-blue-600 hover:text-blue-800 px-3 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateInstructorQuizModal
          courses={courses}
          preSelectedCourseId={location.state?.selectedCourseId}
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
const CreateInstructorQuizModal = ({ courses, preSelectedCourseId, onClose, onSuccess }) => {
  const navigate = useNavigate();

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
                  setFormData({...formData, courseId: courseId, title: getQuizTitle(courseId)});
                }}
                required
                className="w-full border rounded px-3 py-2"
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

export default InstructorQuizManagement;