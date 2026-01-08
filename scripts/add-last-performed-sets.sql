-- Add last_performed_sets column to exercises table
-- This stores the most recent set data for an exercise, used as placeholders for new workouts

ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS last_performed_sets JSONB DEFAULT NULL;

COMMENT ON COLUMN exercises.last_performed_sets IS 'Stores the most recent set data (weight/reps) for this exercise from the latest workout by date, used as placeholders when creating new workout exercises';
