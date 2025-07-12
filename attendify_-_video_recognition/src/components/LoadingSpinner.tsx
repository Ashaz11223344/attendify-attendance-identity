import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  minDuration?: number; // Minimum duration in milliseconds (default: 1000ms)
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ minDuration = 1000 }) => {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Always show the spinner for at least the minimum duration
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Glowing Attendify Text Loader */}
      <div className="flex space-x-1">
        {['A', 't', 't', 'e', 'n', 'd', 'i', 'f', 'y'].map((letter, index) => (
          <div
            key={index}
            className="text-4xl font-bold text-gray-500 dark:text-gray-400 animate-pulse"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: '1.6s',
              fontFamily: 'Tektur, monospace'
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Subtitle */}
      <div className="text-sm text-gray-500 dark:text-gray-400 tracking-wide font-medium">
        Smart Attendance
      </div>

      {/* Simple spinner */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
};

export default LoadingSpinner;
