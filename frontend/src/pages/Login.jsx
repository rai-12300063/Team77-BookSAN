import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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
    
    // Quick client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Logging in...');
      
      // Use Promise.race for timeout handling
      const loginPromise = axiosInstance.post('/api/auth/login', formData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 8000)
      );
      
      const response = await Promise.race([loginPromise, timeoutPromise]);
      console.log('✅ Login successful');
      
      // Immediately update auth state and navigate
      login(response.data);
      
      // Navigate without waiting for state update
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.message === 'Login timeout') {
        errorMessage = 'Login is taking too long. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-2">
        <img src="/BOOKSAN.png" alt="Booksan Logo" className="mx-auto w-20 h-20 mb-2 object-contain"/>
        <h1 className="text-4xl font-extrabold" style={{ color: '#FA1E1C' }}>BookSAN</h1>
        <p className="text-xl text-blue-800 font-bold">Learning Progress Tracker</p>
        <p className="text-sm text-gray-600">Join us and start tracking your learning progress</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign in to your account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="relative mb-4">
          <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> 
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 p-2 border rounded-xl focus:ring-2 focus:ring-orange-600 focus:outline-none"
            required
            disabled={loading}
          />
        </div>

        <div className="relative mb-4">
          <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full pl-10 p-2 border rounded-xl focus:ring-2 focus:ring-orange-600 focus:outline-none"
            required
            disabled={loading}
          />
        </div>

          <button
            type="submit"
            className="font-medium w-full bg-blue-600 text-white p-2 rounded-xl hover:bg-orange-500 disabled:bg-gray-400"style={{backgroundColor: '#FA1E1C'}}
            disabled={loading}
          >

          {loading ? 'Logging in...' : 'Login'}
        </button>

        
        <div className="mt-4 text-center text-sm">
          <Link 
            to="/forgot-password" 
            className="text-blue-700 hover:underline"
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
