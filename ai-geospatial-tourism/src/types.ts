export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Destination {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  best_months: string;
  image_url: string;
  distance?: number;
}

export interface HistoryItem {
  id: number;
  user_id: number;
  month: string;
  interest: string;
  destination_name: string;
  timestamp: string;
}

export interface Accommodation {
  id: number;
  destination_id: number;
  name: string;
  type: string;
  price_range: string;
  distance: number;
  image_url: string;
  booking_link: string;
}

export interface TravelInsights {
  duration: string;
  activities: string[];
  tips: string[];
}

export interface ItineraryItem {
  day: number;
  plan: string;
}
