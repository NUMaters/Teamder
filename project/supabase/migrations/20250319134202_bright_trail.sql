/*
  # Chat System Schema

  1. New Tables
    - `chat_rooms`
      - `id` (uuid, primary key)
      - `match_id` (uuid) - References matches.id
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_message` (text)
      - `last_message_at` (timestamptz)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid) - References chat_rooms.id
      - `sender_id` (uuid) - References profiles.id
      - `content` (text)
      - `created_at` (timestamptz)
      - `read_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for chat participants
    - Add trigger for updating chat room's last message
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message text,
  last_message_at timestamptz
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms
DO $$ BEGIN
  CREATE POLICY "Chat participants can view their rooms"
    ON chat_rooms FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = chat_rooms.match_id
        AND (
          auth.uid() IN (m.user1_id, m.user2_id) OR
          EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = m.project_id
            AND p.owner_id = auth.uid()
          )
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create policies for chat_messages
DO $$ BEGIN
  CREATE POLICY "Chat participants can view messages"
    ON chat_messages FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM chat_rooms cr
        JOIN matches m ON m.id = cr.match_id
        WHERE cr.id = chat_messages.room_id
        AND (
          auth.uid() IN (m.user1_id, m.user2_id) OR
          EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = m.project_id
            AND p.owner_id = auth.uid()
          )
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Chat participants can insert messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM chat_rooms cr
        JOIN matches m ON m.id = cr.match_id
        WHERE cr.id = room_id
        AND (
          auth.uid() IN (m.user1_id, m.user2_id) OR
          EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = m.project_id
            AND p.owner_id = auth.uid()
          )
        )
      )
      AND auth.uid() = sender_id
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to update chat room's last message
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS trigger AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating chat room's last message
DO $$ BEGIN
  CREATE TRIGGER update_chat_room_last_message_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_message();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to create chat room when match is created
CREATE OR REPLACE FUNCTION create_chat_room_for_match()
RETURNS trigger AS $$
BEGIN
  INSERT INTO chat_rooms (match_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for creating chat room
DO $$ BEGIN
  CREATE TRIGGER create_chat_room_after_match
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_room_for_match();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(room_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE chat_messages
  SET read_at = now()
  WHERE room_id = room_uuid
  AND sender_id != auth.uid()
  AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;