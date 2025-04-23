export interface User {
  id: string;
  email: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url?: string;
  created_at: string;
  created_by: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price?: number;
  image_url?: string;
  created_at: string;
  created_by: string;
  avg_rating?: number;
}

export interface Review {
  id: string;
  dish_id: string;
  user_id: string;
  rating: number;
  notes?: string;
  created_at: string;
}