import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingWrapperProps {
  isLoading: boolean;
  minDuration?: number; // Minimum duration in milliseconds (default: 1000ms)
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  isLoading, 
  minDuration = 2000, 
  children 
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && startTime === null) {
      // Start loading - record the start time
      setStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && startTime !== null) {
      // Data has loaded - check if minimum duration has passed
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        // Wait for the remaining time
        const timer = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        // Minimum duration has already passed
        setShowLoading(false);
        setStartTime(null);
      }
    }
  }, [isLoading, startTime, minDuration]);

  if (showLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
