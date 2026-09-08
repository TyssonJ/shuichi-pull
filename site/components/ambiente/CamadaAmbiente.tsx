'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TEXTO_MARQUEE =
  'NON-STOP DEBATE // TRUTH BULLET // SHINRI TRIAL // CLASS TRIAL PROTOCOL // ';

type Particula = { forma: string; esquerda: number; atraso: number; duracao: number };

// Não usamos o `useReducedMotion` do framer-motion: ele lê `window.matchMedia`
// uma única vez, em um singleton de módulo (`motion-dom`), e não reavalia em
// montagens seguintes. Isso quebra qualquer teste que mocka `matchMedia` por
// caso de teste. Lemos a preferência aqui, por instância do componente, via
// inicializador preguiçoso de `useState` — reavaliado a cada nova montagem.
function useMovimentoReduzido() {
  const [reduzido] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return reduzido;
}

// Sorteadas uma vez, no módulo — não a cada render, senão as partículas
// "pulariam" de posição a cada re-render do layout.
const PARTICULAS: Particula[] = Array.from({ length: 14 }, (_, i) => ({
  forma: i % 3 === 0 ? 'rotate-45' : i % 3 === 1 ? '' : 'rounded-full',
  esquerda: (i * 7.3) % 100,
  atraso: (i * 1.7) % 8,
  duracao: 14 + (i % 5) * 3,
}));

export function CamadaAmbiente() {
  const movimentoReduzido = useMovimentoReduzido();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Vinheta radial — estática, sem custo de animação. */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Scanlines com flicker sutil a cada 8s. */}
      <div className="absolute inset-0 crt-lines animate-crt-flicker" />

      {/* Halftone respirando. */}
      <div className="absolute inset-0 bg-halftone-pattern animate-ambient-glow" />

      {/* Marquee de fundo — texto duplicado para o loop não ter costura. */}
      <div className="absolute bottom-8 left-0 flex w-full overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap text-8xl font-black uppercase tracking-widest text-white/[0.02]">
          <span className="pr-8">{TEXTO_MARQUEE}</span>
          <span className="pr-8">{TEXTO_MARQUEE}</span>
        </div>
      </div>

      {/* Partículas flutuantes — só com movimento não-reduzido. */}
      {!movimentoReduzido && PARTICULAS.map((p, i) => (
        <motion.div
          key={i}
          data-testid="particula"
          className={`absolute h-1.5 w-1.5 bg-white/10 ${p.forma}`}
          style={{ left: `${p.esquerda}%`, bottom: '-5%' }}
          animate={{ y: ['0vh', '-110vh'], opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: p.duracao, delay: p.atraso, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
}
