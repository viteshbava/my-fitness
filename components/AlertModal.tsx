import React from 'react';
import ModalOverlay from './ModalOverlay';
import Button from './Button';

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

  const getButtonVariant = (): 'primary' | 'danger' | 'warning' | 'success' => {
    switch (type) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} preventBackgroundClick={true}>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className={`border-l-4 ${getTypeStyles()} p-6 rounded-t-lg`}>
          <h3 className='text-lg font-semibold mb-2'>{title}</h3>
          <p className='text-sm'>{message}</p>
        </div>
        <div className='p-4 flex justify-end'>
          <Button onClick={onClose} variant={getButtonVariant()}>
            OK
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default AlertModal;
