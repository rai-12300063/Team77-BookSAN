

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const instructorsRoutes = require('./routes/instructorsRoutes');
const studentRoutes = require('./routes/studentsRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/module-progress', require('./routes/moduleProgressRoutes'));
app.use('/api/oop', require('./routes/oopRoutes'));
app.use('/api/patterns', require('./routes/enhancedPatternsRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/populate', require('./routes/populateRoutes'));
app.use('/api/instructors', instructorsRoutes);
app.use('/api/students', studentRoutes);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ QUT-MIT Learning Progress Tracker Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
