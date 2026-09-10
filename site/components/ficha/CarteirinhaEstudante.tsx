'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMovimentoReduzido } from '@/lib/motion';
import type { Personagem } from '@/lib/schema';

// Larguras determinísticas de barra a partir do id do personagem — mesmo id
// sempre produz o mesmo código de barras, sem Math.random() (evitaria
// divergência entre o HTML do servidor e a primeira renderização do
// cliente, o mesmo tipo de problema já corrigido no hook de movimento
// reduzido). Gerador congruente linear simples, seed inicial derivada da
// soma dos códigos de caractere do id.
function larguraDasBarras(id: string): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 1000;
  const larguras: number[] = [];
  for (let i = 0; i < 24; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    larguras.push(1 + (Math.abs(seed) % 3));
  }
  return larguras;
}

export function CarteirinhaEstudante(
  { personagem: p, numero }: { personagem: Personagem; numero: number }
) {
  const movimentoReduzido = useMovimentoReduzido();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const brilhoX = useTransform(mouseX, [-0.5, 0.5], ['20%', '80%']);
  const brilhoY = useTransform(mouseY, [-0.5, 0.5], ['20%', '80%']);

  function aoMoverMouse(e: React.MouseEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    mouseX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }

  function aoSairComMouse() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const studentId = String(numero).padStart(3, '0');
  const barras = larguraDasBarras(p.id);
  const posicoesX = barras.reduce<number[]>((acc, largura, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + barras[i - 1] + 1);
    return acc;
  }, []);

  return (
    <div style={{ perspective: '1000px' }}>
      <motion.div
        ref={ref}
        onMouseMove={aoMoverMouse}
        onMouseLeave={aoSairComMouse}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-[4px] border border-line bg-gradient-to-b from-[#1B1B22] to-[#101014] p-3"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,.08) 50%, transparent 60%)',
            backgroundSize: '200% 200%',
            backgroundPositionX: brilhoX,
            backgroundPositionY: brilhoY,
          }}
        />

        <p className="relative font-mono text-[7px] tracking-[.1em] text-dim">
          [ STUDENT ID: #{studentId} ]
        </p>

        <div className="relative mt-2 overflow-hidden rounded-[3px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.sprite}
            alt={`Sprite de ${p.nome}`}
            className="mx-auto block max-h-[260px] w-auto object-contain"
          />
          {!movimentoReduzido && (
            <div
              data-testid="laser"
              aria-hidden
              className="animate-laser pointer-events-none absolute left-0 right-0 h-px"
              style={{ background: 'var(--color-alter-green)', boxShadow: '0 0 6px var(--color-alter-green)' }}
            />
          )}
        </div>

        <svg data-testid="codigo-barras" aria-hidden viewBox="0 0 72 20" className="relative mt-3 h-4 w-full">
          {barras.map((largura, i) => (
            <rect key={i} x={posicoesX[i]} y={0} width={largura} height={20} fill="#4E4E5C" />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
