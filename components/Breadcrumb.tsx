'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  truncate?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className='flex mb-6' aria-label='Breadcrumb'>
      <ol className='inline-flex items-center space-x-1 md:space-x-3 flex-wrap'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const truncateClass = item.truncate ? 'truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]' : '';

          return (
            <li key={index} className='inline-flex items-center'>
              {index > 0 && (
                <svg
                  className='w-4 h-4 text-gray-400 mx-1 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              {isLast || !item.href ? (
                <span className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${truncateClass}`} title={item.label}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 active:text-blue-800 dark:active:text-blue-500 active:scale-95 transition-all cursor-pointer ${truncateClass}`}
                  title={item.label}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
