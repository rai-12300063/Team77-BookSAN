import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizCard = ({ quiz, courseId, className = "" }) => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/courses/${courseId}/quiz/${quiz.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Available';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {quiz.description}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
          {getStatusText(quiz.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Questions:</span>
          <span className="ml-1 font-medium">{quiz.questionCount || 0}</span>
        </div>
        {quiz.timeLimit && (
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="ml-1 font-medium">{quiz.timeLimit}m</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">Attempts:</span>
          <span className="ml-1 font-medium">
            {quiz.maxAttempts ? `${quiz.attemptsTaken || 0}/${quiz.maxAttempts}` : 'Unlimited'}
          </span>
        </div>
        {quiz.score !== undefined && (
          <div>
            <span className="text-gray-500">Score:</span>
            <span className="ml-1 font-medium">{quiz.score}%</span>
          </div>
        )}
      </div>

      {quiz.dueDate && (
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Due:</span>
          <span className={`ml-1 font-medium ${
            new Date(quiz.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'
          }`}>
            {new Date(quiz.dueDate).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {quiz.difficulty && (
            <div className="flex items-center">
              <span>Difficulty:</span>
              <div className="ml-1 flex">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ml-0.5 ${
                      level <= (quiz.difficulty || 1) ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {quiz.status === 'completed' && quiz.reviewAvailable && (
            <button
              onClick={() => navigate(`/courses/${courseId}/quiz/${quiz.id}/review`)}
              className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              Review
            </button>
          )}

          {(quiz.status === 'not_started' || quiz.status === 'in_progress' ||
            (quiz.status === 'completed' && quiz.maxAttempts && quiz.attemptsTaken < quiz.maxAttempts)) && (
            <button
              onClick={handleStartQuiz}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              {quiz.status === 'not_started' ? 'Start Quiz' :
               quiz.status === 'in_progress' ? 'Continue Quiz' : 'Retake Quiz'}
            </button>
          )}
        </div>
      </div>

      {quiz.status === 'in_progress' && quiz.progress && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">
              {quiz.progress.answered}/{quiz.progress.total} questions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(quiz.progress.answered / quiz.progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;