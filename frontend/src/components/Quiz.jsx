import React, { useState, useEffect } from 'react';

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
  const [quizStatus, setQuizStatus] = useState('not_started'); // 'not_started', 'in_progress', 'paused', 'completed', 'submitted'
  const [showReview, setShowReview] = useState(false);

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

  const handleStartQuiz = () => {
    setQuizStatus('in_progress');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handlePauseQuiz = () => {
    setQuizStatus('paused');
    if (onQuizPause) {
      onQuizPause({
        currentQuestion,
        answers,
        timeRemaining,
        status: 'paused'
      });
    }
  };

  const handleResumeQuiz = () => {
    setQuizStatus('in_progress');
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

  const handleNextQuestion = () => {
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
    setCurrentQuestion(questionIndex);
  };

  const handleSubmitQuiz = () => {
    setQuizStatus('completed');
    setShowReview(true);
  };

  const handleFinalSubmit = () => {
    setQuizStatus('submitted');
    if (onQuizComplete) {
      onQuizComplete({
        answers,
        timeSpent: quizData?.timeLimit ? (quizData.timeLimit * 60) - timeRemaining : null,
        status: 'completed'
      });
    }
  };

  const handleAutoSubmit = () => {
    setQuizStatus('submitted');
    if (onQuizComplete) {
      onQuizComplete({
        answers,
        timeSpent: quizData?.timeLimit * 60,
        status: 'auto_submitted'
      });
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
    return question && answers[question.id] !== undefined;
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

  // Quiz paused state
  if (quizStatus === 'paused') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Paused</h2>
          <p className="text-gray-600 mb-6">Your progress has been saved. You can resume where you left off.</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Progress:</span>
                <span className="ml-2 text-gray-900">
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Answered:</span>
                <span className="ml-2 text-gray-900">
                  {getAnsweredQuestionsCount()} of {quizData.questions.length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleResumeQuiz}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
          >
            Resume Quiz
          </button>
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

            <button
              onClick={handlePauseQuiz}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              Pause
            </button>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentQuestionData.question}
              </h3>

              {/* Multiple Choice Questions */}
              {currentQuestionData.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <label
                      key={option.id || index}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200"
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
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200"
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
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-200"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestion === quizData.questions.length - 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {currentQuestion === quizData.questions.length - 1 && (
              <button
                onClick={handleSubmitQuiz}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
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
                    : isQuestionAnswered(index)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
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
            <p className="text-gray-600 mb-6">
              You have answered {getAnsweredQuestionsCount()} out of {quizData.questions.length} questions.
              Are you sure you want to submit your quiz?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;