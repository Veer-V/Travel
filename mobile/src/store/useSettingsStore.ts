import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  themeMode: 'light' | 'dark' | 'system';
  currency: 'INR' | 'USD' | 'EUR';
  distanceUnit: 'km' | 'miles';
  defaultTravelStyle: string;
  defaultDietary: string;
  accessibilityNeeds: string;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setCurrency: (curr: 'INR' | 'USD' | 'EUR') => void;
  setPreferences: (prefs: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'light',
  currency: 'INR',
  distanceUnit: 'km',
  defaultTravelStyle: 'cultural',
  defaultDietary: 'standard',
  accessibilityNeeds: 'none',

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    AsyncStorage.setItem('pref_theme', mode);
  },

  setCurrency: (curr) => {
    set({ currency: curr });
    AsyncStorage.setItem('pref_currency', curr);
  },

  setPreferences: (prefs) => set((state) => ({ ...state, ...prefs }))
}));
