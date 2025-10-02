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
    <nav className="bg-gradient-to-r from-blue-950 to-blue-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center text-2xl font-bold">
        <img src="/BOOKSAN.png" alt="Booksan Logo"className="w-12 h-12 object-contain"/>
        <span>BookSAN Learning Progress Tracker</span>
      </Link>
      <div>
        {user ? (
          <>
            <Link to="/" className="mr-4 hover:text-yellow-300">Dashboard</Link>
            <Link to="/courses" className="mr-4 hover:text-yellow-300">Courses</Link>
            <Link to="/course-modules" className="mr-4 hover:text-yellow-300">Manage Modules</Link>

            {(user.role === 'admin' || user.role === 'instructor') && (
              <Link
                to={user.role === 'admin' ? "/admin/quiz" : "/instructor/quiz"}
                className="mr-4 hover:text-blue-200"
              >
                Quiz Management
              </Link>
            )}
            <Link to="/profile" className="mr-4 hover:text-yellow-300">Profile</Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded hover:font-bold" style={{backgroundColor: '#FA1E1C'}}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-yellow-400 mr-4">Login</Link>
            <Link to="/register"className="hover:text-yellow-400">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
