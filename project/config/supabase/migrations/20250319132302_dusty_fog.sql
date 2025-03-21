/*
  # Update Profiles Schema
  
  1. Changes
    - Create profiles table if it doesn't exist
    - Add cover_url column
    - Add necessary constraints and policies
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  title text,
  location text,
  email text,
  website text,
  image_url text,
  cover_url text,
  bio text,
  type text CHECK (type IN ('engineer', 'recruiter')),
  github_username text,
  twitter_username text,
  interests text[],
  skills text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;