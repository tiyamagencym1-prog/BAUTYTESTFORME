
import React, { useState, useCallback } from 'react';
import WebcamCapture from './components/WebcamCapture';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import { BeautyAnalysis } from './types';
import { analyzeImageForBeauty } from './services/geminiService';
import RetryIcon from './components/RetryIcon';

type AppState = 'IDLE' | 'CAPTURING' | 'ANALYZING' | 'RESULT' | 'ERROR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<BeautyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback((capturedImageSrc: string) => {
    setImageSrc(capturedImageSrc);
    setAppState('ANALYZING');
    handleAnalysis(capturedImageSrc);
  }, []);
  
  const handleAnalysis = useCallback(async (imgToAnalyze: string) => {
    setError(null);
    try {
      const result = await analyzeImageForBeauty(imgToAnalyze);
      setAnalysisResult(result);
      setAppState('RESULT');
    } catch (err: any) {
      setError(err.message || "یک خطای ناشناخته رخ داد.");
      setAppState('ERROR');
    }
  }, []);

  const handleCameraError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setAppState('ERROR');
  }, []);

  const handleReset = () => {
    setAppState('IDLE');
    setImageSrc(null);
    setAnalysisResult(null);
    setError(null);
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'IDLE':
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">به تحلیلگر زیبایی خوش آمدید</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">برای شروع، روی دکمه زیر کلیک کنید تا دوربین شما فعال شود و یک عکس از خودتان بگیرید.</p>
                <button onClick={() => setAppState('CAPTURING')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg">
                    شروع تحلیل
                </button>
            </div>
        );
      case 'CAPTURING':
        return <WebcamCapture onCapture={handleCapture} onCameraError={handleCameraError} />;
      case 'ANALYZING':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner />
            <p className="text-xl">در حال تحلیل تصویر شما... لطفا صبر کنید.</p>
          </div>
        );
      case 'RESULT':
        if (analysisResult && imageSrc) {
          return <AnalysisResult result={analysisResult} imageSrc={imageSrc} />;
        }
        return null; // Should not happen
      case 'ERROR':
        return (
          <div className="text-center bg-red-900 bg-opacity-30 border border-red-500 p-8 rounded-lg max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-red-400 mb-4">خطا</h3>
            <p className="text-red-300">{error}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-8 flex flex-col items-center">
        <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              تحلیلگر زیبایی با هوش مصنوعی
            </h1>
            {(appState === 'RESULT' || appState === 'ERROR') && (
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <RetryIcon />
                    امتحان مجدد
                </button>
            )}
        </header>

      <main className="flex-grow flex items-center justify-center w-full max-w-5xl mx-auto">
        {renderContent()}
      </main>
      
      <footer className="w-full text-center text-gray-500 mt-12 text-sm">
        <p>قدرت گرفته از Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
