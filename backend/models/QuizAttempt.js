const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  selectedAnswer: { type: mongoose.Schema.Types.Mixed }, // Can be string, array, or boolean
  isCorrect: { type: Boolean },
  pointsEarned: { type: Number, default: 0 },
  timeSpent: { type: Number } // in seconds
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // Attempt tracking
  attemptNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ['in_progress', 'paused', 'completed', 'submitted', 'auto_submitted'],
    default: 'in_progress'
  },

  // Quiz session data
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeLimit: { type: Number }, // in minutes, copied from quiz at start
  timeRemaining: { type: Number }, // in seconds
  currentQuestion: { type: Number, default: 0 },

  // Answers and scoring
  answers: [answerSchema],
  totalPoints: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },

  // Quiz state (for pause/resume)
  quizState: {
    currentQuestion: { type: Number, default: 0 },
    answeredQuestions: [{ type: String }], // Array of question IDs
    timeSpentPerQuestion: { type: Map, of: Number } // questionId -> seconds
  },

  // Metadata
  ipAddress: { type: String },
  userAgent: { type: String },
  browserFingerprint: { type: String }
}, { timestamps: true });

// Index for efficient queries
quizAttemptSchema.index({ quizId: 1, userId: 1, attemptNumber: 1 });
quizAttemptSchema.index({ userId: 1, courseId: 1 });
quizAttemptSchema.index({ quizId: 1, status: 1 });

// Method to calculate score
quizAttemptSchema.methods.calculateScore = function() {
  this.pointsEarned = this.answers.reduce((total, answer) => total + (answer.pointsEarned || 0), 0);
  this.percentage = this.totalPoints > 0 ? Math.round((this.pointsEarned / this.totalPoints) * 100) : 0;
  return this.percentage;
};

// Method to check if attempt is active (in progress or paused)
quizAttemptSchema.methods.isActive = function() {
  return ['in_progress', 'paused'].includes(this.status);
};

// Method to check if attempt is completed
quizAttemptSchema.methods.isCompleted = function() {
  return ['completed', 'submitted', 'auto_submitted'].includes(this.status);
};

// Method to check if time limit exceeded
quizAttemptSchema.methods.isTimeExpired = function() {
  if (!this.timeLimit || !this.startedAt) return false;
  const timeElapsed = (Date.now() - this.startedAt.getTime()) / 1000 / 60; // in minutes
  return timeElapsed >= this.timeLimit;
};

// Method to get remaining time in seconds
quizAttemptSchema.methods.getRemainingTime = function() {
  if (!this.timeLimit || !this.startedAt) return null;

  const timeElapsed = (Date.now() - this.startedAt.getTime()) / 1000; // in seconds
  const totalTimeAllowed = this.timeLimit * 60; // convert minutes to seconds
  const remaining = totalTimeAllowed - timeElapsed;

  return Math.max(0, Math.floor(remaining));
};

// Method to update time remaining
quizAttemptSchema.methods.updateTimeRemaining = function() {
  this.timeRemaining = this.getRemainingTime();
  return this.timeRemaining;
};

// Static method to get user's attempt count for a quiz
quizAttemptSchema.statics.getUserAttemptCount = async function(quizId, userId) {
  return await this.countDocuments({ quizId, userId });
};

// Static method to get user's best score for a quiz
quizAttemptSchema.statics.getUserBestScore = async function(quizId, userId) {
  const result = await this.aggregate([
    { $match: { quizId: mongoose.Types.ObjectId(quizId), userId: mongoose.Types.ObjectId(userId), status: { $in: ['completed', 'submitted', 'auto_submitted'] } } },
    { $group: { _id: null, bestScore: { $max: '$percentage' } } }
  ]);

  return result.length > 0 ? result[0].bestScore : 0;
};

// Static method to get user's latest attempt for a quiz
quizAttemptSchema.statics.getUserLatestAttempt = async function(quizId, userId) {
  return await this.findOne({ quizId, userId }).sort({ attemptNumber: -1 });
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);