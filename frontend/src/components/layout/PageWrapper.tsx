import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';
import { pageTransition } from '@/lib/motion';

export function PageWrapper() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageTransition}
        className="flex-1 p-6"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
