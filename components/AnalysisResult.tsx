import React from 'react';

interface AnalysisResultProps {
  score: number | null;
  positive_points: string[];
  improvement_tips: string[];
  imageSrc: string;
}

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const LightbulbIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ScoreDisplay: React.FC<{ score: number | null }> = ({ score }) => {
    if (score === null) {
        return <div className="text-7xl font-bold text-gray-500 animate-pulse">--</div>;
    }
    const scoreColor = score > 75 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400';
    return <p className={`text-7xl font-bold ${scoreColor}`}>{score}</p>;
};

const AnimatedListItem: React.FC<{ children: React.ReactNode, iconColor: string }> = ({ children, iconColor }) => (
    <li className="flex items-start animate-fade-in-up">
        <span className={`${iconColor} mr-2 ml-2`}>&#8226;</span>
        <span>{children}</span>
    </li>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ score, positive_points, improvement_tips, imageSrc }) => {
  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
        <style>{`
            @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        `}</style>
      <div className="flex flex-col items-center">
        <img src={`data:image/jpeg;base64,${imageSrc}`} alt="تحلیل شده" className="rounded-lg shadow-xl border-4 border-gray-700 w-full max-w-sm" />
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-400">امتیاز زیبایی شما</p>
          <ScoreDisplay score={score} />
        </div>
      </div>
      <div className="flex flex-col space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckIcon />
            دلایل زیبایی
          </h3>
          <ul className="space-y-3 text-gray-300 min-h-[100px]">
            {positive_points.map((point, index) => (
              <AnimatedListItem key={index} iconColor="text-green-400">{point}</AnimatedListItem>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LightbulbIcon />
            نکاتی برای بهبود
          </h3>
          <ul className="space-y-3 text-gray-300 min-h-[100px]">
            {improvement_tips.map((tip, index) => (
              <AnimatedListItem key={index} iconColor="text-yellow-400">{tip}</AnimatedListItem>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
