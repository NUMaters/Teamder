/*
  # Add Matches Table

  1. New Tables
    - `matches` table
      - Records matches between users or between users and projects
      - Tracks match status and timestamps
      - References both profiles and projects

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add policies for matched users

  3. Changes
    - Add table for tracking matches
    - Add necessary constraints and policies
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Ensure either user2_id or project_id is set, but not both
  CONSTRAINT user_or_project CHECK (
    (user2_id IS NOT NULL AND project_id IS NULL) OR
    (user2_id IS NULL AND project_id IS NOT NULL)
  ),
  -- Prevent duplicate matches
  CONSTRAINT unique_match UNIQUE (user1_id, user2_id, project_id)
);

-- Create updated_at trigger
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    auth.uid() IN (user1_id, user2_id) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    auth.uid() = user1_id
  );

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  USING (
    auth.uid() IN (user1_id, user2_id) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
      AND owner_id = auth.uid()
    )
  );

-- Create function to automatically create matches when both users like each other
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS trigger AS $$
BEGIN
  -- Check for mutual likes between users
  IF NEW.target_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM swipe_actions
      WHERE user_id = NEW.target_id
      AND target_id = NEW.user_id
      AND action IN ('like', 'superlike')
      AND created_at > NOW() - INTERVAL '30 days'
    ) THEN
      -- Create a match
      INSERT INTO matches (user1_id, user2_id)
      VALUES (NEW.user_id, NEW.target_id)
      ON CONFLICT (user1_id, user2_id, project_id) DO NOTHING;
    END IF;
  -- Check for mutual likes between user and project
  ELSIF NEW.project_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM swipe_actions sa
      JOIN projects p ON p.id = sa.project_id
      WHERE p.id = NEW.project_id
      AND sa.user_id = p.owner_id
      AND sa.target_id = NEW.user_id
      AND sa.action IN ('like', 'superlike')
      AND sa.created_at > NOW() - INTERVAL '30 days'
    ) THEN
      -- Create a match
      INSERT INTO matches (user1_id, project_id)
      VALUES (NEW.user_id, NEW.project_id)
      ON CONFLICT (user1_id, user2_id, project_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic match creation
CREATE TRIGGER create_match_after_like
  AFTER INSERT ON swipe_actions
  FOR EACH ROW
  WHEN (NEW.action IN ('like', 'superlike'))
  EXECUTE FUNCTION create_match_on_mutual_like();