-- Create exercises table
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)

CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  video_url TEXT,
  movement_type TEXT NOT NULL,
  pattern TEXT NOT NULL,
  primary_body_part TEXT NOT NULL,
  secondary_body_part TEXT,
  equipment TEXT NOT NULL,
  is_mastered BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  last_used_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
CREATE INDEX IF NOT EXISTS idx_exercises_primary_body_part ON exercises(primary_body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_movement_type ON exercises(movement_type);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_last_used_date ON exercises(last_used_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
