'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';

/** Desenha "Shift + W" como keycaps arcade 3D, separadas pelos sinais. */
export function Tecla({ combinacao }: { combinacao: string }) {
  const pedacos = combinacao.split(/\s*([+/])\s*/).filter((p) => p !== '');

  return (
    <span role="group" aria-label={combinacao} className="inline-flex flex-wrap items-center gap-1.5">
      {pedacos.map((p, i) =>
        p === '+' || p === '/' ? (
          <span key={i} aria-hidden className="font-mono text-[9px] text-alter-green/50">{p}</span>
        ) : (
          <Fragment key={i}>
            <motion.kbd
              whileTap={{ y: 4, boxShadow: '0 0 0 #008033' }}
              whileHover={{ y: 1, boxShadow: '0 3px 0 #008033' }}
              className="rounded-[3px] border border-alter-green/50 bg-[#0A3018] px-2 py-1 font-mono text-[10px] font-bold text-alter-green shadow-[0_4px_0_#008033]"
            >
              {p}
            </motion.kbd>
          </Fragment>
        )
      )}
    </span>
  );
}
