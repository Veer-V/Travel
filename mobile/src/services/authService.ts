import { apiClient } from './api';
import { AuthResponse, User } from '../types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const authService = {
  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    await this.setToken(res.data.access_token);
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    await this.setToken(res.data.access_token);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('user_token', token);
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('user_token', token);
      }
    } catch (e) {
      console.warn('Failed to save auth token:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync('user_token');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('user_token');
      }
    } catch (e) {
      return null;
    }
    return null;
  },

  async logout(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('user_token');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('user_token');
      }
    } catch (e) {
      console.warn('Failed to clear token:', e);
    }
  }
};
