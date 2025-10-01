import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PermissionGate from './PermissionGate';
import usePermissions from '../hooks/usePermissions';

const Navbar = () => {
  const { user, logout, isAdmin, isInstructor, isStudent } = useAuth();
  const { } = usePermissions();
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
    <nav className="bg-gradient-to-r from-blue-950 to-blue-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center text-2xl font-bold">
        <img src="/BOOKSAN.png" alt="Booksan Logo"className="w-12 h-12 object-contain"/>
        <span>BookSAN Learning Progress Tracker</span>
      </Link>
      <div className="flex items-center">
        {user ? (
          <>
            <div className="mr-6 flex items-center">
              <div className="mr-4">
                <span className="text-sm text-yellow-400">Welcome, {user.name}</span>
                <div className="text-xs text-yellow-400">{getRoleDisplayName()}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/" className="hover:text-white transition-colors hover:font-bold">Dashboard</Link>

              {/* Student Navigation */}
              <PermissionGate resource="courses" action="read">
                <Link to="/courses" className="hover:text-white transition-colors hover:font-bold">
                  {isStudent() ? 'My Courses' : 'Courses'}
                </Link>
              </PermissionGate>

              <PermissionGate resource="tasks" action="submit">
                <Link to="/tasks" className="hover:text-white transition-colors hover:font-bold">Tasks</Link>
              </PermissionGate>

              <PermissionGate resource="analytics" action="viewOwnProgress">
                <Link to="/progress" className="hover:text-white transition-colors hover:font-bold">Progress</Link>
              </PermissionGate>

              {/* Admin Navigation */}
              <PermissionGate resource="users" action="read">
                <Link to="/admin/users" className="hover:text-white transition-colors hover:font-bold">Users</Link>
              </PermissionGate>

              <PermissionGate resource="settings" action="systemSettings">
                <Link to="/admin/settings" className="hover:text-white transition-colors hover:font-bold">Settings</Link>
              </PermissionGate>

              <Link to="/profile" className="hover:text-white transition-colors hover:font-bold">Profile</Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded hover:font-bold" style={{backgroundColor: '#FA1E1C'}}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:font-bold mr-4">Login</Link>
            <Link to="/register"className="hover:font-bold">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
