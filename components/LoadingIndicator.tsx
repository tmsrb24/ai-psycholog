import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  isVisible: boolean;
  estimatedTime?: number; // in seconds
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  isVisible,
  estimatedTime = 5
}) => {
  const [dots, setDots] = useState('.');
  const [timeLeft, setTimeLeft] = useState(estimatedTime);
  
  // Animate the dots
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Countdown timer
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, timeLeft]);
  
  // Reset timer when estimatedTime changes
  useEffect(() => {
    setTimeLeft(estimatedTime);
  }, [estimatedTime]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-4"
    >
      <div className="flex space-x-2 mb-2">
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse-slow" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse-slow" style={{ animationDelay: '300ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse-slow" style={{ animationDelay: '600ms' }}></div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Přemýšlím{dots} {timeLeft > 0 && `(${timeLeft}s)`}
      </p>
    </motion.div>
  );
};

export default LoadingIndicator;
