const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
});

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [optionSchema],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  points: { type: Number, default: 1 },
  explanation: { type: String }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructions: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleId: { type: String }, // Optional module association

  // Quiz settings
  timeLimit: { type: Number }, // in minutes
  passingScore: { type: Number, default: 70 }, // percentage
  showResults: { type: Boolean, default: false },
  showCorrectAnswers: { type: Boolean, default: false },
  randomizeQuestions: { type: Boolean, default: false },
  randomizeOptions: { type: Boolean, default: false },

  // Quiz content
  questions: [questionSchema],
  totalPoints: { type: Number, default: 0 },

  // Quiz scheduling
  availableFrom: { type: Date },
  availableUntil: { type: Date },
  dueDate: { type: Date },

  // Quiz metadata
  difficulty: { type: Number, min: 1, max: 5, default: 1 }, // 1=Easy, 2=Medium, 3=Hard, 4=Expert, 5=Master
  estimatedDuration: { type: Number }, // in minutes
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  // Creator and modification tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Calculate total points when questions are added/modified
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + (question.points || 1), 0);
  next();
});

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Method to check if quiz is currently available
quizSchema.methods.isAvailable = function() {
  const now = new Date();
  if (this.availableFrom && now < this.availableFrom) return false;
  if (this.availableUntil && now > this.availableUntil) return false;
  return this.status === 'published';
};

// Method to check if quiz is overdue
quizSchema.methods.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate;
};

// Method to get quiz for student (without correct answers)
quizSchema.methods.getStudentView = function() {
  const quiz = this.toObject();

  // Remove correct answers and explanations from questions
  quiz.questions = quiz.questions.map(question => {
    const studentQuestion = {
      id: question.id,
      question: question.question,
      points: question.points
    };

    if (question.options && question.options.length > 0) {
      studentQuestion.options = question.options.map(option => ({
        id: option.id,
        text: option.text
      }));
    }

    return studentQuestion;
  });

  return quiz;
};

module.exports = mongoose.model('Quiz', quizSchema);