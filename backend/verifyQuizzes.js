const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

const verifyQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const quizzes = await Quiz.find({});
    console.log('Total Quizzes Created:', quizzes.length);
    console.log('\nQuizzes Summary:');
    quizzes.forEach(q => {
      console.log(`- ${q.title}: ${q.questions.length} questions, ${q.totalPoints} points`);
    });

    if (quizzes.length > 0) {
      const sample = quizzes[0];
      console.log('\nSample Question from', sample.title + ':');
      console.log('Q1:', sample.questions[0].question);
      console.log('Correct Answer:', sample.questions[0].options.find(o => o.isCorrect)?.text);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyQuizzes();
