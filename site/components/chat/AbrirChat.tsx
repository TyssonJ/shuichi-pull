'use client';

import { EVENTO_ABRIR_CHAT } from '@/lib/chat';

/** Botão que abre o painel do chat já na sala pedida (a da partida, por exemplo). */
export function AbrirChat({ sala, rotulo = '💬 CHAT DA PARTIDA' }: { sala: string; rotulo?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_CHAT, { detail: { sala } }))}
      className="ml-2 mt-2 inline-block rounded-[2px] border-2 border-alter-green px-2 py-0.5 font-mono text-[9px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
    >
      {rotulo}
    </button>
  );
}
