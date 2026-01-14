-- Add color column to workout_templates table
ALTER TABLE workout_templates
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'green';

-- Add color column to workouts table
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'green';

-- Update existing records to have the default green color
UPDATE workout_templates SET color = 'green' WHERE color IS NULL;
UPDATE workouts SET color = 'green' WHERE color IS NULL;
