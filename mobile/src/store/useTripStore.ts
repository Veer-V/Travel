import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';
import { tripService } from '../services/tripService';

interface TripState {
  currentTrip: Trip | null;
  savedTrips: Trip[];
  favoriteDestinationIds: number[];
  isLoading: boolean;
  isOffline: boolean;
  setCurrentTrip: (trip: Trip | null) => void;
  loadSavedTrips: () => Promise<void>;
  saveTripLocally: (trip: Trip) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  toggleFavoriteDestination: (destinationId: number) => Promise<void>;
}

const STORAGE_KEY_TRIPS = 'smartvoyage_saved_trips';
const STORAGE_KEY_FAVS = 'smartvoyage_fav_destinations';

export const useTripStore = create<TripState>((set, get) => ({
  currentTrip: null,
  savedTrips: [],
  favoriteDestinationIds: [],
  isLoading: false,
  isOffline: false,

  setCurrentTrip: (trip) => set({ currentTrip: trip }),

  loadSavedTrips: async () => {
    set({ isLoading: true });
    try {
      // 1. Try to load from API
      const remoteTrips = await tripService.getTrips();
      set({ savedTrips: remoteTrips, isOffline: false, isLoading: false });
      // Cache locally
      await AsyncStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(remoteTrips));
    } catch (e) {
      // 2. Fall back to local AsyncStorage cache
      try {
        const local = await AsyncStorage.getItem(STORAGE_KEY_TRIPS);
        const cached = local ? JSON.parse(local) : [];
        set({ savedTrips: cached, isOffline: true, isLoading: false });
      } catch (err) {
        set({ savedTrips: [], isLoading: false });
      }
    }

    // Load favorites
    try {
      const favsStr = await AsyncStorage.getItem(STORAGE_KEY_FAVS);
      if (favsStr) {
        set({ favoriteDestinationIds: JSON.parse(favsStr) });
      }
    } catch (err) {}
  },

  saveTripLocally: async (trip) => {
    const current = get().savedTrips;
    const exists = current.some((t) => t.id === trip.id);
    const updated = exists ? current.map((t) => (t.id === trip.id ? trip : t)) : [trip, ...current];
    set({ savedTrips: updated, currentTrip: trip });
    await AsyncStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(updated));
  },

  deleteTrip: async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
    } catch (e) {
      console.warn('Could not delete remotely, removing locally:', e);
    }
    const updated = get().savedTrips.filter((t) => t.id !== tripId);
    set({ savedTrips: updated });
    await AsyncStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(updated));
    if (get().currentTrip?.id === tripId) {
      set({ currentTrip: null });
    }
  },

  toggleFavoriteDestination: async (destId) => {
    const favs = get().favoriteDestinationIds;
    const isFav = favs.includes(destId);
    const updated = isFav ? favs.filter((id) => id !== destId) : [...favs, destId];
    set({ favoriteDestinationIds: updated });
    await AsyncStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(updated));
  }
}));
