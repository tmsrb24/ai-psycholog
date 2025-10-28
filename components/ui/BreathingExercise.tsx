import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('breathingExercise.title', 'Dechové cvičení')}</h3>
      <div 
        className="relative w-48 h-48 flex items-center justify-center cursor-pointer"
        onClick={() => setIsActive(!isActive)}
      >
        {/* Central breathing circle */}
        <div 
          className={`absolute w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center z-10 transition-transform duration-2000 ease-in-out ${isActive ? 'animate-breathing' : ''}`}
        >
           <p className="text-white text-center text-sm font-medium">
             {isActive ? t('breathingExercise.breathe', 'Dýchejte') : t('breathingExercise.start', 'Start')}
           </p>
        </div>

        {/* Pulsing circles for visual effect */}
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-pulse-fade" style={{ animationDelay: '0s' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-pulse-fade" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-pulse-fade" style={{ animationDelay: '2s' }}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;
