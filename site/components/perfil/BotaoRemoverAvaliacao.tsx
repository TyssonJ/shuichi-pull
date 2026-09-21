'use client';

import { useTransition } from 'react';

export function BotaoRemoverAvaliacao({
  avaliacaoId, aoRemover,
}: { avaliacaoId: number; aoRemover: (avaliacaoId: number) => Promise<void> }) {
  const [pendente, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => iniciar(async () => { await aoRemover(avaliacaoId); })}
      className="shrink-0 font-mono text-[9px] text-dim hover:text-alerta disabled:opacity-50"
      title="Apagar esta avaliação (moderação)"
    >
      {pendente ? 'apagando…' : 'apagar'}
    </button>
  );
}
