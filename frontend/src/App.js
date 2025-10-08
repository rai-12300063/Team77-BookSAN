import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import CourseModuleManagement from './pages/CourseModuleManagement';
import QuizPage from './pages/QuizPage';
import AdminQuizManagement from './pages/AdminQuizManagement';
import InstructorQuizManagement from './pages/InstructorQuizManagement';
import AdminQuizEditor from './pages/AdminQuizEditor';
import InstructorQuizEditor from './pages/InstructorQuizEditor';
import TestModules from './pages/TestModules';

import InstructorsPage from './pages/InstructorsPage';
import StudentsPage from './pages/StudentsPage';
import UserManagement from './pages/UserManagement';
import CourseEnrollmentManagement from './pages/CourseEnrollmentManagement';

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
          <Route path="/courses/:courseId/modules/:moduleId" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
          <Route path="/course-modules" element={<ProtectedRoute><CourseModuleManagement /></ProtectedRoute>} />
          <Route path="/courses/:courseId/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />

          {/* Admin Quiz routes - Admin Only */}
          <Route path="/admin/quiz" element={<ProtectedRoute adminOnly={true}><AdminQuizManagement /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly={true}><AdminQuizManagement /></ProtectedRoute>} />
          <Route path="/admin/quiz/edit/:quizId" element={<ProtectedRoute adminOnly={true}><AdminQuizEditor /></ProtectedRoute>} />
          
          {/* Instructor Quiz routes - Instructor Only */}
          <Route path="/instructor/quizzes" element={<ProtectedRoute instructorOnly={true}><InstructorQuizManagement /></ProtectedRoute>} />
          <Route path="/instructor/quiz/edit/:quizId" element={<ProtectedRoute instructorOnly={true}><InstructorQuizEditor /></ProtectedRoute>} />

          {/* Course Enrollment Management - Admin and Instructor only */}
          <Route path="/course-enrollment" element={<ProtectedRoute><CourseEnrollmentManagement /></ProtectedRoute>} />

          {/* User Management routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructors"
            element={
              <ProtectedRoute adminOnly={true}>
                <InstructorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute adminOnly={true}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Test Modules Route - Admin Only */}
          <Route 
            path="/test-modules" 
            element={
              <ProtectedRoute adminOnly={true}>
                <TestModules />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
