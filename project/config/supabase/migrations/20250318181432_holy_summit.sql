/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `name` (text) - User's full name
      - `title` (text) - Professional title or student status
      - `location` (text) - User's location
      - `email` (text) - User's email
      - `website` (text) - User's website
      - `image_url` (text) - Profile image URL
      - `bio` (text) - User's bio
      - `type` (text) - 'engineer' or 'recruiter'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `owner_id` (uuid) - References profiles.id
      - `title` (text)
      - `company` (text)
      - `image_url` (text)
      - `location` (text)
      - `description` (text)
      - `team_size` (text)
      - `duration` (text)
      - `budget` (text)
      - `type` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `skills`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamptz)

    - `profile_skills`
      - `profile_id` (uuid) - References profiles.id
      - `skill_id` (uuid) - References skills.id
      - `level` (text)
      - `years` (text)
      - Primary key (profile_id, skill_id)

    - `project_skills`
      - `project_id` (uuid) - References projects.id
      - `skill_id` (uuid) - References skills.id
      - Primary key (project_id, skill_id)

    - `likes`
      - `id` (uuid, primary key)
      - `sender_id` (uuid) - References profiles.id
      - `receiver_id` (uuid) - References profiles.id
      - `project_id` (uuid, nullable) - References projects.id
      - `type` (text) - 'like' or 'superlike'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for profile owners
    - Add policies for project owners

  3. Functions and Triggers
    - Create trigger to update updated_at timestamp
    - Create function to handle profile creation on auth.user creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  title text,
  location text,
  email text,
  website text,
  image_url text,
  bio text,
  type text CHECK (type IN ('engineer', 'recruiter')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  company text,
  image_url text,
  location text,
  description text,
  team_size text,
  duration text,
  budget text,
  type text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create profile_skills table
CREATE TABLE IF NOT EXISTS profile_skills (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  level text CHECK (level IN ('初級', '中級', '上級')),
  years text,
  PRIMARY KEY (profile_id, skill_id)
);

-- Create project_skills table
CREATE TABLE IF NOT EXISTS project_skills (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text CHECK (type IN ('like', 'superlike')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for projects
CREATE POLICY "Projects are viewable by everyone"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Project owners can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Create policies for skills
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert skills"
  ON skills FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for profile_skills
CREATE POLICY "Profile skills are viewable by everyone"
  ON profile_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own profile skills"
  ON profile_skills FOR ALL
  USING (auth.uid() = profile_id);

-- Create policies for project_skills
CREATE POLICY "Project skills are viewable by everyone"
  ON project_skills FOR SELECT
  USING (true);

CREATE POLICY "Project owners can manage project skills"
  ON project_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

-- Create policies for likes
CREATE POLICY "Likes are viewable by involved users"
  ON likes FOR SELECT
  USING (
    auth.uid() IN (sender_id, receiver_id) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = sender_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert initial skills
INSERT INTO skills (name) VALUES
  ('JavaScript'),
  ('TypeScript'),
  ('Python'),
  ('Java'),
  ('Go'),
  ('Rust'),
  ('React'),
  ('Vue.js'),
  ('Angular'),
  ('Node.js'),
  ('Django'),
  ('Flask'),
  ('Docker'),
  ('Kubernetes'),
  ('AWS'),
  ('GCP'),
  ('Azure'),
  ('Machine Learning'),
  ('Deep Learning'),
  ('Natural Language Processing')
ON CONFLICT (name) DO NOTHING;