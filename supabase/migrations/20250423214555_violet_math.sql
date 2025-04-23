/*
  # Initial Database Schema

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `address` (text, not null)
      - `image_url` (text)
      - `created_at` (timestamp with time zone, default now())
      - `created_by` (uuid, foreign key to auth.users)

    - `dishes`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `name` (text, not null)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `created_at` (timestamp with time zone, default now())
      - `created_by` (uuid, foreign key to auth.users)

    - `reviews`
      - `id` (uuid, primary key)
      - `dish_id` (uuid, foreign key to dishes)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, not null, between 1 and 10)
      - `notes` (text)
      - `created_at` (timestamp with time zone, default now())

    - `users` (view of auth.users)
      - `id` (uuid, primary key)
      - `email` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create storage bucket for images
*/

-- Create a secure schema for our tables
CREATE SCHEMA IF NOT EXISTS public;

-- RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- DISHES TABLE
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a view to expose user emails (needed for showing who wrote reviews)
CREATE OR REPLACE VIEW users AS
  SELECT id, email
  FROM auth.users;

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for RESTAURANTS
-- Anyone can read restaurants
CREATE POLICY "Anyone can view restaurants" 
  ON restaurants FOR SELECT USING (true);

-- Only authenticated users can insert restaurants
CREATE POLICY "Authenticated users can insert restaurants" 
  ON restaurants FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Only restaurant creator can update or delete
CREATE POLICY "Users can update their own restaurants" 
  ON restaurants FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own restaurants" 
  ON restaurants FOR DELETE TO authenticated 
  USING (auth.uid() = created_by);

-- RLS Policies for DISHES
-- Anyone can read dishes
CREATE POLICY "Anyone can view dishes" 
  ON dishes FOR SELECT USING (true);

-- Only authenticated users can insert dishes
CREATE POLICY "Authenticated users can insert dishes" 
  ON dishes FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Only dish creator can update or delete
CREATE POLICY "Users can update their own dishes" 
  ON dishes FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own dishes" 
  ON dishes FOR DELETE TO authenticated 
  USING (auth.uid() = created_by);

-- RLS Policies for REVIEWS
-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" 
  ON reviews FOR SELECT USING (true);

-- Only authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews" 
  ON reviews FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Only review creator can update or delete
CREATE POLICY "Users can update their own reviews" 
  ON reviews FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON reviews FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name) 
VALUES ('images', 'images') 
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Images are publicly accessible" 
  ON storage.objects FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update their own images" 
  ON storage.objects FOR UPDATE TO authenticated 
  USING (bucket_id = 'images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own images" 
  ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'images' AND auth.uid() = owner);