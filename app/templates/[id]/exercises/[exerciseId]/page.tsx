'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchWorkoutTemplateById } from '@/actions/workout-templates';
import ExerciseDetailView from '@/components/ExerciseDetailView';
import { BreadcrumbItem } from '@/components/Breadcrumb';

const TemplateExerciseDetailPage = () => {
  const params = useParams();
  const exerciseId = params.exerciseId as string;
  const templateId = params.id as string;

  const [templateName, setTemplateName] = useState<string>('');

  useEffect(() => {
    loadTemplateName();
  }, [templateId]);

  const loadTemplateName = async () => {
    const { data } = await fetchWorkoutTemplateById(templateId);
    if (data) {
      setTemplateName(data.name);
    }
  };

  // Breadcrumb items for template path
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Templates', href: '/templates' },
    { label: templateName || 'Template', href: `/templates/${templateId}` },
    { label: 'Exercise' },
  ];

  return <ExerciseDetailView exerciseId={exerciseId} breadcrumbItems={breadcrumbItems} />;
};

export default TemplateExerciseDetailPage;
