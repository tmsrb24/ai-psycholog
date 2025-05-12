import React from 'react';
import { FaTrophy, FaCalendarAlt, FaFire, FaMedal } from 'react-icons/fa';

interface GamificationProps {
  sessionCount: number;
  streakDays: number;
  lastSessionDate?: Date;
}

const Gamification: React.FC<GamificationProps> = ({
  sessionCount,
  streakDays,
  lastSessionDate
}) => {
  // Calculate achievements
  const achievements = [
    {
      id: 'first_session',
      title: 'První konverzace',
      description: 'Zahájili jste svou první konverzaci',
      icon: <FaTrophy className="text-yellow-500" />,
      unlocked: sessionCount >= 1
    },
    {
      id: 'five_sessions',
      title: 'Pravidelný uživatel',
      description: 'Dokončili jste 5 konverzací',
      icon: <FaMedal className="text-blue-500" />,
      unlocked: sessionCount >= 5
    },
    {
      id: 'ten_sessions',
      title: 'Pokročilý uživatel',
      description: 'Dokončili jste 10 konverzací',
      icon: <FaMedal className="text-purple-500" />,
      unlocked: sessionCount >= 10
    },
    {
      id: 'three_day_streak',
      title: 'Třídenní série',
      description: 'Používali jste aplikaci 3 dny v řadě',
      icon: <FaFire className="text-orange-500" />,
      unlocked: streakDays >= 3
    },
    {
      id: 'seven_day_streak',
      title: 'Týdenní série',
      description: 'Používali jste aplikaci 7 dní v řadě',
      icon: <FaFire className="text-red-500" />,
      unlocked: streakDays >= 7
    }
  ];
  
  // Calculate unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = Math.round((unlockedCount / achievements.length) * 100);
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-3 dark:text-white">Vaše úspěchy</h2>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Celkový pokrok</span>
          <span className="text-sm font-medium dark:text-white">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg flex items-center">
          <div className="mr-3 bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
            <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Konverzace</div>
            <div className="font-bold text-blue-700 dark:text-blue-300">{sessionCount}</div>
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg flex items-center">
          <div className="mr-3 bg-orange-100 dark:bg-orange-800 p-2 rounded-full">
            <FaFire className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Série dnů</div>
            <div className="font-bold text-orange-700 dark:text-orange-300">{streakDays}</div>
          </div>
        </div>
      </div>
      
      <h3 className="font-medium mb-2 dark:text-white">Odznaky</h3>
      <ul className="space-y-2">
        {achievements.map(achievement => (
          <li 
            key={achievement.id}
            className={`p-2 rounded-lg flex items-center ${
              achievement.unlocked 
                ? 'bg-gray-100 dark:bg-gray-700' 
                : 'bg-gray-50 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className="mr-3">
              {achievement.unlocked ? achievement.icon : (
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              )}
            </div>
            <div>
              <div className={`font-medium ${achievement.unlocked ? 'dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {achievement.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {achievement.description}
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {lastSessionDate && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Poslední aktivita: {formatDate(lastSessionDate)}
        </div>
      )}
    </div>
  );
};

export default Gamification;
