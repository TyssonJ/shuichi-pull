'use client';

import { motion } from 'framer-motion';

export function HeroTitulo() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h1 className="relative mt-2 -rotate-1 text-5xl font-black leading-[.9] tracking-tight text-[#F2F2F5] sm:text-6xl">
        SHINRI{' '}
        <span
          className="text-execution-pink"
          style={{ textShadow: '4px 4px 0px var(--color-cyber-cyan)' }}
        >
          TRIAL
        </span>
      </h1>
      <p className="relative mt-1 font-mono text-[11px] uppercase tracking-[.2em] text-cyber-cyan">
        O caso está aberto.
      </p>
    </motion.div>
  );
}
