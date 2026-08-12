import React, { createContext, useState, useEffect, useContext } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'owner';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://iucbghwudabbcofsuxpz.supabase.co/functions/v1/store-rating-auth';
const AUTH_ENDPOINTS = new Set(['/api/auth/register', '/api/auth/login']);
const HOSTED_API_URL = AUTH_API_URL;

const isHostedApiEndpoint = (endpoint: string) =>
  endpoint.startsWith('/api/stores') ||
  endpoint.startsWith('/api/ratings') ||
  endpoint === '/api/auth/update-password';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.has(endpoint);
    const useHostedApi = isAuthEndpoint || isHostedApiEndpoint(endpoint);
    const baseUrl = useHostedApi ? HOSTED_API_URL : API_URL;

    let path = endpoint;
    if (isAuthEndpoint) {
      path = endpoint.replace('/api/auth/register', '/register').replace('/api/auth/login', '/login');
    } else if (isHostedApiEndpoint(endpoint)) {
      path = endpoint.replace(/^\/api\//, '/');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${path}`;

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || 'Unexpected server response' };
    }

    if (response.status === 401) {
      logout();
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (!response.ok) {
      const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(message || 'Something went wrong');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
      apiCall,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
