'use client';

import { useEffect, useState } from 'react';
import { JanelaEgo } from './JanelaEgo';

const LINHAS = [
  'HOPE\'S PEAK ACADEMY — TERMINAL',
  'carregando arquivo da comunidade BR/PT...',
  '56 fichas de aluno · 162 itens · 39 locais',
  'ALTER_EGO.exe iniciado',
];

export function Boot() {
  const [visivel, setVisivel] = useState(false);
  const [linha, setLinha] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('ego-ja-visitou') === 'true') return;
    // Quem já visitou não vê o boot, e isso só dá para saber no cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisivel(true);

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzido) { encerrar(); return; }

    const t = setInterval(() => {
      setLinha((n) => {
        if (n >= LINHAS.length - 1) { clearInterval(t); setTimeout(encerrar, 900); return n; }
        return n + 1;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);

  function encerrar() {
    localStorage.setItem('ego-ja-visitou', 'true');
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div data-testid="boot" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      <div className="w-52">
        <JanelaEgo estado="primeira-visita" />
      </div>
      <ul className="mt-5 space-y-1 text-center font-mono text-[10px] text-[#7FD1C4]">
        {LINHAS.slice(0, linha + 1).map((l) => <li key={l}>{l}</li>)}
      </ul>
      <button
        type="button" onClick={encerrar}
        className="mt-7 border border-[#3d5732] px-3 py-1 font-mono text-[9px] tracking-[.14em] text-[#a9c898] hover:text-white"
      >
        PULAR
      </button>
    </div>
  );
}
