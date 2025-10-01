import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ModulesPage from './pages/ModulesPage';
import TestModules from './pages/TestModules';
import QuizPage from './pages/QuizPage';
import AdminQuizManagement from './pages/AdminQuizManagement';
import AdminQuizEditor from './pages/AdminQuizEditor';
import InstructorQuizManagement from './pages/InstructorQuizManagement';
import InstructorQuizEditor from './pages/InstructorQuizEditor';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/courses/:courseId/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
          <Route path="/courses/:courseId/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/test-modules" element={<ProtectedRoute><TestModules /></ProtectedRoute>} />

          {/* Admin Quiz routes */}
          <Route path="/admin/quiz" element={<ProtectedRoute><AdminQuizManagement /></ProtectedRoute>} />
          <Route path="/admin/quiz/edit/:quizId" element={<ProtectedRoute><AdminQuizEditor /></ProtectedRoute>} />

          {/* Instructor Quiz routes */}
          <Route path="/instructor/quiz" element={<ProtectedRoute><InstructorQuizManagement /></ProtectedRoute>} />
          <Route path="/instructor/quiz/edit/:quizId" element={<ProtectedRoute><InstructorQuizEditor /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
