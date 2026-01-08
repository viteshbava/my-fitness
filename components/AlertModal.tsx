import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'info' | 'error' | 'warning' | 'success';
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  type = 'info',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-900';
      case 'success':
        return 'bg-green-50 border-green-500 text-green-900';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-900';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className={`border-l-4 ${getTypeStyles()} p-6 rounded-t-lg`}>
          <h3 className='text-lg font-semibold mb-2'>{title}</h3>
          <p className='text-sm'>{message}</p>
        </div>
        <div className='p-4 flex justify-end'>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-white rounded-md ${getButtonStyles()} transition-colors cursor-pointer`}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
