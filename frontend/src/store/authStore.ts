import { create } from 'zustand';
import { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionToken: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async () => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${BACKEND_URL}/`
        : Linking.createURL('/');

      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
        return;
      }

      // Mobile flow
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const url = result.url;
        const sessionId = url.includes('#session_id=')
          ? url.split('#session_id=')[1]?.split('&')[0]
          : url.split('?session_id=')[1]?.split('&')[0];

        if (sessionId) {
          const response = await axios.post(`${BACKEND_URL}/api/auth/session`, {
            session_id: sessionId
          });

          const { user, session_token } = response.data;
          set({
            user,
            sessionToken: session_token,
            isAuthenticated: true,
            isLoading: false
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Check for session_id in URL (web)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const hash = window.location.hash;
        const query = window.location.search;
        
        const sessionId = hash.includes('session_id=')
          ? hash.split('session_id=')[1]?.split('&')[0]
          : query.includes('session_id=')
          ? query.split('session_id=')[1]?.split('&')[0]
          : null;

        if (sessionId) {
          const response = await axios.post(`${BACKEND_URL}/api/auth/session`, {
            session_id: sessionId
          }, { withCredentials: true });

          const { user, session_token } = response.data;
          set({
            user,
            sessionToken: session_token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      // Try to get current user with existing session
      const state = get();
      if (state.sessionToken || Platform.OS === 'web') {
        const config = state.sessionToken
          ? { headers: { Authorization: `Bearer ${state.sessionToken}` } }
          : { withCredentials: true };
        
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, config);
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('Not authenticated');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      const state = get();
      const config = state.sessionToken
        ? { headers: { Authorization: `Bearer ${state.sessionToken}` } }
        : { withCredentials: true };
      
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, config);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, sessionToken: null, isAuthenticated: false });
    }
  }
}));
