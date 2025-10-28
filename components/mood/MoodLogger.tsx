import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';

const EMOJIS = ['😞', '🙁', '😐', '🙂', '😁'];

const MoodLogger = ({ initialMoodData }: { initialMoodData: any[] }) => {
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Prague' });
    const todayEntry = initialMoodData?.find(entry => entry.log_date === todayStr);
    if (todayEntry) {
      setTodayScore(todayEntry.score);
    }
  }, [initialMoodData]);

  const handleSubmit = async (score: number) => {
    if (todayScore !== null) return; // Already submitted today

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        throw new Error('Failed to save mood.');
      }

      const newEntry = await response.json();
      setTodayScore(newEntry[0].score);
      
      // Invalidate and refetch mood data to update the chart
      await queryClient.invalidateQueries({ queryKey: ['moodData'] });

    } catch (err) {
      setError('Nepodařilo se uložit náladu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasSubmittedToday = todayScore !== null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Jak se dnes cítíte?</h3>
      <div className="flex flex-col items-center">
        <div className="flex gap-2 justify-center">
          {EMOJIS.map((emoji, index) => {
            const score = index + 1;
            return (
              <button
                key={emoji}
                disabled={hasSubmittedToday || isLoading}
                onClick={() => handleSubmit(score)}
                className={`text-3xl p-1 rounded-full transition-all duration-200 ease-in-out 
                          ${isLoading || hasSubmittedToday ? 'cursor-not-allowed opacity-60' : 'hover:scale-110'}
                          ${todayScore === score ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''}
                          `}
                title={`Nálada: ${score}`}
              >
                {isLoading && !hasSubmittedToday ? <FaSpinner className="animate-spin" /> : emoji}
              </button>
            );
          })}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {hasSubmittedToday && <p className="text-green-600 dark:text-green-400 text-xs mt-2">Děkujeme za dnešní záznam!</p>}
      </div>
    </div>
  );
};

export default MoodLogger;
