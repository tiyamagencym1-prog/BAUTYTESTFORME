import React from 'react';

interface IntroductionProps {
  onStart: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onStart }) => {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center text-center text-white p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1596496182853-c583f887515a?q=80&w=1974&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="max-w-2xl z-10">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 animate-fade-in-down" style={{ animation: 'fade-in-down 1s ease-out' }}>
          کشف زیبایی منحصر به فرد شما
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8 animate-fade-in-up" style={{ animation: 'fade-in-up 1s ease-out 0.5s', animationFillMode: 'backwards' }}>
          با قدرت هوش مصنوعی، چهره خود را تحلیل کنید، نقاط قوت خود را بشناسید و نکاتی برای درخشش بیشتر دریافت کنید.
        </p>
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl animate-pulse"
        >
          شروع کنید
        </button>
      </div>

      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(147, 112, 219, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px 10px rgba(147, 112, 219, 0);
          }
        }
        .animate-pulse {
            animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Introduction;
