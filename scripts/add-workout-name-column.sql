-- Migration: Add name column to workouts table
-- Date: 2026-01-13
-- Description: Adds a required 'name' column to the workouts table to allow users to name their workouts

-- Add the name column (nullable first to allow existing records)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing workouts with a default name based on their date
UPDATE workouts
SET name = 'Workout - ' || TO_CHAR(date::date, 'Month DD, YYYY')
WHERE name IS NULL;

-- Make the name column NOT NULL after populating existing records
ALTER TABLE workouts ALTER COLUMN name SET NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN workouts.name IS 'User-defined name for the workout';
