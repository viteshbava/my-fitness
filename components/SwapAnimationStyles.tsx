import React from 'react';

/**
 * Shared CSS animations for swap functionality.
 * Include this component once in any parent that uses swap animations.
 */
const SwapAnimationStyles: React.FC = () => {
  return (
    <style jsx global>{`
      @keyframes slideUp {
        0% {
          transform: translateY(20px);
          opacity: 0.7;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideDown {
        0% {
          transform: translateY(-20px);
          opacity: 0.7;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-slide-up {
        animation: slideUp 0.3s ease-out;
      }
      .animate-slide-down {
        animation: slideDown 0.3s ease-out;
      }
    `}</style>
  );
};

export default SwapAnimationStyles;
