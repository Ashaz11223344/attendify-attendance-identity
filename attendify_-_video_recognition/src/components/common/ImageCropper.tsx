import React, { useState, useRef, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    // Constrain to canvas bounds
    const maxX = rect.width - cropArea.width;
    const maxY = rect.height - cropArea.height;

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y))
    }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Calculate image scaling to fit canvas while maintaining aspect ratio
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      cropArea.x + cropArea.width / 2,
      cropArea.y + cropArea.height / 2,
      cropArea.width / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw crop circle border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      cropArea.x + cropArea.width / 2,
      cropArea.y + cropArea.height / 2,
      cropArea.width / 2,
      0,
      2 * Math.PI
    );
    ctx.stroke();

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cropArea.x - handleSize / 2, cropArea.y - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize / 2, cropArea.y - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(cropArea.x - handleSize / 2, cropArea.y + cropArea.height - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize / 2, cropArea.y + cropArea.height - handleSize / 2, handleSize, handleSize);
  }, [cropArea, imageLoaded]);

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Set crop canvas size to a fixed size for profile pictures
    const outputSize = 200;
    cropCanvas.width = outputSize;
    cropCanvas.height = outputSize;

    // Calculate scaling factors
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Calculate crop area in original image coordinates
    const cropX = (cropArea.x - offsetX) / scale;
    const cropY = (cropArea.y - offsetY) / scale;
    const cropSize = cropArea.width / scale;

    // Create circular clipping path
    cropCtx.beginPath();
    cropCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
    cropCtx.clip();

    // Draw the cropped image
    cropCtx.drawImage(
      image,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/jpeg', 0.9);
  }, [cropArea, onCropComplete]);

  const handleSizeChange = (newSize: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxSize = Math.min(canvas.width, canvas.height) - 20;
    const size = Math.max(100, Math.min(maxSize, newSize));

    setCropArea(prev => ({
      ...prev,
      width: size,
      height: size,
      x: Math.max(0, Math.min(canvas.width - size, prev.x)),
      y: Math.max(0, Math.min(canvas.height - size, prev.y))
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Crop Profile Picture
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 dark:border-gray-600 rounded-lg cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="hidden"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Size:
            </label>
            <input
              type="range"
              min="100"
              max="250"
              value={cropArea.width}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              {cropArea.width}px
            </span>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Drag the circle to position your profile picture. Use the slider to adjust size.
          </div>

          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
