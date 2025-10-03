import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const SimpleQuizCreation = ({ userRole = 'admin', onClose, onSuccess, preselectedCourseId = null }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [quizData, setQuizData] = useState({
    courseId: preselectedCourseId || '',
    timeLimit: 30,
    passingScore: 70
  });

  // Initialize 10 questions
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0 // Index of correct answer (0-3)
    }))
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      let endpoint = '/api/courses';
      if (userRole === 'instructor') {
        endpoint = '/api/quiz/instructor/courses';
      } else if (userRole === 'admin') {
        endpoint = '/api/quiz/admin/courses';
      }

      console.log('Fetching courses from:', endpoint);
      const response = await axiosInstance.get(endpoint);
      console.log('Courses response:', response.data);
      const coursesData = response.data?.courses || response.data || [];
      console.log('Parsed courses data:', coursesData);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
      setCourses([]);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = optIndex;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format questions for API
      const formattedQuestions = questions
        .filter(q => q.question.trim()) // Only include questions with text
        .map(q => ({
          type: 'multiple_choice',
          question: q.question,
          options: q.options.map((text, idx) => ({
            id: String.fromCharCode(97 + idx), // a, b, c, d
            text: text,
            isCorrect: idx === q.correctAnswer
          })),
          points: 1
        }));

      if (formattedQuestions.length === 0) {
        setError('Please add at least one question');
        setLoading(false);
        return;
      }

      // Get course name for quiz title
      const selectedCourse = courses.find(c => c._id === quizData.courseId);
      const quizTitle = selectedCourse ? `${selectedCourse.title} - Final Quiz` : 'Course Quiz';

      const endpoint = userRole === 'admin'
        ? `/api/quiz/admin/course/${quizData.courseId}`
        : `/api/quiz/instructor/course/${quizData.courseId}`;

      await axiosInstance.post(endpoint, {
        ...quizData,
        title: quizTitle,
        description: 'Complete this quiz to finish the course',
        instructions: '',
        maxAttempts: 3,
        difficulty: 1,
        status: 'active',
        questions: formattedQuestions
      });

      alert('Quiz created successfully!');
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create quiz';

      // If the error is about course already having a quiz, redirect to edit page
      if (errorMessage.includes('already has a quiz')) {
        const existingQuizId = error.response?.data?.existingQuizId;
        if (existingQuizId) {
          const editPath = userRole === 'admin'
            ? `/admin/quiz/edit/${existingQuizId}`
            : `/instructor/quiz/edit/${existingQuizId}`;

          if (window.confirm('This course already has a quiz. Would you like to edit it instead?')) {
            onClose && onClose();
            navigate(editPath);
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={quizData.courseId}
                    onChange={(e) => setQuizData({ ...quizData, courseId: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a course</option>
                    {Array.isArray(courses) && courses.length > 0 ? (
                      courses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))
                    ) : (
                      <option disabled>No courses available</option>
                    )}
                  </select>
                  {courses.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      No courses found. Please create a course first.
                    </p>
                  )}
                  {courses.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {courses.length} course(s) available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes) *</label>
                  <input
                    type="number"
                    value={quizData.timeLimit}
                    onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Questions (10)</h3>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your question here"
                    />
                  </div>

                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

export default SimpleQuizCreation;

