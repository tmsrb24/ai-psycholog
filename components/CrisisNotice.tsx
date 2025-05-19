import React from 'react';
import { motion } from 'framer-motion';

const CrisisNotice: React.FC = () => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-base text-gray-500 dark:text-gray-400 mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md w-full text-center shadow"
    >
      <span className="font-semibold">🛟 Pokud jste v krizové situaci, zavolejte na <strong>116 123</strong> (Linka první psychické pomoci)</span>
      <br className="sm:hidden" /> {/* Zalomení řádku na malých obrazovkách */}
      <span className="hidden sm:inline"> nebo </span>
      <span className="block sm:inline font-semibold"><strong>116 111</strong> (Linka bezpečí).</span>
      <br />
      Pomoc je anonymní a nonstop.
    </motion.p>
  );
};

export default CrisisNotice;
