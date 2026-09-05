import Link from 'next/link';
import type { Spawn } from '@/lib/schema-itens';

function faixa(min: number, max: number): string {
  return min === max ? `${min} un.` : `${min}–${max} un.`;
}

/** Uma linha por contêiner: barra proporcional à chance, número ao lado. */
export function BarraSpawn({ spawns }: { spawns: Spawn[] }) {
  if (spawns.length === 0) {
    return (
      <p className="text-[11px] text-dim">
        Este item não aparece em nenhum contêiner mapeado. Pode vir de craft,
        da loja ou de evento.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {spawns.map((s) => (
        <li key={`${s.fonteId}-${s.conteiner.en}`}>
          <div className="flex items-baseline gap-2 text-[11px]">
            <Link href={`/mapa/${s.localId}/`} className="text-teal hover:underline">
              {s.local.pt}
            </Link>
            {s.andar && <span className="font-mono text-[8px] text-dim">{s.andar.pt}</span>}
            <span className="text-[#D6D6E0]">{s.conteiner.pt}</span>
            <span className="ml-auto font-mono text-[9px] text-dim">{faixa(s.qtdMin, s.qtdMax)}</span>
            <span className="w-9 text-right font-mono text-[10px] font-bold text-[#D6D6E0]">
              {s.chance}%
            </span>
          </div>
          <div
            data-testid="barra"
            className="mt-1 h-1 overflow-hidden rounded-[1px] bg-[#22222C]"
            role="img"
            aria-label={`${s.chance}% de chance em ${s.conteiner.pt}, ${s.local.pt}`}
          >
            <div className="h-full bg-teal" style={{ width: `${s.chance}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
