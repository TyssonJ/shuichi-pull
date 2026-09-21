/** Barras verticais, uma por dia — o pico do período sempre ocupa a altura
 * toda, então dá pra comparar os dias de relance mesmo com poucos números. */
export function GraficoDias({
  titulo, dias,
}: { titulo: string; dias: { dia: string; rotulo: string; total: number }[] }) {
  const maior = Math.max(1, ...dias.map((d) => d.total));
  const soma = dias.reduce((a, d) => a + d.total, 0);

  return (
    <div className="clip-dossier-card border border-neutral-800 bg-[#0A0D0A] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[.16em] text-alter-green">{titulo}</h3>
        <span className="font-mono text-xs text-neutral-400">{soma} ações</span>
      </div>

      <ol
        aria-label={`${titulo}: ${dias.map((d) => `${d.rotulo} ${d.total}`).join(', ')}`}
        className="flex h-24 items-end gap-1.5"
      >
        {dias.map((d) => (
          <li key={d.dia} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.rotulo}: ${d.total}`}>
            <span className="font-mono text-[9px] text-neutral-400" aria-hidden>{d.total > 0 ? d.total : ''}</span>
            <span
              aria-hidden
              className={`w-full ${d.total > 0 ? 'bg-execution-pink shadow-[0_0_8px_rgba(255,0,127,.5)]' : 'bg-neutral-800'}`}
              style={{ height: `${Math.max(d.total > 0 ? 8 : 3, (d.total / maior) * 100)}%` }}
            />
          </li>
        ))}
      </ol>
      <div aria-hidden className="mt-1 flex gap-1.5">
        {dias.map((d) => (
          <span key={d.dia} className="flex-1 text-center font-mono text-[9px] text-neutral-500">{d.rotulo}</span>
        ))}
      </div>
    </div>
  );
}
