'use client';

import React, { useState } from 'react';
import VideoModal from './VideoModal';

interface VideoThumbnailProps {
  videoUrl: string | null;
  exerciseName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  exerciseName,
  size = 'medium',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!videoUrl) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <div className='text-center p-4'>
          <svg
            className='w-8 h-8 mx-auto text-gray-400 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
            />
          </svg>
          <p className='text-xs text-gray-500 dark:text-gray-400'>No video</p>
        </div>
      </div>
    );
  }

  // Get thumbnail size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-20 h-20';
      case 'large':
        return 'w-full h-48';
      case 'medium':
      default:
        return 'w-32 h-32';
    }
  };

  // Extract Google Drive file ID for thumbnail
  const getThumbnailUrl = (url: string): string => {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      // Use Google Drive thumbnail API
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w320`;
    }

    // Fallback to generic video icon
    return '';
  };

  const thumbnailUrl = getThumbnailUrl(videoUrl);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`${getSizeClasses()} bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group ${className}`}>
        {thumbnailUrl ? (
          <>
            <img src={thumbnailUrl} alt={`${exerciseName} thumbnail`} className='w-full h-full object-cover' />
            {/* Play button overlay */}
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all'>
              <svg
                className='w-12 h-12 text-white drop-shadow-lg'
                fill='currentColor'
                viewBox='0 0 24 24'>
                <path d='M8 5v14l11-7z' />
              </svg>
            </div>
          </>
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600'>
            <svg
              className='w-12 h-12 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        )}
      </div>

      <VideoModal
        isOpen={isModalOpen}
        videoUrl={videoUrl}
        exerciseName={exerciseName}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default VideoThumbnail;
