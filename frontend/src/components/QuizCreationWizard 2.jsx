import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const QuizCreationWizard = ({ userRole = 'admin', onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz basic information
  const [quizData, setQuizData] = useState({
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

  // Questions data
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      let endpoint = '/api/courses';
      if (userRole === 'instructor') {
        endpoint = '/api/quiz/instructor/courses';
      }

      const response = await axiosInstance.get(endpoint);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addQuestion = () => {
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
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleCreateQuiz = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = userRole === 'admin'
        ? `/api/quiz/admin/course/${quizData.courseId}`
        : `/api/quiz/instructor/course/${quizData.courseId}`;

      const response = await axiosInstance.post(endpoint, {
        ...quizData,
        questions: questions
      });

      onSuccess && onSuccess();
      navigate(userRole === 'admin'
        ? `/admin/quiz/edit/${response.data.quiz.id}`
        : `/instructor/quiz/edit/${response.data.quiz.id}`
      );
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return <QuizBasicInfoStep quizData={quizData} setQuizData={setQuizData} courses={courses} />;
      case 2:
        return <QuizQuestionsStep questions={questions} setQuestions={setQuestions} addQuestion={addQuestion} updateQuestion={updateQuestion} deleteQuestion={deleteQuestion} />;
      case 3:
        return <QuizReviewStep quizData={quizData} questions={questions} courses={courses} />;
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return quizData.courseId && quizData.title.trim();
      case 2:
        return questions.length > 0 && questions.every(q => q.question.trim());
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Quiz</h2>
              <p className="text-gray-600">Step {currentStep} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className="w-16 h-1 mx-2 bg-gray-300">
                <div className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className="w-16 h-1 mx-2 bg-gray-300">
                <div className={`h-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-96">
            {getStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateQuiz}
                  disabled={loading || !isStepValid()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Quiz...' : 'Create Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Quiz Information
const QuizBasicInfoStep = ({ quizData, setQuizData, courses }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Basic Quiz Information</h3>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Course *
      </label>
      <select
        value={quizData.courseId}
        onChange={(e) => setQuizData({...quizData, courseId: e.target.value})}
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
        value={quizData.title}
        onChange={(e) => setQuizData({...quizData, title: e.target.value})}
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
        value={quizData.description}
        onChange={(e) => setQuizData({...quizData, description: e.target.value})}
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
        value={quizData.instructions}
        onChange={(e) => setQuizData({...quizData, instructions: e.target.value})}
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
          value={quizData.timeLimit}
          onChange={(e) => setQuizData({...quizData, timeLimit: parseInt(e.target.value)})}
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
          value={quizData.maxAttempts}
          onChange={(e) => setQuizData({...quizData, maxAttempts: parseInt(e.target.value)})}
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
          value={quizData.passingScore}
          onChange={(e) => setQuizData({...quizData, passingScore: parseInt(e.target.value)})}
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
          value={quizData.difficulty}
          onChange={(e) => setQuizData({...quizData, difficulty: parseInt(e.target.value)})}
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
  </div>
);

// Step 2: Quiz Questions
const QuizQuestionsStep = ({ questions, addQuestion, updateQuestion, deleteQuestion }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
      <button
        onClick={addQuestion}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Add Question
      </button>
    </div>

    {questions.length === 0 ? (
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">No questions added yet</p>
        <button
          onClick={addQuestion}
          className="text-blue-600 hover:text-blue-800"
        >
          Add your first question
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionPreview
            key={index}
            question={question}
            index={index}
            onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
            onDelete={() => deleteQuestion(index)}
          />
        ))}
      </div>
    )}
  </div>
);

// Step 3: Review and Create
const QuizReviewStep = ({ quizData, questions, courses }) => {
  const selectedCourse = courses.find(c => c._id === quizData.courseId);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review Quiz</h3>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quiz Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">Course:</span>
            <span className="ml-2 text-gray-900">{selectedCourse?.title || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Title:</span>
            <span className="ml-2 text-gray-900">{quizData.title}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Questions:</span>
            <span className="ml-2 text-gray-900">{questions.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Points:</span>
            <span className="ml-2 text-gray-900">{questions.reduce((sum, q) => sum + (q.points || 1), 0)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Time Limit:</span>
            <span className="ml-2 text-gray-900">{quizData.timeLimit} minutes</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Passing Score:</span>
            <span className="ml-2 text-gray-900">{quizData.passingScore}%</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Questions Summary</h4>
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className="font-medium text-gray-700">Q{index + 1}:</span>
              <div className="flex-1">
                <p className="text-gray-900">{question.question || 'Untitled question'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Type: {question.type.replace('_', ' ')} • Points: {question.points || 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Question Preview Component
const QuestionPreview = ({ question, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(question);

  const handleSave = () => {
    onUpdate(localQuestion);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
            <p className="text-gray-600 mt-1">{question.question || 'Untitled question'}</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-sm text-gray-500">Type: {question.type.replace('_', ' ')}</span>
              <span className="text-sm text-gray-500">Points: {question.points || 1}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <textarea
            value={localQuestion.question}
            onChange={(e) => setLocalQuestion({...localQuestion, question: e.target.value})}
            rows="2"
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter your question"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={localQuestion.type}
              onChange={(e) => setLocalQuestion({...localQuestion, type: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="multiple_select">Multiple Select</option>
              <option value="true_false">True/False</option>
              <option value="text">Text Answer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points
            </label>
            <input
              type="number"
              value={localQuestion.points || 1}
              onChange={(e) => setLocalQuestion({...localQuestion, points: parseInt(e.target.value) || 1})}
              min="1"
              className="w-20 border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationWizard;