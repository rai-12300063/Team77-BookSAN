import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    // Handle both formats: {user, token} or {id, name, email, token}
    let userInfo, tokenValue;
    
    if (authToken) {
      // Called with separate parameters: login(userData, token)
      userInfo = userData;
      tokenValue = authToken;
    } else if (userData.token) {
      // Called with combined object: login({id, name, email, token})
      const { token: extractedToken, ...userDetails } = userData;
      userInfo = userDetails;
      tokenValue = extractedToken;
    } else {
      console.error('Invalid login data format');
      return;
    }

    setUser(userInfo);
    setToken(tokenValue);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
