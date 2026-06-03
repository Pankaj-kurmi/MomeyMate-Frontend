import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, STORAGE_KEYS } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user info', err);
        logout();
      }
    }
    setLoading(false);

    // Setup unauthorized logout callback
    api.onUnauthorized = () => {
      logout();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register({ name, email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  const updateProfileState = (updatedProfile) => {
    const updatedUser = { ...user, name: updatedProfile.name, email: updatedProfile.email };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
