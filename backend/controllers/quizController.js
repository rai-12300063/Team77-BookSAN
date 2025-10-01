const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');

// Get all quizzes for a course
const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user has access to the course
    const course = await Course.findById(courseId).select('syllabus');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get user's progress
    const progress = await LearningProgress.findOne({ userId, courseId });
    const totalModules = course.syllabus ? course.syllabus.length : 0;
    const completedModules = progress && progress.modulesCompleted ? progress.modulesCompleted.length : 0;
    const allModulesCompleted = completedModules >= totalModules && totalModules > 0;

    const quizzes = await Quiz.find({
      courseId,
      status: 'published'
    }).select('-questions.correctAnswer -questions.explanation');

    const quizzesWithUserData = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      quizObj.userStats = {
        isAvailable: quiz.isAvailable(),
        isOverdue: quiz.isOverdue(),
        allModulesCompleted,
        requiredModules: totalModules,
        completedModules
      };
      return quizObj;
    });

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

    const quiz = await Quiz.findById(quizId).populate('courseId', 'title syllabus');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isAvailable()) {
      return res.status(403).json({ message: 'Quiz is not currently available' });
    }

    // Check if user has completed all modules before allowing quiz access
    const course = quiz.courseId;
    const progress = await LearningProgress.findOne({ userId, courseId: course._id });

    if (!progress) {
      return res.status(403).json({
        message: 'You must enroll in the course before taking the quiz'
      });
    }

    const totalModules = course.syllabus ? course.syllabus.length : 0;
    const completedModules = progress.modulesCompleted ? progress.modulesCompleted.length : 0;

    // Check if course has at least one module
    if (totalModules === 0) {
      return res.status(403).json({
        message: 'Quiz is not available. This course does not have any modules yet.'
      });
    }

    // Check if all modules are completed
    if (completedModules < totalModules) {
      return res.status(403).json({
        message: `Quiz is only available after completing all course modules. You have completed ${completedModules} out of ${totalModules} modules.`,
        requiredModules: totalModules,
        completedModules: completedModules
      });
    }

    const studentQuiz = quiz.getStudentView();

    res.json(studentQuiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const processedAnswers = [];
    let totalPointsEarned = 0;

    for (const [questionId, userAnswer] of Object.entries(answers || {})) {
      const question = quiz.questions.find(q => q.id === questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption && correctOption.id === userAnswer;

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

    const percentage = Math.round((totalPointsEarned / quiz.totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    if (passed) {
      const progress = await LearningProgress.findOne({
        userId,
        courseId: quiz.courseId
      });

      if (progress && !progress.isCompleted) {
        const course = await Course.findById(quiz.courseId);
        const totalModules = course.syllabus ? course.syllabus.length : 0;
        const completedModules = progress.modulesCompleted ? progress.modulesCompleted.length : 0;

        if (totalModules > 0 && completedModules >= totalModules) {
          progress.isCompleted = true;
          progress.completionDate = new Date();
          progress.completionPercentage = 100;

          const hasCompletionAchievement = progress.achievements.some(a => a.type === 'course_completed');
          if (!hasCompletionAchievement) {
            progress.achievements.push({
              type: 'course_completed',
              description: `Completed ${course.title} with quiz score of ${percentage}%`
            });
          }

          await progress.save();
        }
      }
    }

    res.json({
      message: 'Quiz submitted successfully',
      results: {
        passed,
        percentage,
        pointsEarned: totalPointsEarned,
        totalPoints: quiz.totalPoints,
        answers: processedAnswers
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Admin: Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      instructions,
      questions,
      status = 'draft'
    } = req.body;
    const userId = req.user.id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course already has a quiz (limit 1 quiz per course)
    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(400).json({
        message: 'This course already has a quiz. Each course can only have one quiz.',
        existingQuizId: existingQuiz._id
      });
    }

    // Validate question limit (max 10 questions)
    if (questions && questions.length > 10) {
      return res.status(400).json({ message: 'Quiz cannot have more than 10 questions' });
    }

    const totalPoints = questions.reduce((sum, question) => sum + (question.points || 1), 0);

    const quiz = new Quiz({
      title,
      instructions,
      courseId,
      createdBy: userId,
      status,
      questions: questions.map((question, index) => ({
        id: question.id || `q${index + 1}`,
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

    // Validate question limit (max 10 questions)
    if (updateData.questions && updateData.questions.length > 10) {
      return res.status(400).json({ message: 'Quiz cannot have more than 10 questions' });
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

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get a specific quiz for editing (no restrictions)
const getQuizForEdit = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate('courseId', 'title syllabus');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Return full quiz with all data (including correct answers for editing)
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz for edit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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

    const quizzesData = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      course: quiz.courseId,
      status: quiz.status,
      difficulty: quiz.difficulty,
      questionsCount: quiz.questions.length,
      totalPoints: quiz.totalPoints,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt
    }));

    res.json(quizzesData);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== INSTRUCTOR METHODS ==========

const getInstructorQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    let filter = {};
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (course.instructor.id.toString() !== userId) {
        return res.status(403).json({ message: 'You can only view quizzes for your own courses' });
      }
      filter.courseId = courseId;
    } else {
      const instructorCourses = await Course.find({ 'instructor.id': userId });
      const courseIds = instructorCourses.map(course => course._id);
      filter.courseId = { $in: courseIds };
    }

    const quizzes = await Quiz.find(filter)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const quizzesData = quizzes.map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      course: quiz.courseId,
      status: quiz.status,
      difficulty: quiz.difficulty,
      questionsCount: quiz.questions.length,
      totalPoints: quiz.totalPoints,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      createdBy: quiz.createdBy,
      createdAt: quiz.createdAt
    }));

    res.json(quizzesData);
  } catch (error) {
    console.error('Error fetching instructor quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Instructor: Create quiz in assigned course
const createInstructorQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      instructions,
      questions,
      status = 'draft'
    } = req.body;
    const userId = req.user.id;

    // Verify course exists and instructor owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only create quizzes for your own courses' });
    }

    // Check if course already has a quiz (limit 1 quiz per course)
    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(400).json({
        message: 'This course already has a quiz. Each course can only have one quiz.',
        existingQuizId: existingQuiz._id
      });
    }

    // Validate question limit (max 10 questions)
    if (questions && questions.length > 10) {
      return res.status(400).json({ message: 'Quiz cannot have more than 10 questions' });
    }

    const totalPoints = questions.reduce((sum, question) => sum + (question.points || 1), 0);

    const quiz = new Quiz({
      title,
      instructions,
      courseId,
      createdBy: userId,
      status,
      questions: questions.map((question, index) => ({
        id: question.id || `q${index + 1}`,
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
    console.error('Error creating instructor quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Instructor: Update quiz in assigned course
const updateInstructorQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId).populate('courseId');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify instructor owns the course this quiz belongs to
    if (quiz.courseId.instructor.id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update quizzes for your own courses' });
    }

    // Validate question limit (max 10 questions)
    if (updateData.questions && updateData.questions.length > 10) {
      return res.status(400).json({ message: 'Quiz cannot have more than 10 questions' });
    }

    // Recalculate total points if questions are updated
    if (updateData.questions) {
      updateData.totalPoints = updateData.questions.reduce((sum, question) => sum + (question.points || 1), 0);
    }

    // Update quiz
    Object.assign(quiz, updateData);
    quiz.lastModifiedBy = userId;
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
    console.error('Error updating instructor quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteInstructorQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId).populate('courseId');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.courseId.instructor.id.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete quizzes for your own courses' });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Instructor: Get instructor's assigned courses for quiz creation
const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await Course.find({ 'instructor.id': userId })
      .select('title description category difficulty enrollmentCount')
      .sort({ title: 1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Get all courses for quiz creation (no restrictions)
const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find({})
      .select('title description category difficulty enrollmentCount instructor')
      .populate('instructor.id', 'firstName lastName email')
      .sort({ title: 1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCourseQuizzes,
  getQuiz,
  submitQuizAttempt,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizForEdit,
  getInstructorQuizzes,
  createInstructorQuiz,
  updateInstructorQuiz,
  deleteInstructorQuiz,
  getInstructorCourses,
  getAllCoursesForAdmin
};