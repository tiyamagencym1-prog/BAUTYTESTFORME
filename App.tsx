import React, { useState, useCallback, useEffect } from 'react';
import WebcamCapture from './components/WebcamCapture';
import AnalysisResult from './components/AnalysisResult';
import Spinner from './components/Spinner';
import { analyzeImageForBeauty, AnalysisUpdate } from './services/geminiService';
import RetryIcon from './components/RetryIcon';
import Introduction from './components/Introduction';

type AppState = 'INTRODUCTION' | 'IDLE' | 'CAPTURING' | 'ANALYZING' | 'RESULT' | 'ERROR';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('INTRODUCTION');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('در حال تحلیل تصویر شما... لطفا صبر کنید.');

  // State for streaming results
  const [score, setScore] = useState<number | null>(null);
  const [positivePoints, setPositivePoints] = useState<string[]>([]);
  const [improvementTips, setImprovementTips] = useState<string[]>([]);


  const loadingMessages = [
    'در حال تحلیل تقارن چهره شما...',
    'بررسی ویژگی‌های منحصر به فرد شما...',
    'هوش مصنوعی در حال آماده‌سازی نکات شخصی شماست...',
    'این فرآیند ممکن است چند لحظه طول بکشد، از صبوری شما متشکریم.',
  ];

  useEffect(() => {
    let interval: number | undefined;
    if (appState === 'ANALYZING') {
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        setLoadingMessage('در حال تحلیل تصویر شما... لطفا صبر کنید.');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const resetAnalysisState = () => {
    setScore(null);
    setPositivePoints([]);
    setImprovementTips([]);
  };

  const handleAnalysis = useCallback(async (imgToAnalyze: string) => {
    setError(null);
    resetAnalysisState();
    setAppState('ANALYZING');

    const handleUpdate = (update: AnalysisUpdate) => {
        if (appState !== 'RESULT') {
            setAppState('RESULT'); // Transition to result view on first piece of data
        }
        switch (update.type) {
            case 'SCORE':
                setScore(update.value);
                break;
            case 'POSITIVE':
                setPositivePoints(prev => [...prev, update.value]);
                break;
            case 'TIP':
                setImprovementTips(prev => [...prev, update.value]);
                break;
            case 'ERROR':
                setError(update.value);
                setAppState('ERROR');
                break;
            case 'DONE':
                // Analysis is complete. No specific action needed as data is already populated.
                break;
        }
    };

    await analyzeImageForBeauty(imgToAnalyze, handleUpdate);
  }, [appState]);


  const handleCapture = useCallback((capturedImageSrc: string) => {
    setImageSrc(capturedImageSrc);
    handleAnalysis(capturedImageSrc);
  }, [handleAnalysis]);

  const handleCameraError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setAppState('ERROR');
  }, []);

  const handleReset = () => {
    setAppState('IDLE');
    setImageSrc(null);
    setError(null);
    resetAnalysisState();
  };

  const handleStart = () => {
    setAppState('IDLE');
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
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Spinner />
            <p className="text-xl transition-opacity duration-500 ease-in-out">{loadingMessage}</p>
          </div>
        );
      case 'RESULT':
        if (imageSrc) {
          return <AnalysisResult 
                    score={score} 
                    positive_points={positivePoints} 
                    improvement_tips={improvementTips} 
                    imageSrc={imageSrc} 
                />;
        }
        return null;
      case 'ERROR':
        return (
          <div className="text-center bg-red-900 bg-opacity-30 border border-red-500 p-8 rounded-lg max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-red-400 mb-4">خطا</h3>
            <p className="text-red-300">{error}</p>
          </div>
        );
    }
  };

  if (appState === 'INTRODUCTION') {
    return <Introduction onStart={handleStart} />;
  }

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
