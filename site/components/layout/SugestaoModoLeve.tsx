'use client';

import { useEffect, useState } from 'react';
import { aparelhoSofrendo, definirModoLeve, jaEscolheuModoLeve } from '@/lib/modo-leve';
import { useModoLeve } from '@/lib/use-modo-leve';

/** Espera a página assentar (hidratação, imagens) antes de medir, senão qualquer aparelho parece lento. */
const ESPERA_MS = 3500;
const MEDICAO_MS = 2000;

/**
 * Oferece o modo leve a quem não sabe que ele existe: depois que a página
 * carrega, conta quantos quadros por segundo o aparelho consegue desenhar. Se
 * estiver sofrendo, pergunta uma vez (a resposta — sim ou "agora não" — fica
 * guardada e ele não pergunta de novo). Quem já escolheu, ou já está no modo
 * leve, nem é medido.
 */
export function SugestaoModoLeve() {
  const leve = useModoLeve();
  const [oferecer, setOferecer] = useState(false);

  useEffect(() => {
    if (leve || jaEscolheuModoLeve()) return;

    let cancelado = false;
    let quadro = 0;
    const timer = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      const intervalos: number[] = [];
      let anterior = performance.now();
      const fim = anterior + MEDICAO_MS;

      function medir(agora: number) {
        if (cancelado) return;
        intervalos.push(agora - anterior);
        anterior = agora;
        if (agora < fim && document.visibilityState === 'visible') {
          quadro = requestAnimationFrame(medir);
        } else if (aparelhoSofrendo(intervalos)) {
          setOferecer(true);
        }
      }
      quadro = requestAnimationFrame(medir);
    }, ESPERA_MS);

    return () => {
      cancelado = true;
      clearTimeout(timer);
      cancelAnimationFrame(quadro);
    };
  }, [leve]);

  if (!oferecer || leve) return null;

  return (
    <div
      role="dialog"
      aria-label="Sugestão de modo leve"
      className="fixed inset-x-3 bottom-16 z-[55] rounded-[4px] border-2 border-alter-green bg-[#0A0A0D] p-3 shadow-2xl sm:inset-x-auto sm:bottom-20 sm:left-1/2 sm:w-[26rem] sm:-translate-x-1/2"
    >
      <p className="text-[12px] leading-snug text-[#D6D6E0]">
        <b className="text-alter-green">O site parece pesado no seu aparelho.</b> O modo leve tira as animações e os efeitos e
        deixa tudo mais rápido. Dá pra desligar quando quiser, no botão ⚡ do topo.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => { definirModoLeve(true); setOferecer(false); }}
          className="rounded-[3px] border-2 border-alter-green px-3 py-1 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
        >
          ATIVAR MODO LEVE
        </button>
        <button
          type="button"
          onClick={() => { definirModoLeve(false); setOferecer(false); }}
          className="px-2 font-mono text-[11px] text-dim hover:text-[#D6D6E0]"
        >
          agora não
        </button>
      </div>
    </div>
  );
}
