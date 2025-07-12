import React, { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import CameraInterface from '../common/CameraInterface';
import { Lock, CheckCircle, Shield, PartyPopper, Clipboard, ArrowLeft } from 'lucide-react';

interface FaceDataSetupProps {
  profile: any;
  onComplete: () => void;
}

const FaceDataSetup: React.FC<FaceDataSetupProps> = ({ profile, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<'instructions' | 'capture' | 'processing' | 'complete'>('instructions');

  const generateUploadUrl = useMutation(api.faceRecognition.generateFacePhotoUploadUrl);
  const processFacePhoto = useAction(api.faceRecognition.processFacePhoto);

  const handleImageCapture = async (imageBlob: Blob) => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(imageBlob);
      setCapturedImage(previewUrl);

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload image
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': imageBlob.type },
        body: imageBlob,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { storageId } = await response.json();

      // Process face data
      const result = await processFacePhoto({
        studentId: profile._id,
        imageStorageId: storageId,
      });

      if (result.success) {
        setStep('complete');
        toast.success('Face data setup completed successfully!');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to process face data');
      }
    } catch (error) {
      console.error('Face data setup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to setup face data');
      setStep('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'instructions':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Setup Face Recognition
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                We'll capture your face data to enable secure attendance marking. 
                This process is completely secure and your data is encrypted.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Clipboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Before we start:
                </h3>
              </div>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 text-left">
                <li>• Ensure you're in a well-lit area</li>
                <li>• Remove glasses, masks, or hats</li>
                <li>• Look directly at the camera</li>
                <li>• Keep your face centered in the frame</li>
                <li>• Maintain a neutral expression</li>
              </ul>
            </div>

            <button
              onClick={() => setStep('capture')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue to Camera Setup
            </button>
          </div>
        );

      case 'capture':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Capture Your Face
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Position your face in the camera and click capture when ready
              </p>
            </div>

            <CameraInterface
              onCapture={handleImageCapture}
              isActive={!isProcessing}
              onToggle={() => {}}
              className="max-w-md mx-auto"
            />

            <div className="text-center">
              <button
                onClick={() => setStep('instructions')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Instructions</span>
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600"></div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Processing Face Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we securely process and encrypt your face data...
              </p>
            </div>

            {capturedImage && (
              <div className="max-w-xs mx-auto">
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full h-48 object-cover rounded-lg border-2 border-yellow-300"
                />
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Your face data is being encrypted using advanced security algorithms. 
                  This may take a few moments.
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Setup Complete!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your face data has been successfully processed and secured. 
                You can now use face recognition for attendance.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <PartyPopper className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-900 dark:text-green-300">
                  What's next?
                </h3>
              </div>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1 text-left">
                <li>• Your face data is now active in the system</li>
                <li>• Teachers can use face recognition for attendance</li>
                <li>• You'll receive notifications when marked present</li>
                <li>• Your data is encrypted and secure</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        {renderStep()}
      </div>
    </div>
  );
};

export default FaceDataSetup;
