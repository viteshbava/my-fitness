-- Populate last_performed_sets for all exercises based on their most recent workout
-- Run this AFTER adding the last_performed_sets column

-- Update each exercise with sets from its most recent workout
UPDATE exercises e
SET last_performed_sets = (
  SELECT we.sets
  FROM workout_exercises we
  JOIN workouts w ON we.workout_id = w.id
  WHERE we.exercise_id = e.id
  ORDER BY w.date DESC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1
  FROM workout_exercises we
  WHERE we.exercise_id = e.id
);

-- Verify the update
SELECT
  e.name,
  e.last_performed_sets,
  (SELECT w.date
   FROM workout_exercises we
   JOIN workouts w ON we.workout_id = w.id
   WHERE we.exercise_id = e.id
   ORDER BY w.date DESC
   LIMIT 1) as latest_workout_date
FROM exercises e
WHERE e.last_performed_sets IS NOT NULL
ORDER BY e.name;
