import React from 'react';
import ModalOverlay from './ModalOverlay';

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
    <ModalOverlay isOpen={isOpen} onClose={onCancel} preventBackgroundClick={true}>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
          <p className='text-sm text-gray-600'>{message}</p>
        </div>
        <div className='p-4 flex justify-end gap-3 bg-gray-50 rounded-b-lg'>
          <button
            onClick={onCancel}
            className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors cursor-pointer ${
              isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {confirmText}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default ConfirmationModal;
