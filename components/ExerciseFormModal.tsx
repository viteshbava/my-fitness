'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, CreateExerciseInput, UpdateExerciseInput } from '@/types/database';
import { createExercise, updateExercise } from '@/actions/exercises';
import {
  getUniqueMovementTypes,
  getUniquePatterns,
  getUniquePrimaryBodyParts,
  getUniqueSecondaryBodyParts,
  getUniqueEquipment,
} from '@/lib/controllers/exercise-controller';
import Button from '@/components/Button';
import ModalOverlay from '@/components/ModalOverlay';
import { useToast } from '@/components/ToastProvider';

interface ExerciseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exercise: Exercise) => void;
  mode: 'create' | 'edit';
  exercise?: Exercise;
  existingExercises: Exercise[];
}

interface FormData {
  name: string;
  video_url: string;
  movement_type: string;
  pattern: string;
  primary_body_part: string;
  secondary_body_part: string;
  equipment: string;
  notes: string;
  is_mastered: boolean;
}

interface FormErrors {
  name?: string;
  video_url?: string;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  exercise,
  existingExercises,
}) => {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    video_url: '',
    movement_type: '',
    pattern: '',
    primary_body_part: '',
    secondary_body_part: '',
    equipment: '',
    notes: '',
    is_mastered: false,
  });

  // Get unique values for dropdowns
  const movementTypes = getUniqueMovementTypes(existingExercises);
  const patterns = getUniquePatterns(existingExercises);
  const primaryBodyParts = getUniquePrimaryBodyParts(existingExercises);
  const secondaryBodyParts = getUniqueSecondaryBodyParts(existingExercises);
  const equipmentOptions = getUniqueEquipment(existingExercises);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && exercise) {
        setFormData({
          name: exercise.name || '',
          video_url: exercise.video_url || '',
          movement_type: exercise.movement_type || '',
          pattern: exercise.pattern || '',
          primary_body_part: exercise.primary_body_part || '',
          secondary_body_part: exercise.secondary_body_part || '',
          equipment: exercise.equipment || '',
          notes: exercise.notes || '',
          is_mastered: exercise.is_mastered || false,
        });
      } else {
        setFormData({
          name: '',
          video_url: '',
          movement_type: '',
          pattern: '',
          primary_body_part: '',
          secondary_body_part: '',
          equipment: '',
          notes: '',
          is_mastered: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, exercise]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Exercise name is required';
    } else {
      // Check for duplicate names (excluding current exercise in edit mode)
      const isDuplicate = existingExercises.some(
        (e) =>
          e.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (mode === 'create' || e.id !== exercise?.id)
      );
      if (isDuplicate) {
        newErrors.name = 'An exercise with this name already exists';
      }
    }

    // Validate URL format if provided
    if (formData.video_url.trim()) {
      try {
        new URL(formData.video_url.trim());
      } catch {
        newErrors.video_url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    if (mode === 'create') {
      const input: CreateExerciseInput = {
        name: formData.name.trim(),
        video_url: formData.video_url.trim() || null,
        movement_type: formData.movement_type || undefined,
        pattern: formData.pattern || undefined,
        primary_body_part: formData.primary_body_part || undefined,
        secondary_body_part: formData.secondary_body_part || undefined,
        equipment: formData.equipment || undefined,
        notes: formData.notes.trim() || null,
        is_mastered: formData.is_mastered,
      };

      const { data, error } = await createExercise(input);

      if (error) {
        showToast(`Failed to create exercise: ${error}`, 'error');
        setSaving(false);
        return;
      }

      if (data) {
        showToast('Exercise created successfully', 'success');
        onSuccess(data);
        onClose();
      }
    } else if (mode === 'edit' && exercise) {
      const input: UpdateExerciseInput = {
        name: formData.name.trim(),
        video_url: formData.video_url.trim() || null,
        movement_type: formData.movement_type,
        pattern: formData.pattern,
        primary_body_part: formData.primary_body_part,
        secondary_body_part: formData.secondary_body_part,
        equipment: formData.equipment,
        notes: formData.notes.trim() || null,
        is_mastered: formData.is_mastered,
      };

      const { data, error } = await updateExercise(exercise.id, input);

      if (error) {
        showToast(`Failed to update exercise: ${error}`, 'error');
        setSaving(false);
        return;
      }

      if (data) {
        showToast('Exercise updated successfully', 'success');
        onSuccess(data);
        onClose();
      }
    }

    setSaving(false);
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} preventBackgroundClick={saving}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            {mode === 'create' ? 'Create New Exercise' : 'Edit Exercise'}
          </h3>
        </div>

        {/* Form Content - Scrollable */}
        <div className='p-6 overflow-y-auto flex-1'>
          <div className='space-y-4'>
            {/* Name Field (Required) */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={saving}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.name
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='Enter exercise name'
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name}</p>
              )}
            </div>

            {/* Video URL Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Video URL
              </label>
              <input
                type='text'
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                disabled={saving}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.video_url
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder='https://...'
              />
              {errors.video_url && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.video_url}</p>
              )}
            </div>

            {/* Movement Type Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Movement Type
              </label>
              <select
                value={formData.movement_type}
                onChange={(e) => handleInputChange('movement_type', e.target.value)}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Select movement type</option>
                {movementTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Pattern Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Pattern
              </label>
              <select
                value={formData.pattern}
                onChange={(e) => handleInputChange('pattern', e.target.value)}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Select pattern</option>
                {patterns.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Body Part Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Primary Body Part
              </label>
              <select
                value={formData.primary_body_part}
                onChange={(e) => handleInputChange('primary_body_part', e.target.value)}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Select primary body part</option>
                {primaryBodyParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Body Part Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Secondary Body Part
              </label>
              <select
                value={formData.secondary_body_part}
                onChange={(e) => handleInputChange('secondary_body_part', e.target.value)}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Select secondary body part</option>
                {secondaryBodyParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Equipment
              </label>
              <select
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Select equipment</option>
                {equipmentOptions.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Experience Level
              </label>
              <select
                value={formData.is_mastered ? 'true' : 'false'}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_mastered: e.target.value === 'true' }))}
                disabled={saving}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value='false'>Not Learnt</option>
                <option value='true'>Learnt</option>
              </select>
            </div>

            {/* Notes Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={saving}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                placeholder='Equipment settings, form cues, etc.'
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600'>
          <Button onClick={handleClose} variant='ghost' disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='primary' disabled={saving}>
            {saving
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
              ? 'Create Exercise'
              : 'Save Changes'}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ExerciseFormModal;
