'use client';

import { motion } from 'framer-motion';

export function HeroTitulo() {
  return (
    <motion.h1
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mt-2 -rotate-1 text-5xl font-black leading-[.9] tracking-tight text-[#F2F2F5] sm:text-6xl"
    >
      O caso está<br />
      <span
        className="text-execution-pink"
        style={{ textShadow: '4px 4px 0px var(--color-cyber-cyan)' }}
      >
        aberto.
      </span>
    </motion.h1>
  );
}
