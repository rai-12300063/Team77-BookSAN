import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ApiTest from './pages/ApiTest';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagement from './pages/admin/UserManagement';

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

          {/* Protected routes - Available to all authenticated users */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Student routes */}
          <Route path="/courses" element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Courses /></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><CourseDetail /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute allowedRoles={['student']}><Tasks /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute allowedRoles={['student']}><div>Progress Page</div></ProtectedRoute>} />

          {/* Instructor routes */}
          <Route path="/instructor/manage-courses" element={<ProtectedRoute requireRole="instructor"><div>Instructor Course Management</div></ProtectedRoute>} />
          <Route path="/instructor/students" element={<ProtectedRoute requireRole="instructor"><div>Student Management</div></ProtectedRoute>} />
          <Route path="/instructor/analytics" element={<ProtectedRoute requireRole="instructor"><div>Instructor Analytics</div></ProtectedRoute>} />
          <Route path="/instructor/create-course" element={<ProtectedRoute requireRole="instructor"><div>Create Course</div></ProtectedRoute>} />
          <Route path="/instructor/courses/:id" element={<ProtectedRoute requireRole="instructor"><div>Course Details</div></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/analytics" element={<ProtectedRoute requireRole="instructor"><div>Course Analytics</div></ProtectedRoute>} />
          <Route path="/instructor/grade-book" element={<ProtectedRoute requireRole="instructor"><div>Grade Book</div></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/users" element={<ProtectedRoute requireRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requireRole="admin"><div>All Courses Management</div></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requireRole="admin"><div>System Analytics</div></ProtectedRoute>} />

          {/* Development/Testing routes - Admin only */}
          <Route path="/api-test" element={<ProtectedRoute requireRole="admin"><ApiTest /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
