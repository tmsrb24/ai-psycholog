import React, { useMemo } from 'react';
import { Message } from '../types';

interface SentimentAnalyzerProps {
  messages: Message[];
}

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ messages }) => {
  // Filter out system messages and get only user messages
  const userMessages = useMemo(() => {
    return messages.filter(msg => msg.role === 'user');
  }, [messages]);

  // Calculate average message length
  const averageMessageLength = useMemo(() => {
    if (userMessages.length === 0) return 0;
    const totalLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.round(totalLength / userMessages.length);
  }, [userMessages]);

  // Calculate response time (time between user message and assistant response)
  const averageResponseTime = useMemo(() => {
    let totalTime = 0;
    let count = 0;

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'user' && messages[i + 1].role === 'assistant' &&
          messages[i].timestamp && messages[i + 1].timestamp) {
        // Ensure timestamps exist before using them
        const userTimestamp = messages[i].timestamp;
        const assistantTimestamp = messages[i + 1].timestamp;
        
        if (userTimestamp && assistantTimestamp) {
          const userTime = new Date(userTimestamp).getTime();
          const assistantTime = new Date(assistantTimestamp).getTime();
          const diff = assistantTime - userTime;

          if (diff > 0) {
            totalTime += diff;
            count++;
          }
        }
      }
    }

    return count > 0 ? Math.round(totalTime / count / 1000) : 0; // in seconds
  }, [messages]);

  // Analyze message sentiment (very basic)
  const sentimentAnalysis = useMemo(() => {
    if (userMessages.length === 0) return { positive: 0, negative: 0, neutral: 0 };

    const positiveWords = ['dobře', 'skvěle', 'výborně', 'děkuji', 'díky', 'pomohl', 'lepší', 'super', 'fajn'];
    const negativeWords = ['špatně', 'hrozně', 'smutný', 'deprese', 'úzkost', 'strach', 'stres', 'problém', 'potíže'];

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    userMessages.forEach(msg => {
      const lowerContent = msg.content.toLowerCase();
      let hasPositive = false;
      let hasNegative = false;

      for (const word of positiveWords) {
        if (lowerContent.includes(word)) {
          hasPositive = true;
          break;
        }
      }

      for (const word of negativeWords) {
        if (lowerContent.includes(word)) {
          hasNegative = true;
          break;
        }
      }

      if (hasPositive && !hasNegative) positive++;
      else if (hasNegative && !hasPositive) negative++;
      else neutral++;
    });

    return {
      positive,
      negative,
      neutral
    };
  }, [userMessages]);

  // Calculate percentages
  const sentimentPercentages = useMemo(() => {
    const total = sentimentAnalysis.positive + sentimentAnalysis.negative + sentimentAnalysis.neutral;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0 };

    return {
      positive: Math.round((sentimentAnalysis.positive / total) * 100),
      negative: Math.round((sentimentAnalysis.negative / total) * 100),
      neutral: Math.round((sentimentAnalysis.neutral / total) * 100)
    };
  }, [sentimentAnalysis]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-3 dark:text-white">Analýza konverzace</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2 dark:text-white">Statistiky</h3>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Počet zpráv:</span>
              <span className="font-medium dark:text-white">{userMessages.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Průměrná délka zprávy:</span>
              <span className="font-medium dark:text-white">{averageMessageLength} znaků</span>
            </li>
            {averageResponseTime > 0 && (
              <li className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Průměrná doba odpovědi:</span>
                <span className="font-medium dark:text-white">{averageResponseTime} s</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2 dark:text-white">Nálada</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-600 dark:text-green-400">Pozitivní</span>
                <span className="text-gray-600 dark:text-gray-400">{sentimentPercentages.positive}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${sentimentPercentages.positive}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-600 dark:text-red-400">Negativní</span>
                <span className="text-gray-600 dark:text-gray-400">{sentimentPercentages.negative}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${sentimentPercentages.negative}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">Neutrální</span>
                <span className="text-gray-600 dark:text-gray-400">{sentimentPercentages.neutral}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${sentimentPercentages.neutral}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Tato analýza je pouze orientační a slouží k vizualizaci průběhu konverzace.</p>
      </div>
    </div>
  );
};

export default SentimentAnalyzer;
