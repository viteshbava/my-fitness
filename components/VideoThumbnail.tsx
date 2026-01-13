'use client';

import React, { useState } from 'react';
import VideoModal from './VideoModal';

interface VideoThumbnailProps {
  videoUrl: string | null;
  exerciseName: string;
  primaryBodyPart?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  videoUrl,
  exerciseName,
  primaryBodyPart = '',
  size = 'medium',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!videoUrl) {
    return (
      <div className='text-center py-4'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>No video available</p>
      </div>
    );
  }

  // For small size (in cards), show a compact button
  if (size === 'small') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white rounded-md transition-all cursor-pointer text-sm'>
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z' />
          </svg>
          Video
        </button>

        <VideoModal
          isOpen={isModalOpen}
          videoUrl={videoUrl}
          exerciseName={exerciseName}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // For medium and large sizes, show a prominent button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white rounded-lg transition-all cursor-pointer ${className}`}>
        <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M8 5v14l11-7z' />
        </svg>
        <span className='text-lg font-medium'>Play Exercise Video</span>
      </button>

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
