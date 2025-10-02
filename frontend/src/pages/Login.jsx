import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Function to fill form with test credentials
  const fillTestCredentials = (email, password) => {
    setFormData({ email, password });
    setError(''); // Clear any existing errors
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Attempting login with:', formData.email);
      const response = await axiosInstance.post('/api/auth/login', formData);
      console.log('✅ Login successful:', response.data);
      
      // Handle token in login response
      login(response.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">QUT-MIT Learning Progress Tracker</h1>
        <p className="text-gray-600">Track your learning journey and achieve your educational goals</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        
        <div className="mt-4 text-center">
          <Link 
            to="/forgot-password" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Forgot your password?
          </Link>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">🔑 Test Credentials</h3>
          <div className="space-y-2 text-xs">
            <div 
              className="flex justify-between items-center p-2 rounded hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => fillTestCredentials('admin@example.com', 'Admin123!')}
            >
              <span className="font-medium text-blue-600">Admin:</span>
              <span className="text-gray-600">admin@example.com / Admin123!</span>
            </div>
            <div 
              className="flex justify-between items-center p-2 rounded hover:bg-green-50 cursor-pointer transition-colors"
              onClick={() => fillTestCredentials('instructor@example.com', 'Instructor123!')}
            >
              <span className="font-medium text-green-600">Instructor:</span>
              <span className="text-gray-600">instructor@example.com / Instructor123!</span>
            </div>
            <div 
              className="flex justify-between items-center p-2 rounded hover:bg-purple-50 cursor-pointer transition-colors"
              onClick={() => fillTestCredentials('student@example.com', 'Student123!')}
            >
              <span className="font-medium text-purple-600">Student:</span>
              <span className="text-gray-600">student@example.com / Student123!</span>
            </div>
            <div 
              className="flex justify-between items-center p-2 rounded hover:bg-orange-50 cursor-pointer transition-colors"
              onClick={() => fillTestCredentials('test@example.com', 'Test123!')}
            >
              <span className="font-medium text-orange-600">Test User:</span>
              <span className="text-gray-600">test@example.com / Test123!</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">Click on any credential to quick-fill the form</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
