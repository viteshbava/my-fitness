/**
 * Workout Controller
 *
 * Business logic for workouts including:
 * - Grouping workouts by date/month
 * - Calculating workout statistics
 * - Determining workout completion status
 * - Filtering workouts by date range
 */

import { Workout } from '@/types/database';

export const groupWorkoutsByMonth = (
  workouts: Workout[]
): Record<string, Workout[]> => {
  return workouts.reduce((groups, workout) => {
    const date = new Date(workout.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(workout);
    return groups;
  }, {} as Record<string, Workout[]>);
};

export const filterWorkoutsByDateRange = (
  workouts: Workout[],
  startDate: Date,
  endDate: Date
): Workout[] => {
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
};

// Add more workout-related business logic functions as needed
