import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  disabled = false,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 text-gray-800 dark:text-gray-200';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white';
      case 'ghost':
        return 'bg-white hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:active:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300';
      case 'text':
        return 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 active:text-blue-800 dark:active:text-blue-500';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return '';
    }
  };

  const baseStyles = 'font-medium rounded-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const widthStyles = fullWidth ? 'w-full' : '';
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
