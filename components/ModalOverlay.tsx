'use client';

import React, { useEffect } from 'react';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  preventBackgroundClick?: boolean;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen,
  onClose,
  children,
  preventBackgroundClick = false,
}) => {
  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay (not on modal content)
    if (e.target === e.currentTarget && !preventBackgroundClick) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={handleOverlayClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'auto'
      }}>
      <div
        className='relative w-full flex items-center justify-center'
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;
