/**
 * Database Type Definitions
 *
 * TypeScript types for all database tables and related structures.
 * These types should match the Supabase database schema.
 */

// Exercise table
export interface Exercise {
  id: string;
  name: string;
  video_url: string | null;
  movement_type: string;
  pattern: string;
  primary_body_part: string;
  secondary_body_part: string;
  equipment: string;
  is_mastered: boolean;
  notes: string | null;
  last_used_date: string | null;
  created_at: string;
  updated_at: string;
}

// Workout table
export interface Workout {
  id: string;
  name: string;
  date: string;
  created_at: string;
  updated_at: string;
}

// Set structure (stored as JSONB in workout_exercises.sets)
export interface Set {
  set_number: number;
  weight: number | null;
  reps: number | null;
}

// Workout Exercise table
export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: Set[];
  draft_snapshot: Set[] | null;
  created_at: string;
  updated_at: string;
}

// Extended types for joined data
export interface WorkoutExerciseWithExercise extends WorkoutExercise {
  exercise: Exercise;
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises: WorkoutExerciseWithExercise[];
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiSuccessResponse {
  success: boolean;
  error: string | null;
}
