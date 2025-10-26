import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AUTH_CONFIG } from '../config/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem(AUTH_CONFIG.TOKEN_KEY));

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = AUTH_CONFIG.API_BASE_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (googleCredential) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/google', {
        credential: googleCredential
      });

      const { access_token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, access_token);
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const verifyToken = async () => {
    if (!token) return false;
    
    try {
      await axios.get('/auth/verify');
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    verifyToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
