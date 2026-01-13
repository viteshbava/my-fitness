import React from 'react';
import ModalOverlay from './ModalOverlay';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onCancel}>
      <div className='bg-white rounded-lg shadow-xl max-w-lg w-full mx-4'>
        <div className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
          <p className='text-sm text-gray-600'>{message}</p>
        </div>
        <div className='p-4 flex justify-end gap-3 bg-gray-50 rounded-b-lg'>
          <Button onClick={onCancel} variant='ghost'>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant={isDangerous ? 'danger' : 'primary'}>
            {confirmText}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
