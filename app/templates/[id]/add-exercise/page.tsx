'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addExerciseToTemplate } from '@/actions/workout-templates';
import { Exercise } from '@/types/database';
import AddExerciseView from '@/components/AddExerciseView';

const AddExerciseToTemplatePage = () => {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const handleAddExercise = async (exercise: Exercise) => {
    const { success, error } = await addExerciseToTemplate(templateId, exercise.id);

    if (error) {
      throw new Error(error);
    }

    if (success) {
      // Navigate back to template detail with a slight delay for visual feedback
      setTimeout(() => {
        router.push(`/templates/${templateId}`);
      }, 300);
    }
  };

  return (
    <AddExerciseView
      title="Add Exercise to Template"
      subtitle="Select an exercise to add to your template. You can add the same exercise multiple times."
      backButtonLabel="Back to Template"
      backButtonHref={`/templates/${templateId}`}
      onAddExercise={handleAddExercise}
    />
  );
};

export default AddExerciseToTemplatePage;
