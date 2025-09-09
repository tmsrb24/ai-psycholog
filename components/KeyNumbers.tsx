import React, { useEffect, useRef } from 'react';
import { useInView, motion, animate } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { FaUsers, FaComments, FaBook } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface Stat {
  label: string;
  value: number;
  icon: IconType;
}

const KeyNumbers: React.FC = () => {
  const { t } = useTranslation('homepage');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats: Stat[] = [
    { label: t('keyNumbers.users', 'Registrovaní uživatelé'), value: 72, icon: FaUsers },
    { label: t('keyNumbers.messages', 'Vyměněných zpráv'), value: 3678, icon: FaComments },
    { label: t('keyNumbers.diaryEntries', 'Deníkových zápisů'), value: 200, icon: FaBook },
  ];

  const StatCounter = ({ to }: { to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
  
    useEffect(() => {
      if (isInView && nodeRef.current) {
        const node = nodeRef.current;
        const controls = animate(0, to, {
          duration: 2,
          ease: "easeOut",
          onUpdate(value) {
            node.textContent = Math.round(value).toLocaleString('cs-CZ') + '+';
          },
        });
        return () => controls.stop();
      }
    }, [isInView, to]);
  
    return <span ref={nodeRef}>0+</span>;
  };

  return (
    <motion.section 
      ref={ref}
      className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon className="text-blue-500 dark:text-blue-400 text-4xl mb-3" />
              <h3 className="text-5xl font-extrabold text-gray-900 dark:text-white">
                <StatCounter to={stat.value} />
              </h3>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default KeyNumbers;
