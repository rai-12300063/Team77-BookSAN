import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const ModulesPage = lazy(() => import('./pages/ModulesPage'));
const ModuleDetailPage = lazy(() => import('./pages/ModuleDetailPage'));
const CourseModuleManagement = lazy(() => import('./pages/CourseModuleManagement'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const AdminQuizManagement = lazy(() => import('./pages/AdminQuizManagement'));
const InstructorQuizManagement = lazy(() => import('./pages/InstructorQuizManagement'));
const AdminQuizEditor = lazy(() => import('./pages/AdminQuizEditor'));
const InstructorQuizEditor = lazy(() => import('./pages/InstructorQuizEditor'));
const TestModules = lazy(() => import('./pages/TestModules'));
const InstructorsPage = lazy(() => import('./pages/InstructorsPage'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const CourseEnrollmentManagement = lazy(() => import('./pages/CourseEnrollmentManagement'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
