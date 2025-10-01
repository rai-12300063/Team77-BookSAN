import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-green-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">QUT-MIT Learning Progress Tracker</Link>
      <div>
        {user ? (
          <>
            <Link to="/" className="mr-4 hover:text-blue-200">Dashboard</Link>
            <Link to="/courses" className="mr-4 hover:text-blue-200">Courses</Link>
            <Link to="/test-modules" className="mr-4 hover:text-blue-200">Test Modules</Link>
            <Link to="/tasks" className="mr-4 hover:text-blue-200">Tasks</Link>
            {(user.role === 'admin' || user.role === 'instructor') && (
              <Link
                to={user.role === 'admin' ? "/admin/quiz" : "/instructor/quiz"}
                className="mr-4 hover:text-blue-200"
              >
                Quiz Management
              </Link>
            )}
            <Link to="/profile" className="mr-4 hover:text-blue-200">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
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
