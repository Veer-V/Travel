import { apiClient } from './api';
import { Destination, Attraction, Restaurant, Accommodation, Trip, BudgetEstimate, SafetyAssessment } from '../types';

export const tripService = {
  // Destinations
  async getDestinations(type?: string, state?: string, limit = 50): Promise<Destination[]> {
    const params: any = { limit };
    if (type) params.destination_type = type;
    if (state) params.state = state;
    const res = await apiClient.get<Destination[]>('/destinations', { params });
    return res.data;
  },

  async searchDestinations(query: string): Promise<Destination[]> {
    const res = await apiClient.get<Destination[]>('/destinations/search', { params: { q: query } });
    return res.data;
  },

  async getDestinationById(id: number): Promise<Destination> {
    const res = await apiClient.get<Destination>(`/destinations/${id}`);
    return res.data;
  },

  // Attractions
  async getAttractions(destinationId: number): Promise<Attraction[]> {
    const res = await apiClient.get<Attraction[]>('/attractions', { params: { destination_id: destinationId } });
    return res.data;
  },

  // Dining & Lodging
  async getRestaurants(destinationId: number): Promise<Restaurant[]> {
    const res = await apiClient.get<Restaurant[]>('/restaurants', { params: { destination_id: destinationId } });
    return res.data;
  },

  async getAccommodations(destinationId: number): Promise<Accommodation[]> {
    const res = await apiClient.get<Accommodation[]>('/accommodations', { params: { destination_id: destinationId } });
    return res.data;
  },

  // Planning & Trips
  async planTrip(payload: {
    origin: string;
    destination_id: number;
    start_date: string;
    end_date: string;
    num_travelers: number;
    total_budget: number;
    currency?: string;
    travel_style: string;
    transport_preference: string;
    accommodation_preference: string;
    food_preference?: string;
    accessibility_requirements?: string;
    title?: string;
  }): Promise<Trip> {
    const res = await apiClient.post<Trip>('/trips/plan', payload);
    return res.data;
  },

  async getTrips(): Promise<Trip[]> {
    const res = await apiClient.get<Trip[]>('/trips');
    return res.data;
  },

  async getTripById(id: string): Promise<Trip> {
    const res = await apiClient.get<Trip>(`/trips/${id}`);
    return res.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  // Safety & Budget
  async getSafetyAssessment(destinationId: number): Promise<SafetyAssessment> {
    const res = await apiClient.get<SafetyAssessment>(`/safety/location/${destinationId}`);
    return res.data;
  },

  async getBudgetEstimate(params: {
    origin: string;
    destination_id: number;
    num_days: number;
    num_travelers: number;
    transport_mode?: string;
    accommodation_tier?: string;
    meal_tier?: string;
  }): Promise<BudgetEstimate> {
    const res = await apiClient.post<BudgetEstimate>('/budget/estimate', params);
    return res.data;
  }
};
