import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quiz from '../components/Quiz';
import axiosInstance from '../axiosConfig';

const QuizPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch quiz data from backend API
        const response = await axiosInstance.get(`/api/quiz/${quizId}`);
        setQuizData(response.data);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        if (err.response?.status === 404) {
          setError('Quiz not found.');
        } else if (err.response?.status === 403) {
          setError(err.response.data.message || 'You do not have permission to access this quiz.');
        } else {
          setError('Failed to load quiz. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    } else {
      setError('No quiz ID provided');
      setLoading(false);
    }
  }, [quizId, courseId]);

  const handleQuizComplete = (quizResults) => {
    console.log('Quiz completed:', quizResults);
    // This will be connected to the backend API in step 13.2
    // For now, just navigate back to course detail
    navigate(`/courses/${courseId}`, {
      state: { message: 'Quiz submitted successfully!' }
    });
  };

  const handleQuizPause = (quizState) => {
    console.log('Quiz paused:', quizState);
    // This will be connected to the backend API in step 13.2
    // Save quiz state to backend
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quiz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Quiz</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/courses')}
                className="text-gray-700 hover:text-blue-600 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Courses
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="ml-1 text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Course Detail
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-gray-500 md:ml-2">Quiz</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Quiz Component */}
        <Quiz
          quizData={quizData}
          onQuizComplete={handleQuizComplete}
          onQuizPause={handleQuizPause}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default QuizPage;