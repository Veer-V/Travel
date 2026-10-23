import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For local web/android emulator/physical device
// If web or emulator, localhost:8000. Can be overridden with EXPO_PUBLIC_API_URL
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://127.0.0.1:8000/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to inject JWT bearer token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token = null;
      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync('user_token');
      } else if (typeof window !== 'undefined' && window.localStorage) {
        token = window.localStorage.getItem('user_token');
      }
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Could not read auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.detail || error.message || 'Network request failed';
    console.error('API Error:', errorMsg);
    return Promise.reject(new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)));
  }
);
