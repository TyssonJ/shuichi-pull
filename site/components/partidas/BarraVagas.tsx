const pad = (n: number) => String(n).padStart(2, '0');

/** Uma casinha por vaga: acesa (verde) = ocupada. Legível de relance no
 * cartão do lobby, sem precisar ler o número. Embaixo, um quadrado amarelo com
 * a quantidade de reservas — que não contam como vaga nem como participante. */
export function BarraVagas({ ocupadas, total, reservas = 0 }: { ocupadas: number; total: number; reservas?: number }) {
  const cheias = Math.min(ocupadas, total);
  const lotada = ocupadas >= total;

  return (
    <div
      role="img"
      aria-label={`${ocupadas} de ${total} vagas ocupadas; ${reservas} ${reservas === 1 ? 'reserva' : 'reservas'}, que não contam como vaga`}
    >
      <div className="flex flex-wrap gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 ${
              i < cheias
                ? `${lotada ? 'bg-execution-pink' : 'bg-alter-green'} shadow-[0_0_5px_currentColor]`
                : 'border border-line'
            } ${i < cheias ? (lotada ? 'text-execution-pink' : 'text-alter-green') : ''}`}
          />
        ))}
      </div>
      <p className={`mt-1 font-mono text-[11px] tracking-[.1em] ${lotada ? 'text-execution-pink' : 'text-alter-green'}`} aria-hidden>
        {pad(ocupadas)}/{pad(total)} VAGAS{lotada && ' — LOTADA'}
      </p>
      <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] tracking-[.1em] text-[#F5D30E]" aria-hidden>
        <span className={`inline-block h-2.5 w-2.5 bg-[#F5D30E] ${reservas === 0 ? 'opacity-40' : ''}`} />
        {pad(reservas)} {reservas === 1 ? 'RESERVA' : 'RESERVAS'}
        <span className="text-dim">· não contam como vaga</span>
      </p>
    </div>
  );
}
