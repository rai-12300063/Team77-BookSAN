import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ModulesPage from './pages/ModulesPage';
import TestModules from './pages/TestModules';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagement from './pages/admin/UserManagement';
import AdminQuizManagement from './pages/AdminQuizManagement';
import InstructorQuizManagement from './pages/InstructorQuizManagement';
import AdminQuizEditor from './pages/AdminQuizEditor';
import InstructorQuizEditor from './pages/InstructorQuizEditor';

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
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/courses/:courseId/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
          <Route path="/test-modules" element={<ProtectedRoute><TestModules /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute><AdminQuizManagement /></ProtectedRoute>} />
          <Route path="/admin/quiz/edit/:quizId" element={<ProtectedRoute><AdminQuizEditor /></ProtectedRoute>} />
          <Route path="/instructor/quizzes" element={<ProtectedRoute><InstructorQuizManagement /></ProtectedRoute>} />
          <Route path="/instructor/quiz/edit/:quizId" element={<ProtectedRoute><InstructorQuizEditor /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
