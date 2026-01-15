'use client';

import React, { useState, useEffect } from 'react';
import { fetchWorkoutTemplates } from '@/actions/workout-templates';
import { addExerciseToTemplate } from '@/actions/workout-templates';
import { WorkoutTemplate } from '@/types/database';
import Button from '@/components/Button';
import ModalOverlay from '@/components/ModalOverlay';
import { useToast } from '@/components/ToastProvider';

interface AddToTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
}

const AddToTemplateModal: React.FC<AddToTemplateModalProps> = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
}) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setSelectedTemplateId(null);
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await fetchWorkoutTemplates();

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setTemplates(data || []);
    setLoading(false);
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (adding) return;

    setSelectedTemplateId(templateId);
    setAdding(true);

    const { success, error } = await addExerciseToTemplate(templateId, exerciseId);

    if (error) {
      showToast(`Failed to add exercise: ${error}`, 'error');
      setAdding(false);
      setSelectedTemplateId(null);
      return;
    }

    if (success) {
      const selectedTemplate = templates.find(t => t.id === templateId);
      showToast(`Exercise added to ${selectedTemplate?.name || 'template'}`, 'success');
      setAdding(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!adding) {
      onClose();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} preventBackgroundClick={adding}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4'>
        {/* Header */}
        <div className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Add to Workout Template
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Add "{exerciseName}" to a workout template
          </p>
        </div>

        {/* Content */}
        <div className='px-6 pb-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-red-600 dark:text-red-400'>{error}</p>
              <Button onClick={loadTemplates} variant='secondary' size='sm' className='mt-4'>
                Retry
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                No workout templates found. Create a template first.
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Select a template:
              </label>
              <div className='max-h-64 overflow-y-auto space-y-2'>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={adding}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      adding && selectedTemplateId === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 opacity-75 cursor-wait'
                        : adding
                        ? 'border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      {adding && selectedTemplateId === template.id ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent shrink-0'></div>
                      ) : (
                        <div
                          className='w-4 h-4 rounded-full shrink-0'
                          style={{
                            backgroundColor:
                              template.color === 'red'
                                ? '#ef4444'
                                : template.color === 'blue'
                                ? '#3b82f6'
                                : template.color === 'green'
                                ? '#10b981'
                                : template.color === 'yellow'
                                ? '#f59e0b'
                                : template.color === 'purple'
                                ? '#a855f7'
                                : '#10b981',
                          }}
                        ></div>
                      )}
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {template.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg'>
          <Button onClick={handleClose} variant='ghost' disabled={adding}>
            Close
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default AddToTemplateModal;
