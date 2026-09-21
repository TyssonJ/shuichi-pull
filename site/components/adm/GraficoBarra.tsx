import type { Segmento } from '@/lib/adm/painel';

/** Barra empilhada horizontal + legenda. Sem dado nenhum, mostra a barra
 * vazia em vez de dividir por zero. */
export function GraficoBarra({ titulo, segmentos }: { titulo: string; segmentos: Segmento[] }) {
  const total = segmentos.reduce((a, s) => a + s.valor, 0);

  return (
    <div className="clip-dossier-card border border-neutral-800 bg-[#0A0D0A] p-4">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[.16em] text-alter-green">{titulo}</h3>

      <div
        role="img"
        aria-label={`${titulo}: ${segmentos.map((s) => `${s.valor} ${s.rotulo}`).join(', ')}`}
        className="flex h-4 w-full overflow-hidden border border-neutral-700 bg-neutral-950"
      >
        {total > 0 && segmentos.filter((s) => s.valor > 0).map((s) => (
          <span key={s.rotulo} style={{ width: `${(s.valor / total) * 100}%`, background: s.cor }} title={`${s.rotulo}: ${s.valor}`} />
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {segmentos.map((s) => (
          <li key={s.rotulo} className="flex items-center gap-2 text-xs text-neutral-300">
            <span aria-hidden className="h-2.5 w-2.5 shrink-0" style={{ background: s.cor }} />
            <span className="flex-1">{s.rotulo}</span>
            <span className="font-mono font-bold text-neutral-100">{s.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
