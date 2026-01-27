import { create } from 'zustand';
import { User } from '../types';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      const { user, access_token } = response.data;
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem('access_token', access_token);
      
      set({
        user,
        accessToken: access_token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email,
        password,
        name
      });

      const { user, access_token } = response.data;
      
      // Save token to AsyncStorage
      await AsyncStorage.setItem('access_token', access_token);
      
      set({
        user,
        accessToken: access_token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Try to get current user with token
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({
        user: response.data,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      console.log('Not authenticated');
      await AsyncStorage.removeItem('access_token');
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      const state = get();
      if (state.accessToken) {
        await axios.post(
          `${BACKEND_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${state.accessToken}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  }
}));
