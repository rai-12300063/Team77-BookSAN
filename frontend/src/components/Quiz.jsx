import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const Quiz = ({
  quizData,
  onQuizComplete,
  onQuizPause,
  isLoading = false,
  className = ""
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStatus, setQuizStatus] = useState('not_started'); // 'not_started', 'in_progress', 'completed', 'submitted'
  const [showReview, setShowReview] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [apiError, setApiError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Initialize quiz timer
  useEffect(() => {
    if (quizData?.timeLimit && quizStatus === 'in_progress') {
      setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quizData?.timeLimit, quizStatus]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (quizStatus === 'in_progress' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStatus, timeRemaining]);




  const handleStartQuiz = async () => {
    try {
      setApiError('');
      const response = await axiosInstance.post(`/api/quiz/${quizData.id}/attempt`);

      setAttemptId(response.data.attemptId);
      setQuizStatus(response.data.status);
      setCurrentQuestion(response.data.currentQuestion || 0);
      setTimeRemaining(response.data.timeRemaining);

      // If resuming, load existing answers
      if (response.data.answers && response.data.answers.length > 0) {
        const existingAnswers = {};
        response.data.answers.forEach(answer => {
          existingAnswers[answer.questionId] = answer.selectedAnswer;
        });
        setAnswers(existingAnswers);
      } else {
        setAnswers({});
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setApiError(error.response?.data?.message || 'Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleMultipleAnswerSelect = (questionId, optionId, isChecked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (isChecked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, optionId]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== optionId)
        };
      }
    });
  };

  const validateCurrentAnswer = () => {
    const currentQuestionData = quizData.questions[currentQuestion];
    const currentAnswer = answers[currentQuestionData.id];

    switch (currentQuestionData.type) {
      case 'multiple_choice':
      case 'true_false':
        return currentAnswer !== undefined && currentAnswer !== '';

      case 'multiple_select':
        return Array.isArray(currentAnswer) && currentAnswer.length > 0;

      case 'text':
        return currentAnswer !== undefined && currentAnswer.trim().length > 0;

      default:
        return false;
    }
  };

  const validateAllAnswers = () => {
    const errors = {};
    let hasErrors = false;

    quizData.questions.forEach((question, index) => {
      const answer = answers[question.id];
      let isValid = false;

      switch (question.type) {
        case 'multiple_choice':
        case 'true_false':
          isValid = answer !== undefined && answer !== '';
          break;

        case 'multiple_select':
          isValid = Array.isArray(answer) && answer.length > 0;
          break;

        case 'text':
          isValid = answer !== undefined && answer.trim().length > 0;
          break;
      }

      if (!isValid) {
        errors[question.id] = `Question ${index + 1} requires an answer`;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  };

  const handleNextQuestion = () => {
    if (showValidation && !validateCurrentAnswer()) {
      const currentQuestionData = quizData.questions[currentQuestion];
      setValidationErrors({
        [currentQuestionData.id]: `Please answer question ${currentQuestion + 1} before proceeding`
      });
      return;
    }

    setValidationErrors({});
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (questionIndex) => {
    // Clear validation errors when navigating
    setValidationErrors({});
    setCurrentQuestion(questionIndex);
  };

  const handleSubmitQuiz = () => {
    // Validate all answers before allowing submission
    if (!validateAllAnswers()) {
      return;
    }

    setQuizStatus('completed');
    setShowReview(true);
  };

  const handleFinalSubmit = async () => {
    if (!attemptId) return;

    try {
      setApiError('');
      const response = await axiosInstance.post(`/api/quiz/attempt/${attemptId}/submit`, {
        answers,
        timeSpent: quizData?.timeLimit ? (quizData.timeLimit * 60) - timeRemaining : null,
        status: 'completed'
      });

      setQuizStatus('submitted');

      if (onQuizComplete) {
        onQuizComplete({
          ...response.data.results,
          answers,
          timeSpent: quizData?.timeLimit ? (quizData.timeLimit * 60) - timeRemaining : null
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setApiError(error.response?.data?.message || 'Failed to submit quiz. Please try again.');
    }
  };

  const handleAutoSubmit = async () => {
    if (!attemptId) return;

    try {
      const response = await axiosInstance.post(`/api/quiz/attempt/${attemptId}/submit`, {
        answers,
        timeSpent: quizData?.timeLimit * 60,
        status: 'auto_submitted'
      });

      setQuizStatus('submitted');

      if (onQuizComplete) {
        onQuizComplete({
          ...response.data.results,
          answers,
          timeSpent: quizData?.timeLimit * 60,
          status: 'auto_submitted'
        });
      }
    } catch (error) {
      console.error('Error auto-submitting quiz:', error);
      // Still mark as submitted locally even if API call fails
      setQuizStatus('submitted');
      if (onQuizComplete) {
        onQuizComplete({
          answers,
          timeSpent: quizData?.timeLimit * 60,
          status: 'auto_submitted',
          error: 'Submission may have failed due to connection issues'
        });
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  const isQuestionAnswered = (questionIndex) => {
    const question = quizData?.questions[questionIndex];
    if (!question) return false;

    const answer = answers[question.id];
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return answer !== undefined && answer !== '';

      case 'multiple_select':
        return Array.isArray(answer) && answer.length > 0;

      case 'text':
        return answer !== undefined && answer.trim().length > 0;

      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">No quiz available</p>
        </div>
      </div>
    );
  }



  // Quiz submitted state
  if (quizStatus === 'submitted') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">Your answers have been recorded and will be reviewed.</p>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Questions Answered:</span>
                <span className="ml-2 text-gray-900">
                  {getAnsweredQuestionsCount()} of {quizData.questions.length}
                </span>
              </div>
              {timeRemaining !== null && (
                <div>
                  <span className="font-medium text-gray-700">Time Used:</span>
                  <span className="ml-2 text-gray-900">
                    {formatTime((quizData.timeLimit * 60) - timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz not started state
  if (quizStatus === 'not_started') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quizData.title}</h2>
            {quizData.description && (
              <p className="text-gray-600">{quizData.description}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Questions:</span>
                <span className="ml-2 text-gray-900">{quizData.questions?.length || 0}</span>
              </div>
              {quizData.timeLimit && (
                <div>
                  <span className="font-medium text-gray-700">Time Limit:</span>
                  <span className="ml-2 text-gray-900">{quizData.timeLimit} minutes</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Attempts:</span>
                <span className="ml-2 text-gray-900">{quizData.attempts || 'Unlimited'}</span>
              </div>
            </div>
          </div>

          {quizData.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <p className="text-blue-800 text-sm">{quizData.instructions}</p>
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Quiz Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{quizData.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {timeRemaining !== null && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                timeRemaining <= 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}

          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">
              {getAnsweredQuestionsCount()}/{quizData.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getAnsweredQuestionsCount() / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {currentQuestionData && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex-1">
                  {currentQuestionData.question}
                </h3>
                <div className="ml-4">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showValidation}
                      onChange={(e) => setShowValidation(e.target.checked)}
                      className="mr-2"
                    />
                    Require answers
                  </label>
                </div>
              </div>

              {/* Validation Error Display */}
              {validationErrors[currentQuestionData.id] && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {validationErrors[currentQuestionData.id]}
                  </p>
                </div>
              )}

              {/* Multiple Choice Questions */}
              {currentQuestionData.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <label
                      key={option.id || index}
                      className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200 ${
                        validationErrors[currentQuestionData.id]
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestionData.id}`}
                        value={option.id || index}
                        checked={answers[currentQuestionData.id] === (option.id || index)}
                        onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-900">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Multiple Select Questions */}
              {currentQuestionData.type === 'multiple_select' && (
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <label
                      key={option.id || index}
                      className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200 ${
                        validationErrors[currentQuestionData.id]
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option.id || index}
                        checked={(answers[currentQuestionData.id] || []).includes(option.id || index)}
                        onChange={(e) => handleMultipleAnswerSelect(
                          currentQuestionData.id,
                          option.id || index,
                          e.target.checked
                        )}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-900">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* True/False Questions */}
              {currentQuestionData.type === 'true_false' && (
                <div className="space-y-3">
                  {['true', 'false'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200 ${
                        validationErrors[currentQuestionData.id]
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestionData.id}`}
                        value={option}
                        checked={answers[currentQuestionData.id] === option}
                        onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-900 capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Text Input Questions */}
              {currentQuestionData.type === 'text' && (
                <textarea
                  value={answers[currentQuestionData.id] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestionData.id, e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors[currentQuestionData.id]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  rows="4"
                  placeholder="Enter your answer..."
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestion === quizData.questions.length - 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Jump to first unanswered question */}
            {(() => {
              const unansweredIndex = quizData.questions.findIndex((_, index) => !isQuestionAnswered(index));
              return unansweredIndex !== -1 && unansweredIndex !== currentQuestion ? (
                <button
                  onClick={() => handleGoToQuestion(unansweredIndex)}
                  className="px-4 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-lg transition duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Go to Q{unansweredIndex + 1}
                </button>
              ) : null;
            })()}
          </div>

          <div className="flex items-center space-x-4">
            {currentQuestion === quizData.questions.length - 1 && (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(validationErrors).length > 0}
                className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
                  Object.keys(validationErrors).length > 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Quick navigation:</p>
          <div className="flex flex-wrap gap-2">
            {quizData.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition duration-200 ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Quiz?</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                You have answered {getAnsweredQuestionsCount()} out of {quizData.questions.length} questions.
              </p>

              {getAnsweredQuestionsCount() < quizData.questions.length && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800 text-sm">
                      Warning: {quizData.questions.length - getAnsweredQuestionsCount()} question(s) remain unanswered.
                    </p>
                  </div>
                </div>
              )}

              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">Please address the following issues:</p>
                  </div>
                  <ul className="text-red-700 text-sm ml-7 space-y-1">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-gray-600">
                Are you sure you want to submit your quiz?
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={Object.keys(validationErrors).length > 0}
                className={`flex-1 px-4 py-2 rounded-lg transition duration-200 ${
                  Object.keys(validationErrors).length > 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {Object.keys(validationErrors).length > 0 ? 'Fix Issues First' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;