-- Remove last_performed_sets column from exercises table
-- Run this if you previously added the last_performed_sets column

ALTER TABLE exercises
DROP COLUMN IF EXISTS last_performed_sets;
