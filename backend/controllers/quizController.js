const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// Get all quizzes for a course
const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user has access to the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get all published quizzes for the course
    const quizzes = await Quiz.find({
      courseId,
      status: 'published'
    }).select('-questions.correctAnswer -questions.explanation');

    // Get user's attempts for each quiz
    const quizzesWithUserData = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizObj = quiz.toObject();

        // Get user's attempts for this quiz
        const attempts = await QuizAttempt.find({
          quizId: quiz._id,
          userId
        }).sort({ attemptNumber: -1 });

        const latestAttempt = attempts[0];
        const bestScore = Math.max(...attempts.filter(a => a.isCompleted()).map(a => a.percentage), 0);

        quizObj.userStats = {
          attemptsTaken: attempts.length,
          bestScore: bestScore || null,
          latestAttempt: latestAttempt ? {
            status: latestAttempt.status,
            percentage: latestAttempt.percentage,
            submittedAt: latestAttempt.submittedAt,
            currentQuestion: latestAttempt.currentQuestion
          } : null,
          canAttempt: !quiz.maxAttempts || attempts.length < quiz.maxAttempts,
          isAvailable: quiz.isAvailable(),
          isOverdue: quiz.isOverdue()
        };

        return quizObj;
      })
    );

    res.json(quizzesWithUserData);
  } catch (error) {
    console.error('Error fetching course quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific quiz for taking
const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId).populate('courseId', 'title');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isAvailable()) {
      return res.status(403).json({ message: 'Quiz is not currently available' });
    }

    // Check if user has attempts remaining
    const attemptCount = await QuizAttempt.getUserAttemptCount(quizId, userId);
    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    // Get student view (without correct answers)
    const studentQuiz = quiz.getStudentView();

    // Get user's latest attempt if exists
    const latestAttempt = await QuizAttempt.getUserLatestAttempt(quizId, userId);

    studentQuiz.userStats = {
      attemptsTaken: attemptCount,
      canAttempt: !quiz.maxAttempts || attemptCount < quiz.maxAttempts,
      latestAttempt: latestAttempt ? {
        status: latestAttempt.status,
        attemptNumber: latestAttempt.attemptNumber,
        currentQuestion: latestAttempt.currentQuestion,
        timeRemaining: latestAttempt.getRemainingTime()
      } : null
    };

    res.json(studentQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Start a new quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isAvailable()) {
      return res.status(403).json({ message: 'Quiz is not currently available' });
    }

    // Check if user has attempts remaining
    const attemptCount = await QuizAttempt.getUserAttemptCount(quizId, userId);
    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    // Check if user has an active attempt
    const activeAttempt = await QuizAttempt.findOne({
      quizId,
      userId,
      status: { $in: ['in_progress', 'paused'] }
    });

    if (activeAttempt) {
      // Update time remaining
      activeAttempt.updateTimeRemaining();
      await activeAttempt.save();

      return res.json({
        attemptId: activeAttempt._id,
        status: activeAttempt.status,
        currentQuestion: activeAttempt.currentQuestion,
        timeRemaining: activeAttempt.timeRemaining,
        answers: activeAttempt.answers,
        message: 'Resuming existing attempt'
      });
    }

    // Create new attempt
    const newAttempt = new QuizAttempt({
      quizId,
      userId,
      courseId: quiz.courseId,
      attemptNumber: attemptCount + 1,
      timeLimit: quiz.timeLimit,
      totalPoints: quiz.totalPoints,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Set initial time remaining
    newAttempt.updateTimeRemaining();
    await newAttempt.save();

    res.status(201).json({
      attemptId: newAttempt._id,
      status: newAttempt.status,
      currentQuestion: newAttempt.currentQuestion,
      timeRemaining: newAttempt.timeRemaining,
      answers: newAttempt.answers,
      message: 'New quiz attempt started'
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save quiz progress (pause functionality)
const saveQuizProgress = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { currentQuestion, answers, timeRemaining, status } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (!attempt.isActive()) {
      return res.status(403).json({ message: 'Quiz attempt is not active' });
    }

    // Update attempt with current progress
    attempt.currentQuestion = currentQuestion || attempt.currentQuestion;
    attempt.timeRemaining = timeRemaining || attempt.getRemainingTime();
    attempt.status = status || attempt.status;

    // Update answers
    if (answers) {
      attempt.answers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        selectedAnswer: answer
      }));
    }

    await attempt.save();

    res.json({
      message: 'Progress saved successfully',
      currentQuestion: attempt.currentQuestion,
      timeRemaining: attempt.timeRemaining,
      status: attempt.status
    });
  } catch (error) {
    console.error('Error saving quiz progress:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent, status } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (!attempt.isActive()) {
      return res.status(403).json({ message: 'Quiz attempt is not active' });
    }

    const quiz = attempt.quizId;

    // Process answers and calculate score
    const processedAnswers = [];
    let totalPointsEarned = 0;

    for (const [questionId, userAnswer] of Object.entries(answers || {})) {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Check answer based on question type
      switch (question.type) {
        case 'multiple_choice':
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && correctOption.id === userAnswer;
          break;

        case 'multiple_select':
          const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
          const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [];
          isCorrect = correctOptions.length === selectedOptions.length &&
                     correctOptions.every(id => selectedOptions.includes(id));
          break;

        case 'true_false':
          isCorrect = question.correctAnswer === userAnswer;
          break;

        case 'text':
          // For text questions, you might want more sophisticated matching
          isCorrect = question.correctAnswer &&
                     userAnswer &&
                     question.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
          break;
      }

      if (isCorrect) {
        pointsEarned = question.points || 1;
        totalPointsEarned += pointsEarned;
      }

      processedAnswers.push({
        questionId,
        selectedAnswer: userAnswer,
        isCorrect,
        pointsEarned
      });
    }

    // Update attempt with final results
    attempt.answers = processedAnswers;
    attempt.pointsEarned = totalPointsEarned;
    attempt.percentage = Math.round((totalPointsEarned / quiz.totalPoints) * 100);
    attempt.passed = attempt.percentage >= quiz.passingScore;
    attempt.status = status === 'auto_submitted' ? 'auto_submitted' : 'submitted';
    attempt.submittedAt = new Date();

    await attempt.save();

    res.json({
      message: 'Quiz submitted successfully',
      results: {
        attemptId: attempt._id,
        pointsEarned: attempt.pointsEarned,
        totalPoints: quiz.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        showResults: quiz.showResults,
        showCorrectAnswers: quiz.showCorrectAnswers
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).populate('quizId');
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (!attempt.isCompleted()) {
      return res.status(403).json({ message: 'Quiz attempt not completed' });
    }

    const quiz = attempt.quizId;

    const results = {
      attemptId: attempt._id,
      quizTitle: quiz.title,
      attemptNumber: attempt.attemptNumber,
      pointsEarned: attempt.pointsEarned,
      totalPoints: quiz.totalPoints,
      percentage: attempt.percentage,
      passed: attempt.passed,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
      timeSpent: attempt.submittedAt ?
        Math.round((attempt.submittedAt - attempt.startedAt) / 1000 / 60) : null
    };

    // Include detailed answers if quiz allows it
    if (quiz.showCorrectAnswers) {
      results.detailedResults = attempt.answers.map(answer => {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        return {
          questionId: answer.questionId,
          question: question?.question,
          userAnswer: answer.selectedAnswer,
          correctAnswer: question?.correctAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          explanation: question?.explanation
        };
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      instructions,
      timeLimit,
      maxAttempts,
      passingScore,
      difficulty,
      questions,
      status = 'draft'
    } = req.body;
    const userId = req.user.id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Calculate total points from questions
    const totalPoints = questions.reduce((sum, question) => sum + (question.points || 1), 0);

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      instructions,
      timeLimit,
      maxAttempts,
      passingScore: passingScore || 70,
      status,
      difficulty: difficulty || 1,
      courseId,
      createdBy: userId,
      questions: questions.map((question, index) => ({
        id: question.id || `q${index + 1}`,
        type: question.type,
        question: question.question,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        points: question.points || 1,
        explanation: question.explanation
      })),
      totalPoints
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questionsCount: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        status: quiz.status
      }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update an existing quiz
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Recalculate total points if questions are updated
    if (updateData.questions) {
      updateData.totalPoints = updateData.questions.reduce((sum, question) => sum + (question.points || 1), 0);
    }

    // Update quiz
    Object.assign(quiz, updateData);
    quiz.updatedBy = userId;
    quiz.updatedAt = new Date();

    await quiz.save();

    res.json({
      message: 'Quiz updated successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questionsCount: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        status: quiz.status
      }
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz has any attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId });
    if (attemptCount > 0) {
      return res.status(403).json({
        message: 'Cannot delete quiz with existing attempts',
        attempts: attemptCount
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all quizzes for management
const getAllQuizzes = async (req, res) => {
  try {
    const { courseId } = req.query;

    const filter = {};
    if (courseId) {
      filter.courseId = courseId;
    }

    const quizzes = await Quiz.find(filter)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await QuizAttempt.countDocuments({ quizId: quiz._id });
        const completedAttempts = await QuizAttempt.countDocuments({
          quizId: quiz._id,
          status: { $in: ['submitted', 'auto_submitted'] }
        });

        return {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          course: quiz.courseId,
          status: quiz.status,
          difficulty: quiz.difficulty,
          questionsCount: quiz.questions.length,
          totalPoints: quiz.totalPoints,
          timeLimit: quiz.timeLimit,
          maxAttempts: quiz.maxAttempts,
          passingScore: quiz.passingScore,
          createdBy: quiz.createdBy,
          createdAt: quiz.createdAt,
          stats: {
            totalAttempts: attemptCount,
            completedAttempts
          }
        };
      })
    );

    res.json(quizzesWithStats);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCourseQuizzes,
  getQuiz,
  startQuizAttempt,
  saveQuizProgress,
  submitQuizAttempt,
  getQuizResults,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes
};