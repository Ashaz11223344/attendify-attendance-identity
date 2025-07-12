import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import LoadingSpinner from '../LoadingSpinner';

interface FaceScanSessionProps {
  session: Doc<"attendanceSessions">;
  onClose: () => void;
}

const FaceScanSession: React.FC<FaceScanSessionProps> = ({ session, onClose }) => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<string | null>(null);
  const [attendanceResults, setAttendanceResults] = useState<Record<string, any>>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const enrolledStudents = useQuery(api.subjects.getEnrolledStudents, { 
    subjectId: session.subjectId 
  });
  const processFaceRecognition = useMutation(api.faceRecognition.processAutoFaceRecognition);

  // Initialize face recognition models
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsModelLoading(true);
        // Simulate model loading - in real implementation you'd load face-api.js models
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Face recognition models loaded successfully');
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load face recognition models:', error);
        toast.error('Failed to load face recognition models. Please refresh and try again.');
        setIsModelLoading(false);
      }
    };

    initializeModels();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        toast.success('Camera activated successfully');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Failed to access camera. Please ensure camera permissions are granted.');
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture and process face
  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || !currentStudent) {
      toast.error('Please select a student and ensure camera is active');
      return;
    }

    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.8);
      });

      // Simulate face recognition processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock recognition result
      const mockResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        confidence: 0.85 + Math.random() * 0.1,
        livenessScore: 0.9 + Math.random() * 0.1,
        processingTime: 1200 + Math.random() * 800
      };

      if (mockResult.success) {
        setAttendanceResults(prev => ({
          ...prev,
          [currentStudent]: {
            status: 'present',
            confidence: mockResult.confidence,
            timestamp: Date.now()
          }
        }));
        
        const student = enrolledStudents?.find(s => s._id === currentStudent);
        toast.success(`✅ ${student?.name} marked present (${(mockResult.confidence * 100).toFixed(1)}% confidence)`);
        setCurrentStudent(null);
      } else {
        toast.error('Face not recognized. Please try again or use manual attendance.');
      }
      
    } catch (error) {
      console.error('Face processing error:', error);
      toast.error('Failed to process face recognition. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LoadingSpinner />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading Face Recognition Models
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we initialize the face recognition system...
          </p>
        </div>
      </div>
    );
  }

  if (!enrolledStudents) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const attendanceStats = {
    present: Object.values(attendanceResults).filter((r: any) => r.status === 'present').length,
    remaining: enrolledStudents.length - Object.keys(attendanceResults).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          📷 Face Scan Attendance
        </h3>
        <p className="text-purple-700 dark:text-purple-300">
          Use face recognition to automatically mark student attendance
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Marked Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{attendanceStats.remaining}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Camera Feed
          </h4>
          
          <div className="space-y-4">
            {/* Camera Controls */}
            <div className="flex space-x-3">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📹 Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ⏹️ Stop Camera
                </button>
              )}
            </div>

            {/* Camera Error */}
            {cameraError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {cameraError}
                </p>
                <button
                  onClick={startCamera}
                  className="mt-2 text-red-600 dark:text-red-400 text-sm underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Video Feed */}
            <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 dark:text-gray-400">Camera not active</p>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <LoadingSpinner />
                    <p className="mt-2">Processing face...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture Button */}
            {isCameraActive && currentStudent && (
              <button
                onClick={captureAndProcess}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg transition-colors font-medium"
              >
                {isProcessing ? 'Processing...' : '📸 Capture & Recognize'}
              </button>
            )}
          </div>
        </div>

        {/* Student Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Student
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {enrolledStudents.map((student) => {
              const isMarked = attendanceResults[student._id];
              const isSelected = currentStudent === student._id;
              
              return (
                <div
                  key={student._id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isMarked
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                      : isSelected
                      ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                  onClick={() => {
                    if (!isMarked) {
                      setCurrentStudent(isSelected ? null : student._id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {student.studentId || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isMarked && (
                        <div className="text-center">
                          <div className="text-green-600 text-xl">✅</div>
                          <div className="text-xs text-green-600">
                            {(isMarked.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {isSelected && !isMarked && (
                        <div className="text-purple-600 text-xl">👤</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          📋 Instructions:
        </h5>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Click "Start Camera" to activate the camera feed</li>
          <li>Select a student from the list on the right</li>
          <li>Ask the student to look directly at the camera</li>
          <li>Click "Capture & Recognize" to process their face</li>
          <li>The system will automatically mark attendance if face is recognized</li>
        </ol>
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
          💡 Note: This is a demo version. In production, you would need to set up face recognition models and train them with student photos.
        </p>
      </div>
    </div>
  );
};

export default FaceScanSession;
