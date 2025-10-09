

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');
const performanceMiddleware = require('./middleware/performance');
const instructorsRoutes = require('./routes/instructorsRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Configure dotenv to load from the correct path
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Performance optimizations
app.use(compression()); // Enable gzip compression
app.use(performanceMiddleware); // Monitor slow requests
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set request size limit
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/module-progress', require('./routes/moduleProgressRoutes'));
// app.use('/api/oop', require('./routes/oopRoutes'));
// app.use('/api/patterns', require('./routes/enhancedPatternsRoutes'));
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/populate', require('./routes/populateRoutes'));
app.use('/api/instructors', instructorsRoutes);
app.use('/api/students', studentRoutes);

const startServer = async () => {
  try {
    // Start server and connect to DB in parallel for faster startup
    const PORT = process.env.PORT || 5001;
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ BookSAN Learning Progress Tracker Server running on port ${PORT}`);
    });
    
    // Connect to database after server starts (non-blocking)
    connectDB().catch(err => {
      console.error('❌ Database connection failed:', err);
      server.close();
    });
    
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
