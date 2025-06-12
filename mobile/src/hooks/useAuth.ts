import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        apiService.setToken(token);
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await apiService.login(data);
      await AsyncStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiService.register(data);
      await AsyncStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };
};

export { AuthContext };