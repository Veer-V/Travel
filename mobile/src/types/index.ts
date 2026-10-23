export interface Destination {
  id: number;
  name: string;
  state_or_region: string;
  country: string;
  latitude: number;
  longitude: number;
  destination_type: 'heritage' | 'beach' | 'hill_station' | 'wildlife' | 'spiritual' | 'urban';
  description: string;
  best_time_to_visit?: string;
  climate?: string;
  source: string;
}

export interface Attraction {
  id: number;
  attraction_id?: number;
  destination_id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  estimated_visit_duration: number; // minutes
  admission_price: number;
  opening_hours: string;
  rating: number;
  accessibility_features: string;
  description: string;
  tags?: string;
  relevance_score?: number;
  explanation?: string[];
  source: string;
}

export interface Restaurant {
  id: number;
  destination_id: number;
  name: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  price_level: 'budget' | 'moderate' | 'fine_dining';
  dietary_options: string;
  rating: number;
  opening_hours: string;
  source: string;
}

export interface Accommodation {
  id: number;
  destination_id: number;
  name: string;
  accommodation_type: 'hotel' | 'hostel' | 'resort' | 'homestay' | 'guesthouse';
  latitude: number;
  longitude: number;
  price_per_night: number;
  amenities: string;
  rating: number;
  booking_url?: string;
  source: string;
}

export interface ItineraryItem {
  id: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  start_time: string;
  end_time: string;
  activity_name: string;
  activity_type: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  travel_mode: string;
  travel_duration_minutes: number;
  visit_duration_minutes: number;
  estimated_cost: number;
  booking_required: boolean;
  data_source: string;
  order_index: number;
}

export interface ItineraryDay {
  id: string;
  day_number: number;
  date: string;
  daily_expense_estimate: number;
  notes?: string;
  items: ItineraryItem[];
}

export interface BudgetBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  notes?: string;
}

export interface BudgetEstimate {
  total_estimated_budget: number;
  cost_per_person: number;
  currency: string;
  low_range: number;
  high_range: number;
  breakdown: BudgetBreakdownItem[];
  disclaimer: string;
}

export interface SafetyAssessment {
  overall_risk_category: 'Lower observed risk' | 'Moderate observed risk' | 'Elevated observed risk' | 'High observed risk' | 'Active official warning' | 'Insufficient data';
  crime_risk_indicator: string;
  environmental_hazard_indicator: string;
  transport_risk_indicator: string;
  official_advisory_status: string;
  data_quality: string;
  confidence_level: string;
  explanation: string[];
  precautions: string[];
  emergency_contacts: Record<string, string>;
  source_provenance?: string;
  disclaimer: string;
}

export interface Trip {
  id: string;
  user_id?: string;
  destination_id: number;
  destination_name: string;
  title: string;
  origin: string;
  start_date: string;
  end_date: string;
  total_days: number;
  num_travelers: number;
  total_budget: number;
  currency: string;
  travel_style: string;
  transport_preference: string;
  accommodation_preference: string;
  food_preference: string;
  accessibility_requirements: string;
  safety_notes?: string;
  status: string;
  created_at?: string;
  itineraries: ItineraryDay[];
  expenses?: any[];
  budget_breakdown?: BudgetEstimate;
  safety_assessment?: SafetyAssessment;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name?: string;
}
