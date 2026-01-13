import React from 'react';
import ModalOverlay from './ModalOverlay';
import Button from './Button';

interface RenameWorkoutModalProps {
  isOpen: boolean;
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const RenameWorkoutModal: React.FC<RenameWorkoutModalProps> = ({
  isOpen,
  workoutName,
  onWorkoutNameChange,
  onSave,
  onCancel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave();
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onCancel}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
          Rename Workout
        </h2>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Workout Name
          </label>
          <input
            type='text'
            value={workoutName || ''}
            onChange={(e) => onWorkoutNameChange(e.target.value)}
            placeholder='Enter workout name'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className='flex flex-col space-y-2'>
          <Button onClick={onSave} variant='primary' fullWidth>
            Save
          </Button>
          <Button onClick={onCancel} variant='secondary' fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default RenameWorkoutModal;
