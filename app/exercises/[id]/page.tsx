'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExerciseDetailView from '@/components/ExerciseDetailView';
import { BreadcrumbItem } from '@/components/Breadcrumb';

const ExerciseDetailPage = () => {
  const params = useParams();
  const exerciseId = params.id as string;

  // Breadcrumb items for exercise library path
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Exercises', href: '/exercises' },
    { label: 'Exercise' },
  ];

  return (
    <ExerciseDetailView
      exerciseId={exerciseId}
      breadcrumbItems={breadcrumbItems}
      showAddToTemplate={true}
    />
  );
};

export default ExerciseDetailPage;
