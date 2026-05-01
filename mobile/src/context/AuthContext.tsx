import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { User } from '../types';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, securityQuestion: string, securityAnswer: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['access_token', 'user']).then((result) => {
      const token = result.find(([key]) => key === 'access_token')?.[1];
      const userRaw = result.find(([key]) => key === 'user')?.[1];
      if (token && userRaw) {
        try {
          const parsedUser = JSON.parse(userRaw);
          setUser(parsedUser);
          i18n.changeLanguage(parsedUser.language_preference || 'en');
        } catch {
          AsyncStorage.multiRemove(['access_token', 'user']);
          setUser(null);
        }
      } else {
        AsyncStorage.multiRemove(['access_token', 'user']);
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  // Keep auth state consistent when token is removed by the response interceptor
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setUser(null);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiLogin(email, password);
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string, securityQuestion: string, securityAnswer: string): Promise<User> => {
    const data = await apiRegister(name, email, password, securityQuestion, securityAnswer);
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.multiRemove(['access_token', 'user']);
    setUser(null);
  };

  const updateUser = (updated: User): void => {
    setUser(updated);
    AsyncStorage.setItem('user', JSON.stringify(updated));
    i18n.changeLanguage(updated.language_preference || 'en');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
