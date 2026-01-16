'use client';

import React from 'react';
import ModalOverlay from './ModalOverlay';

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  exerciseName: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoUrl, exerciseName, onClose }) => {
  // Convert video URL to embeddable format
  const getEmbedUrl = (url: string): string => {
    // Handle YouTube URL formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/shorts/VIDEO_ID
    const youtubeMatch =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/) ||
      url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/);

    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Handle different Google Drive URL formats:
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    // https://drive.google.com/uc?id=FILE_ID
    const fileIdMatch = url.match(/drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/) || url.match(/drive\.google\.com.*[?&]id=([a-zA-Z0-9_-]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }

    // If already in embed format or unknown format, return as-is
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[calc(100vw-2rem)] h-[calc(100svh-2rem)] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>{exerciseName}</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:text-gray-700 dark:active:text-gray-200 active:scale-90 transition-all cursor-pointer'
            aria-label='Close modal'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Video Content */}
        <div className='relative flex-1 w-full'>
          <iframe
            src={embedUrl}
            className='absolute top-0 left-0 w-full h-full'
            allow='autoplay'
            allowFullScreen
            title={`${exerciseName} Video`}
          />
        </div>
      </div>
    </ModalOverlay>
  );
};

export default VideoModal;
