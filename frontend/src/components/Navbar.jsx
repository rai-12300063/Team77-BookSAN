import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = () => {
    if (isAdmin()) return 'Admin';
    if (isInstructor()) return 'Instructor';
    if (isStudent()) return 'Student';
    return '';
  };

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">QUT-MIT Learning Progress Tracker</Link>
      <div className="flex items-center">
        {user ? (
          <>
            <div className="mr-6 flex items-center">
              <div className="mr-4">
                <span className="text-sm text-green-200">Welcome, {user.name}</span>
                <div className="text-xs text-green-300">{getRoleDisplayName()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/" className="hover:text-blue-200 transition-colors">Dashboard</Link>

              {/* Student Navigation */}
              {isStudent() && (
                <>
                  <Link to="/courses" className="hover:text-blue-200 transition-colors">Courses</Link>
                  <Link to="/tasks" className="hover:text-blue-200 transition-colors">Tasks</Link>
                  <Link to="/progress" className="hover:text-blue-200 transition-colors">Progress</Link>
                </>
              )}

              {/* Instructor Navigation */}
              {isInstructor() && (
                <>
                  <Link to="/courses" className="hover:text-blue-200 transition-colors">Courses</Link>
                  <Link to="/instructor/manage-courses" className="hover:text-blue-200 transition-colors">Manage Courses</Link>
                  <Link to="/instructor/students" className="hover:text-blue-200 transition-colors">Students</Link>
                  <Link to="/instructor/analytics" className="hover:text-blue-200 transition-colors">Analytics</Link>
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin() && (
                <>
                  <Link to="/admin/users" className="hover:text-blue-200 transition-colors">Users</Link>
                  <Link to="/admin/courses" className="hover:text-blue-200 transition-colors">All Courses</Link>
                  <Link to="/admin/analytics" className="hover:text-blue-200 transition-colors">System Analytics</Link>
                  <Link to="/admin/settings" className="hover:text-blue-200 transition-colors">Settings</Link>
                </>
              )}

              <Link to="/profile" className="hover:text-blue-200 transition-colors">Profile</Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
