import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isGuest: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await authService.getToken();
      if (token) {
        const profile = await authService.getProfile();
        set({ user: profile, token, isGuest: false, isLoading: false });
        return;
      }
    } catch (e) {
      // Invalid/expired token
      await authService.logout();
    }
    set({ user: null, token: null, isGuest: true, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(email, password);
      const user: User = { id: res.user_id, email: res.email, full_name: res.full_name, is_active: true };
      set({ user, token: res.access_token, isGuest: false, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(email, password, fullName);
      const user: User = { id: res.user_id, email: res.email, full_name: res.full_name, is_active: true };
      set({ user, token: res.access_token, isGuest: false, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  loginAsGuest: () => {
    set({ user: null, token: null, isGuest: true, isLoading: false });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isGuest: true, isLoading: false });
  }
}));
