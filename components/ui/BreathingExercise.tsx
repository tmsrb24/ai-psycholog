import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation('common');

  const circleVariants = {
    initial: { scale: 1 },
    breathing: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const textVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('breathingExercise.title', 'Dechové cvičení')}</h3>
      <div 
        className="relative w-32 h-32 flex items-center justify-center cursor-pointer"
        onClick={() => setIsActive(!isActive)}
      >
        <motion.div
          className="absolute w-full h-full bg-blue-500 rounded-full"
          variants={circleVariants}
          initial="initial"
          animate={isActive ? 'breathing' : 'initial'}
        />
        <AnimatePresence>
          {isActive ? (
            <motion.p
              key="breathingText"
              className="text-white text-center text-sm z-10"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {t('breathingExercise.breathe', 'Dýchejte s kruhem')}
            </motion.p>
          ) : (
            <motion.p
              key="startText"
              className="text-white text-center text-sm z-10"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {t('breathingExercise.start', 'Start')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BreathingExercise;
