'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addExerciseToWorkout } from '@/actions/workout-exercises';
import { Exercise } from '@/types/database';
import { useToast } from '@/components/ToastProvider';
import AddExerciseView from '@/components/AddExerciseView';

const AddExercisePage = () => {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  const { showToast } = useToast();

  const handleAddExercise = async (exercise: Exercise) => {
    const { data, error } = await addExerciseToWorkout(workoutId, exercise.id);

    if (error) {
      throw new Error(error);
    }

    if (data) {
      showToast(`${exercise.name} added to workout`, 'success');
      router.push(`/workouts/${workoutId}`);
    }
  };

  return (
    <AddExerciseView
      title="Add Exercise to Workout"
      subtitle="Select an exercise to add to your workout. You can add the same exercise multiple times."
      backButtonLabel="Back to Workout"
      backButtonHref={`/workouts/${workoutId}`}
      onAddExercise={handleAddExercise}
    />
  );
};

export default AddExercisePage;
