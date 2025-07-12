import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CameraInterfaceProps {
  onCapture?: (imageBlob: Blob) => void;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({
  onCapture,
  isActive,
  onToggle,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera. Please check permissions.');
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob && onCapture) {
        onCapture(blob);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-600 dark:text-gray-400">Camera not active</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
            <div className="text-center p-4">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex space-x-3">
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isActive ? '⏹️ Stop Camera' : '📹 Start Camera'}
        </button>
        
        {isActive && onCapture && (
          <button
            onClick={captureImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📸 Capture
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraInterface;
