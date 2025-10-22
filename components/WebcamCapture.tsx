
import React, { useRef, useEffect, useState, useCallback } from 'react';
import CameraIcon from './CameraIcon';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCameraError: (error: string) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setIsCameraReady(true);
            };
          }
        } catch (err) {
          console.error("Error accessing camera: ", err);
          onCameraError("دسترسی به دوربین امکان‌پذیر نیست. لطفا مجوز لازم را بدهید.");
        }
      } else {
        onCameraError("دوربین در این مرورگر پشتیبانی نمی‌شود.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCameraError]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
      }
    }
  }, [onCapture]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg mb-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
        {!isCameraReady && (
           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
             <p>در حال آماده‌سازی دوربین...</p>
           </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button
        onClick={handleCapture}
        disabled={!isCameraReady}
        className="w-20 h-20 rounded-full bg-white text-gray-900 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-xl"
        aria-label="گرفتن عکس"
      >
        <CameraIcon className="h-10 w-10" />
      </button>
    </div>
  );
};

export default WebcamCapture;
