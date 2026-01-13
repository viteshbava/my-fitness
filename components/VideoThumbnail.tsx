'use client';

import React, { useState } from 'react';
import VideoModal from './VideoModal';
import Button from './Button';

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
        <Button onClick={() => setIsModalOpen(true)} variant='primary' size='sm'>
          <svg className='w-4 h-4 mr-1 inline' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M8 5v14l11-7z' />
          </svg>
          Video
        </Button>

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
      <Button onClick={() => setIsModalOpen(true)} variant='primary' size='lg' fullWidth className={className}>
        <svg className='w-6 h-6 mr-2 inline' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M8 5v14l11-7z' />
        </svg>
        Play Exercise Video
      </Button>

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
