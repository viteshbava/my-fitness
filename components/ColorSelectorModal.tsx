import React from 'react';
import ModalOverlay from './ModalOverlay';
import ColorSelector from './ColorSelector';

interface ColorSelectorModalProps {
  isOpen: boolean;
  selectedColorId: string;
  onColorChange: (colorId: string) => void;
  onClose: () => void;
}

const ColorSelectorModal: React.FC<ColorSelectorModalProps> = ({
  isOpen,
  selectedColorId,
  onColorChange,
  onClose,
}) => {
  const handleColorChange = (colorId: string) => {
    onColorChange(colorId);
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Change Workout Color
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors'
              aria-label='Close'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <ColorSelector selectedColorId={selectedColorId} onColorChange={handleColorChange} />
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ColorSelectorModal;
