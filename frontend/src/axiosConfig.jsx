import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // Local backend server with remote MongoDB Atlas
  //baseURL: 'http://3.27.78.38:5001', // Remote server (commented out)
  timeout: 15000, // 15 second timeout for database operations
  headers: { 'Content-Type': 'application/json' },
});

// Add token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
