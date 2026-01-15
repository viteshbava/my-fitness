-- Remove last_used_date column from exercises table
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)

-- Drop the index first
DROP INDEX IF EXISTS idx_exercises_last_used_date;

-- Drop the column
ALTER TABLE exercises DROP COLUMN IF EXISTS last_used_date;
