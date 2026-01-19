'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import { updateExerciseNotes } from '@/actions/exercises';
import { useToast } from '@/components/ToastProvider';

interface ExerciseNotesEditorProps {
  exerciseId: string;
  exerciseName?: string;
  initialNotes: string;
  onNotesUpdated?: (notes: string) => void;
  showAlert: (title: string, message: string, type: 'error' | 'warning' | 'info' | 'success') => void;
}

const ExerciseNotesEditor: React.FC<ExerciseNotesEditorProps> = ({
  exerciseId,
  exerciseName,
  initialNotes,
  onNotesUpdated,
  showAlert,
}) => {
  const { showToast } = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateExerciseNotes(exerciseId, notes);

    if (error) {
      showAlert('Error Saving', error, 'error');
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setIsEditing(false);
    showToast('Notes saved successfully', 'success');
    onNotesUpdated?.(notes);
  };

  const handleCancel = () => {
    setNotes(initialNotes);
    setIsEditing(false);
  };

  const title = exerciseName ? `Notes - ${exerciseName}` : 'Notes';

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant='text' size='sm'>
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
            placeholder='Add notes about equipment settings, technique tips, etc.'
          />
          <div className='flex items-center justify-end space-x-3 mt-4'>
            <Button onClick={handleCancel} disabled={isSaving} variant='ghost' size='sm'>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} variant='primary' size='sm'>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div className='text-gray-900 dark:text-white whitespace-pre-wrap'>
          {notes || <p className='text-gray-500 dark:text-gray-400 italic'>No notes yet</p>}
        </div>
      )}
    </div>
  );
};

export default ExerciseNotesEditor;
