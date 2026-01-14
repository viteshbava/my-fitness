import React from 'react';
import ModalOverlay from './ModalOverlay';
import Button from './Button';

interface SaveProgressModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onBackToWorkout: () => void;
  onNextExercise?: () => void;
}

const SaveProgressModal: React.FC<SaveProgressModalProps> = ({
  isOpen,
  isSaving,
  onBackToWorkout,
  onNextExercise,
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={() => {}}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4'>
        <div className='p-6'>
          {isSaving ? (
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Saving Exercise...
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Please wait while we save your progress
              </p>
            </div>
          ) : (
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4'>
                <svg
                  className='h-6 w-6 text-green-600 dark:text-green-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Exercise Saved!
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
                Your changes have been saved successfully
              </p>
              <div className='flex flex-col gap-3'>
                {onNextExercise && (
                  <Button onClick={onNextExercise} variant='primary' fullWidth>
                    Next Exercise
                  </Button>
                )}
                <Button onClick={onBackToWorkout} variant='secondary' fullWidth>
                  Back to Workout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};

export default SaveProgressModal;
