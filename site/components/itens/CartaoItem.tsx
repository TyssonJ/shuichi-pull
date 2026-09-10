import Link from 'next/link';
import { Selo } from './Selo';
import { Icone } from './Icone';
import type { Item } from '@/lib/schema-itens';

// Número de série determinístico a partir do id — mesmo item sempre gera o
// mesmo "#EV-XXX", sem Math.random() (divergiria entre servidor e cliente).
function numeroSerie(id: string): string {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 1000;
  return String(seed).padStart(3, '0');
}

type Tier = 'redacted' | 'comum' | 'raro' | 'muitoRaro' | 'lendario';

function tierDoNivel(nivel: number): Tier {
  if (nivel <= 0) return 'redacted';
  if (nivel <= 2) return 'comum';
  if (nivel === 3) return 'raro';
  if (nivel === 4) return 'muitoRaro';
  return 'lendario';
}

// Legendário pulsa em âmbar, raro/muito raro brilham em ciano/rosa elétrico
// (mesma dupla de acento do resto do site), comum e não-classificado ficam
// monocromáticos — igual etiqueta de evidência policial preto e branco.
const ESTILO_TIER: Record<Tier, { borda: string; sombra?: string; pulso?: boolean }> = {
  redacted: { borda: 'border-line/50 border-dashed' },
  comum: { borda: 'border-line' },
  raro: { borda: 'border-cyber-cyan/50', sombra: '0 0 15px rgba(0,240,255,0.22)' },
  muitoRaro: { borda: 'border-execution-pink/50', sombra: '0 0 15px rgba(255,0,127,0.22)' },
  lendario: { borda: 'border-amber/60', sombra: '0 0 20px rgba(245,158,11,0.3)', pulso: true },
};

export function CartaoItem({ item }: { item: Item }) {
  const tier = tierDoNivel(item.nivelRaridade);
  const estilo = ESTILO_TIER[tier];
  const local = item.spawns[0]?.local.pt ?? null;

  return (
    <Link
      href={`/itens/${item.id}/`}
      className={`group relative block overflow-hidden rounded-[4px] border bg-white/[0.02] p-2.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${estilo.borda}`}
      style={{ boxShadow: estilo.sombra }}
    >
      {estilo.pulso && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-ambient-glow"
          style={{ boxShadow: 'inset 0 0 24px 4px rgba(245,158,11,0.25)' }}
        />
      )}

      <div className="relative mb-1.5 flex items-start gap-2">
        <Icone src={item.icone} nome={item.nome.pt} />
        <p className="flex-1 text-[12px] font-bold leading-tight text-[#D6D6E0]">
          {item.nome.pt}
        </p>
        {item.craft && (
          <span
            title="Dá para fabricar"
            className="font-mono text-[9px] text-alter-green"
            aria-label="Dá para fabricar"
          >
            ⚒
          </span>
        )}
      </div>
      <p className="relative mb-2 pl-11 font-mono text-[8px] text-dim">{item.nome.en}</p>

      <div className="relative flex flex-wrap items-center gap-1.5">
        <Selo raridade={item.raridade} nivel={item.nivelRaridade} />
        <span className="font-mono text-[8px] text-dim">
          {item.categoria.pt}
          {(tier === 'comum' || tier === 'redacted') && ` · #EV-${numeroSerie(item.id)}`}
        </span>
        {item.peso !== null && (
          <span className="ml-auto font-mono text-[8px] text-dim">{item.peso} kg</span>
        )}
      </div>

      {local && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-full items-center gap-1 border-t border-line bg-[#0A0A0D]/95 px-2 py-1 font-mono text-[7px] uppercase tracking-[.08em] text-dim transition-transform duration-300 group-hover:translate-y-0"
        >
          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 text-cyber-cyan">
            <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <line x1="9.8" y1="9.8" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="truncate text-cyber-cyan">{local}</span>
        </div>
      )}
    </Link>
  );
}
