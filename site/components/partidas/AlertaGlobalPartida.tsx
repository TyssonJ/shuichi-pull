'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Contagem } from './Contagem';
import { chaveAvisoFechado, type PartidaAvisada } from '@/lib/alerta-partida';

const REPETIR_BUSCA_MS = 60_000;

function jaFechado(id: number): boolean {
  try {
    return sessionStorage.getItem(chaveAvisoFechado(id)) === '1';
  } catch {
    return false;
  }
}

/**
 * Aviso em qualquer página do site pra quem se inscreveu numa partida que
 * está pra começar. Quem não está logado (ou não tem partida no horário)
 * não vê nada. Na própria página da partida some: ela já tem o dela.
 */
export function AlertaGlobalPartida() {
  const pathname = usePathname() ?? '/';
  const [partidas, setPartidas] = useState<PartidaAvisada[]>([]);
  const [fechadosAgora, setFechadosAgora] = useState<number[]>([]);
  const [agora, setAgora] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    async function atualizar() {
      setAgora(Date.now());
      try {
        const r = await fetch('/api/partidas/proximas/', { cache: 'no-store' });
        if (!r.ok) return;
        const j = (await r.json()) as { partidas: PartidaAvisada[] };
        if (vivo) setPartidas(j.partidas);
      } catch {
        // Sem rede: tenta de novo no próximo ciclo.
      }
    }
    atualizar();
    const timer = setInterval(atualizar, REPETIR_BUSCA_MS);
    return () => { vivo = false; clearInterval(timer); };
  }, []);

  const visivel = partidas.find((p) =>
    !fechadosAgora.includes(p.id)
    && !jaFechado(p.id)
    && !new RegExp(`^/partidas/${p.id}(/|$)`).test(pathname),
  );
  if (!visivel) return null;

  const comecou = agora !== null && new Date(visivel.dataHora).getTime() <= agora;

  function fechar(id: number) {
    setFechadosAgora((f) => [...f, id]);
    try {
      sessionStorage.setItem(chaveAvisoFechado(id), '1');
    } catch {
      // Sem storage: fecha só até recarregar.
    }
  }

  return (
    <div
      role="alert"
      className="clip-dossier-card fixed bottom-4 left-1/2 z-[60] w-[min(94vw,620px)] -translate-x-1/2 border-2 border-execution-pink bg-[#12060C]/95 px-4 py-3 shadow-[0_0_28px_rgba(255,0,127,.45)]"
    >
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative flex items-start gap-3">
        <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-execution-pink" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-bold tracking-[.18em] text-execution-pink">
            [ ALERTA DE PARTIDA ]{visivel.tipo === 'reserva' && ' — VOCÊ É RESERVA'}
          </p>
          <p className="mt-0.5 truncate text-[15px] font-bold text-[#F2F2F5]">{visivel.titulo}</p>
          <p className="mt-0.5 font-mono text-[12px] text-[#D6D6E0]">
            {comecou ? (
              'A PARTIDA JÁ COMEÇOU — ENTRE NO SERVIDOR'
            ) : (
              <>COMEÇA EM <Contagem dataHora={visivel.dataHora} className="font-bold text-execution-pink" /></>
            )}
          </p>
          <a
            href={`/partidas/${visivel.id}/`}
            className="mt-2 inline-block border-2 border-execution-pink px-3 py-1 font-mono text-[11px] font-bold tracking-[.12em] text-execution-pink hover:bg-execution-pink hover:text-[#08090D]"
          >
            ENTRAR NA SALA →
          </a>
        </div>
        <button
          type="button"
          onClick={() => fechar(visivel.id)}
          aria-label="Fechar aviso"
          className="shrink-0 font-mono text-[16px] leading-none text-dim hover:text-[#F2F2F5]"
        >
          ×
        </button>
      </div>
    </div>
  );
}
