'use client';
import { motion } from 'framer-motion';

export default function CrisisNotice() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-sm text-gray-400 mt-2"
    >
      🛟 Pokud jsi v krizové situaci, zavolej na <strong>116 123</strong> (Linka první psychické pomoci)
      nebo <strong>116 111</strong> (Linka bezpečí). Pomoc je anonymní a nonstop.
    </motion.p>
  );
}
