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

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      // Use admin endpoint to bypass module completion checks
      const response = await axiosInstance.get(`/api/quiz/admin/${quizId}`);
      console.log('Raw quiz data:', response.data);
      setQuiz(response.data);

      // If no questions exist, initialize with 10 empty questions
      if (!response.data.questions || response.data.questions.length === 0) {
        const emptyQuestions = Array.from({ length: 10 }, (_, i) => ({
          id: `q${i + 1}`,
          type: 'multiple_choice',
          question: '',
          options: [
            { id: 'a', text: '', isCorrect: false },
            { id: 'b', text: '', isCorrect: false },
            { id: 'c', text: '', isCorrect: false },
            { id: 'd', text: '', isCorrect: false }
          ],
          points: 1
        }));
        setQuestions(emptyQuestions);
      } else {
        console.log('Existing questions:', response.data.questions);

        // Process existing questions to ensure options have proper structure
        const processedQuestions = response.data.questions.map((q, idx) => {
          console.log(`Question ${idx} raw:`, q);

          // Ensure options exist and have proper structure
          let options = q.options;

          if (!options || !Array.isArray(options) || options.length === 0) {
            console.log(`Question ${idx} has no valid options, creating defaults`);
            options = [
              { id: 'a', text: '', isCorrect: false },
              { id: 'b', text: '', isCorrect: false },
              { id: 'c', text: '', isCorrect: false },
              { id: 'd', text: '', isCorrect: false }
            ];
          } else {
            // Ensure each option has isCorrect field and proper structure
            options = options.map((opt, optIdx) => {
              const processed = {
                id: opt.id || String.fromCharCode(97 + optIdx), // a, b, c, d
                text: opt.text || '',
                isCorrect: opt.isCorrect !== undefined ? opt.isCorrect : false
              };
              console.log(`  Option ${optIdx}:`, opt, '-> processed:', processed);
              return processed;
            });
          }

          const processed = {
            id: q.id || `q${idx + 1}`,
            type: q.type || 'multiple_choice',
            question: q.question || '',
            options,
            points: q.points || 1
          };

          console.log(`Question ${idx} processed:`, processed);
          return processed;
        });

        console.log('All processed questions:', processedQuestions);

        // Always ensure we have exactly 10 questions
        const finalQuestions = [...processedQuestions];
        while (finalQuestions.length < 10) {
          finalQuestions.push({
            id: `q${finalQuestions.length + 1}`,
            type: 'multiple_choice',
            question: '',
            options: [
              { id: 'a', text: '', isCorrect: false },
              { id: 'b', text: '', isCorrect: false },
              { id: 'c', text: '', isCorrect: false },
              { id: 'd', text: '', isCorrect: false }
            ],
            points: 1
          });
        }

        // Only keep first 10 questions if there are more
        setQuestions(finalQuestions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError(error.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    setError('');

    try {
      console.log('Saving quiz with questions:', questions);

      // Filter out empty questions (questions without text or with all empty options)
      const validQuestions = questions.filter(q => {
        // Check if question has text
        if (!q.question || q.question.trim() === '') return false;

        // Check if at least one option has text
        const hasValidOptions = q.options && q.options.some(opt => opt.text && opt.text.trim() !== '');
        return hasValidOptions;
      });

      console.log('Valid questions to save:', validQuestions);

      if (validQuestions.length === 0) {
        setError('Please add at least one complete question with options');
        setSaving(false);
        return;
      }

      // Admin uses admin endpoint
      const response = await axiosInstance.put(`/api/quiz/admin/${quizId}`, {
        questions: validQuestions
      });

      console.log('Save response:', response.data);

      // Refresh quiz data
      await fetchQuiz();

      alert('Quiz saved successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/quiz')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-500">
                  10 questions • {questions.reduce((sum, q) => sum + (q.points || 1), 0)} points
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveQuiz}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content - All Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              questionIndex={index}
              onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Simplified Question Editor Component
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

  const setCorrectAnswer = (optionId) => {
    const newOptions = localQuestion.options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    }));
    updateLocalQuestion({ options: newOptions });
  };

  return (
    <div className="bg-white border rounded p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-medium">Question {questionIndex + 1}</h3>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <input
          type="text"
          value={localQuestion.question}
          onChange={(e) => updateLocalQuestion({ question: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="Type your question"
        />
      </div>

      {/* Answer Options */}
      <div className="space-y-2">
        {localQuestion.options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${questionIndex}`}
              checked={option.isCorrect}
              onChange={() => setCorrectAnswer(option.id)}
              className="w-4 h-4"
            />
            <span className="w-6">{option.id.toUpperCase()}</span>
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, { text: e.target.value })}
              className="flex-1 border rounded px-3 py-2"
              placeholder={`Option ${option.id.toUpperCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQuizEditor;