import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axiosInstance.post('/api/auth/register', formData);

      // Auto-login after successful registration
      try {
        const loginResponse = await axiosInstance.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(loginResponse.data);
        navigate('/dashboard');
      } catch {
        alert('Registration successful. Please log in.');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
    <div className="text-center mb-6">
        <img src="/BOOKSAN.png" alt="Booksan Logo" className="mx-auto w-20 h-20 mb-2 object-contain"/>
        <h1 className="text-4xl font-extrabold" style={{ color: '#FA1E1C' }}>BookSAN</h1>
        <p className="text-xl text-blue-800 font-bold">Learning Progress Tracker</p>
        <p className="text-sm text-gray-600">Join us and start tracking your learning progress</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-center">Create your account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="relative mb-4">
          <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-10 p-2 border rounded-xl focus:ring-2 focus:ring-orange-600 focus:outline-none"
            required
            disabled={loading}
          />
        </div>

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
            minLength={6}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-500 disabled:bg-gray-400"
          style={{backgroundColor: '#FA1E1C'}} disabled={loading}
        >
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
        
        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-900 hover:underline font-bold">
            Login →
          </Link>
        </p>


      </form>
    </div>
  );
};

export default Register;
