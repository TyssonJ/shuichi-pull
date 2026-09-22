import Link from 'next/link';
import type { Personagem } from '@/lib/schema';
import { miniaturaDoSprite } from '@/lib/sprites-mini';

export function CartaoPersonagem(
  { personagem: p, numero, mostrarPendente = true }: {
    personagem: Personagem; numero: number; mostrarPendente?: boolean;
  }
) {
  const studentId = String(numero).padStart(3, '0');

  return (
    <Link
      href={`/elenco/${p.id}/`}
      // content-visibility: o navegador pula os cartões fora da tela (a página tem ~56).
      className="group relative block overflow-hidden rounded-[4px] border border-line bg-sur transition-[color,background-color,border-color,transform] duration-300 [contain-intrinsic-size:auto_250px] [content-visibility:auto] hover:-translate-y-1.5 hover:border-alter-green"
    >
      <span aria-hidden className="pointer-events-none absolute left-1 top-0.5 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute right-1 top-0.5 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-0.5 left-1 font-mono text-[9px] leading-none text-line">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-0.5 right-1 font-mono text-[9px] leading-none text-line">+</span>

      <span aria-hidden className="absolute right-1.5 top-1.5 z-10 -rotate-6 rounded-[2px] border border-execution-pink px-1 py-px font-mono text-[6px] font-bold tracking-[.08em] text-execution-pink">
        ULTIMATE FILE
      </span>

      <p aria-hidden className="px-2 pt-2 font-mono text-[7px] tracking-[.1em] text-dim">
        [ STUDENT ID: #{studentId} ]
      </p>

      <div className="relative mt-1 flex h-32 items-end justify-center overflow-hidden bg-bg bg-halftone-pattern">
        <svg data-testid="reticula-cartao" aria-hidden viewBox="0 0 24 24"
          className="pointer-events-none absolute right-2 top-2 z-10 h-4 w-4 opacity-0 text-execution-pink transition-opacity group-hover:opacity-100 group-hover:animate-spin-slow">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={miniaturaDoSprite(p.sprite)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full object-contain object-bottom grayscale transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:saturate-150 group-hover:drop-shadow-[0_0_15px_rgba(255,0,127,0.6)]"
        />
      </div>

      <div className="p-2">
        <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{p.nome}</p>
        <p className="clip-tab-slanted mt-1 inline-block bg-ego-escuro px-1.5 py-px text-[10px] text-alter-green">
          {p.talento.pt}
        </p>
        <p className="mt-0.5 font-mono text-[8px] text-dim">{p.talento.en}</p>
      </div>

      {mostrarPendente && !p.traducaoRevisada && (
        <span
          title="Tradução não revisada por um ADM"
          className="absolute left-1.5 top-1.5 z-10 rounded-[2px] border border-amber/40 px-1 font-mono text-[7px] text-amber"
        >
          PENDENTE
        </span>
      )}
    </Link>
  );
}
