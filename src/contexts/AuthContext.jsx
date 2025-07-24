import React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Required env: VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031/api';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  useEffect(() => {
    // Check for user and token in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common['x-auth-token'] = storedToken;
    }
    
    setLoading(false);
  }, []);

  const register = async (credentials)=> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      const { user, token } = response.data;
      
      // Store user data and token
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (credentials)=>{
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { user, token } = response.data;
      
      // Store user data and token
      setUser(user);
      setToken(token);
      console.log(response.data);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clean up local storage and state
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
