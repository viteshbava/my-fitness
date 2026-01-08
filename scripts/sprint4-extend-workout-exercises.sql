-- Sprint 4: Extend workout_exercises table with sets and draft_snapshot
-- This script should be run in the Supabase SQL Editor

-- Add sets column (jsonb array) to store set data
ALTER TABLE workout_exercises
ADD COLUMN IF NOT EXISTS sets JSONB DEFAULT '[]'::jsonb;

-- Add draft_snapshot column (jsonb) for Cancel functionality in "in progress" mode
ALTER TABLE workout_exercises
ADD COLUMN IF NOT EXISTS draft_snapshot JSONB;

-- Add comment to explain the structure
COMMENT ON COLUMN workout_exercises.sets IS 'Array of sets: [{ set_number: 1, weight: 100, reps: 10 }, ...]';
COMMENT ON COLUMN workout_exercises.draft_snapshot IS 'Snapshot of sets data when entering "in progress" mode, for Cancel functionality';
