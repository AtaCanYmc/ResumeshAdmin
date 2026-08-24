import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { supabase } from '../services/supabase';

axios.defaults.withCredentials = true;

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
      }
    });

    // Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = async () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout request failed', err);
    }
  };

  useEffect(() => {
    // Request interceptor to automatically add Authorization Header
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle session expiration (401/403)
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
