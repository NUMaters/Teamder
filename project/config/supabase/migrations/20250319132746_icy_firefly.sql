/*
  # Add Projects and Swipe Actions Tables

  1. New Tables
    - `projects` table (if not exists)
      - Basic project information
      - Owner reference to profiles
      - Status and timestamps
    
    - `swipe_actions` table
      - Records user swipe actions
      - References to profiles and projects
      - Action type tracking

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create projects table if it doesn't exist
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

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

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

-- Create swipe_actions table
CREATE TABLE IF NOT EXISTS swipe_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  action text CHECK (action IN ('like', 'superlike', 'skip')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Ensure either target_id or project_id is set, but not both
  CONSTRAINT target_xor_project CHECK (
    (target_id IS NOT NULL AND project_id IS NULL) OR
    (target_id IS NULL AND project_id IS NOT NULL)
  )
);

-- Enable RLS for swipe_actions
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for swipe_actions
CREATE POLICY "Users can insert their own swipe actions"
  ON swipe_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own swipe actions"
  ON swipe_actions FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = target_id OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );