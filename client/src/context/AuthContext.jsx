import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on boot
  useEffect(() => {
    const hydrateUser = async () => {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.getMe();
        setUser(profile);
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        api.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUser();

    // Listen for unauthorized events to automatically reset auth
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    setUser(result.user);
    return result;
  };

  const register = async (userData) => {
    const result = await api.register(userData);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isHead: user?.role === 'HEAD',
    isViewer: user?.role === 'VIEWER',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
