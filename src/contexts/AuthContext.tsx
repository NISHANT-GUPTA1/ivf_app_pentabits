import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      apiService.setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.login(username, password);

      setToken(response.access_token);
      apiService.setToken(response.access_token);

      // Store token
      localStorage.setItem('auth_token', response.access_token);

      // For demo purposes, set a mock user
      // In a real app, you'd decode the JWT or make another API call
      setUser({
        id: 1,
        username,
        role: username === 'admin' ? 'Admin' : 'Embryologist',
        is_active: true,
        created_at: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiService.setToken('');
    localStorage.removeItem('auth_token');
    // Clear all application data on logout
    localStorage.removeItem('ivf_patients');
    localStorage.removeItem('ivf_embryos');
    localStorage.removeItem('ivf_activePatientId');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};