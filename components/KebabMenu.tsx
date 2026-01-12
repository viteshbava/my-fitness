import React, { useState } from 'react';

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  isDangerous?: boolean;
}

interface KebabMenuProps {
  items: MenuItem[];
}

const KebabMenu: React.FC<KebabMenuProps> = ({ items }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='relative cursor-pointer'>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className='p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer'
        aria-label='Menu'>
        <svg className='w-6 h-6 cursor-pointer' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />

          {/* Menu Items */}
          <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700'>
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setMenuOpen(false);
                  item.onClick();
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center transition-colors cursor-pointer ${
                  index === 0 ? 'rounded-t-md' : ''
                } ${index === items.length - 1 ? 'rounded-b-md' : ''} ${
                  item.isDangerous
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}>
                {item.icon && <span className='w-5 h-5 mr-3'>{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default KebabMenu;
