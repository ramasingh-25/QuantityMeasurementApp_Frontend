import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5263/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mx_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('mx_user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('mx_user');
      }
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const data = await response.json();
      const { token: newToken, user: userData } = data;

      localStorage.setItem('mx_token', newToken);
      localStorage.setItem('mx_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Signup failed');
      }

      return { success: true, message: 'Account created successfully! Please sign in.' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mx_token');
    localStorage.removeItem('mx_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isGuest = !token;

  const value = {
    user,
    token,
    isAuthenticated,
    isGuest,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
