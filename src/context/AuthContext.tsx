import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { apiClient } from '../api/client';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (username: string, email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = await storageService.getItem('pulse_auth_token');
      const savedUser = await storageService.getItem('pulse_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (username: string, email: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { username, email });
      const { user: authUser, token: authToken } = res.data.data;

      setUser(authUser);
      setToken(authToken);

      await storageService.setItem('pulse_auth_token', authToken);
      await storageService.setItem('pulse_user', JSON.stringify(authUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storageService.removeItem('pulse_auth_token');
    await storageService.removeItem('pulse_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
