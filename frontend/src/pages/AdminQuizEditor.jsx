import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const AdminQuizEditor = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axiosInstance.get(`/api/quiz/${quizId}`);
      setQuiz(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    setError('');

    try {
      // Admin uses admin endpoint
      await axiosInstance.put(`/api/quiz/admin/${quizId}`, {
        questions: questions
      });

      // Refresh quiz data
      await fetchQuiz();
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    // Limit quiz to 10 questions
    if (questions.length >= 10) {
      alert('Maximum quiz limit reached! You can only add up to 10 questions per quiz.');
      return;
    }

    const newQuestion = {
      id: `q${questions.length + 1}`,
      type: 'multiple_choice',
      question: '',
      options: [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false }
      ],
      points: 1
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(Math.max(0, newQuestions.length - 1));
      }
    }
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Quiz not found</p>
          <button
            onClick={() => navigate('/admin/quiz')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Quiz Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/quiz')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Quiz Management
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600 mt-1">
            {questions.length}/10 question{questions.length !== 1 ? 's' : ''} •
            {questions.reduce((sum, q) => sum + (q.points || 1), 0)} total points
          </p>
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <button
            onClick={saveQuiz}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
          <button
            onClick={addQuestion}
            disabled={questions.length >= 10}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={questions.length >= 10 ? 'Maximum 10 questions reached' : 'Add new question'}
          >
            Add Question {questions.length >= 10 && '(Max)'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>

            {questions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-4">No questions yet</p>
                <button
                  onClick={addQuestion}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Add your first question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          Q{index + 1}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 truncate">
                          {question.question || 'Untitled question'}
                        </div>
                        <div className="flex items-center mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                            question.type === 'multiple_select' ? 'bg-green-100 text-green-800' :
                            question.type === 'true_false' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {question.type.replace('_', ' ')}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {question.points || 1} pt{(question.points || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(index);
                        }}
                        className="text-red-400 hover:text-red-600 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Question Editor */}
        <div className="lg:col-span-3">
          {questions.length > 0 && currentQuestionIndex < questions.length ? (
            <QuestionEditor
              question={questions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              onUpdate={(updatedQuestion) => updateQuestion(currentQuestionIndex, updatedQuestion)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first question</p>
              <button
                onClick={addQuestion}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Add Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Question Editor Component (reused from QuizEditor)
const QuestionEditor = ({ question, questionIndex, onUpdate }) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const updateLocalQuestion = (updates) => {
    const updated = { ...localQuestion, ...updates };
    setLocalQuestion(updated);
    onUpdate(updated);
  };

  const updateOption = (optionIndex, updates) => {
    const newOptions = [...localQuestion.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateLocalQuestion({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...localQuestion.options];
    const nextId = String.fromCharCode(97 + newOptions.length); // a, b, c, d, e, f...
    newOptions.push({
      id: nextId,
      text: '',
      isCorrect: false
    });
    updateLocalQuestion({ options: newOptions });
  };

  const removeOption = (optionIndex) => {
    if (localQuestion.options.length <= 2) return; // Minimum 2 options
    const newOptions = localQuestion.options.filter((_, index) => index !== optionIndex);
    updateLocalQuestion({ options: newOptions });
  };

  const setCorrectAnswer = (optionId, isCorrect) => {
    if (localQuestion.type === 'multiple_choice') {
      // For multiple choice, only one can be correct
      const newOptions = localQuestion.options.map(option => ({
        ...option,
        isCorrect: option.id === optionId ? isCorrect : false
      }));
      updateLocalQuestion({ options: newOptions });
    } else if (localQuestion.type === 'multiple_select') {
      // For multiple select, multiple can be correct
      const newOptions = localQuestion.options.map(option => ({
        ...option,
        isCorrect: option.id === optionId ? isCorrect : option.isCorrect
      }));
      updateLocalQuestion({ options: newOptions });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Question {questionIndex + 1}
        </h2>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points
            </label>
            <input
              type="number"
              value={localQuestion.points || 1}
              onChange={(e) => updateLocalQuestion({ points: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={localQuestion.type}
              onChange={(e) => {
                const newType = e.target.value;
                let updates = { type: newType };

                if (newType === 'true_false') {
                  updates.options = [
                    { id: 'true', text: 'True', isCorrect: false },
                    { id: 'false', text: 'False', isCorrect: false }
                  ];
                  updates.correctAnswer = '';
                } else if (newType === 'text') {
                  updates.options = [];
                  updates.correctAnswer = '';
                } else if (newType === 'multiple_choice' || newType === 'multiple_select') {
                  if (!localQuestion.options || localQuestion.options.length === 0) {
                    updates.options = [
                      { id: 'a', text: '', isCorrect: false },
                      { id: 'b', text: '', isCorrect: false },
                      { id: 'c', text: '', isCorrect: false },
                      { id: 'd', text: '', isCorrect: false }
                    ];
                  }
                }

                updateLocalQuestion(updates);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="multiple_select">Multiple Select</option>
              <option value="true_false">True/False</option>
              <option value="text">Text Answer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={localQuestion.question}
          onChange={(e) => updateLocalQuestion({ question: e.target.value })}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your question here..."
        />
      </div>

      {/* Multiple Choice/Select Options */}
      {(localQuestion.type === 'multiple_choice' || localQuestion.type === 'multiple_select') && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-gray-700">
              Answer Options
            </label>
            <button
              onClick={addOption}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Option
            </button>
          </div>

          <div className="space-y-3">
            {localQuestion.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-3">
                <div className="flex items-center">
                  {localQuestion.type === 'multiple_choice' ? (
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={option.isCorrect}
                      onChange={(e) => setCorrectAnswer(option.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => setCorrectAnswer(option.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, { text: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${option.id.toUpperCase()}`}
                  />
                </div>
                {localQuestion.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* True/False Options */}
      {localQuestion.type === 'true_false' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Correct Answer
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name={`tf-correct-${questionIndex}`}
                value="true"
                checked={localQuestion.correctAnswer === 'true'}
                onChange={(e) => updateLocalQuestion({ correctAnswer: e.target.value })}
                className="h-4 w-4 text-blue-600 mr-3"
              />
              True
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`tf-correct-${questionIndex}`}
                value="false"
                checked={localQuestion.correctAnswer === 'false'}
                onChange={(e) => updateLocalQuestion({ correctAnswer: e.target.value })}
                className="h-4 w-4 text-blue-600 mr-3"
              />
              False
            </label>
          </div>
        </div>
      )}

      {/* Text Answer */}
      {localQuestion.type === 'text' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sample/Expected Answer
          </label>
          <textarea
            value={localQuestion.correctAnswer || ''}
            onChange={(e) => updateLocalQuestion({ correctAnswer: e.target.value })}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a sample correct answer or keywords..."
          />
          <p className="text-xs text-gray-500 mt-1">
            For text questions, provide keywords or a sample answer for reference. Manual grading may be required.
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={localQuestion.explanation || ''}
          onChange={(e) => updateLocalQuestion({ explanation: e.target.value })}
          rows="3"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Explain why this answer is correct..."
        />
      </div>
    </div>
  );
};

export default AdminQuizEditor;