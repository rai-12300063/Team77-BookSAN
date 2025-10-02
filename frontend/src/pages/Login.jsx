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
        
      </form>
    </div>
  );
};

export default Login;
