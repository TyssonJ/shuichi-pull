export type IconeInscrito = {
  /** Sprite (pixel ou retrato); `null` = vaga genérica, ainda sem personagem. */
  src: string | null;
  tipo: 'participante' | 'reserva';
  nome: string;
};

/** Fileira de sprites 8-bit de quem já entrou — titular em verde, reserva em
 * âmbar. Corta em `max` e mostra "+N" pra não estourar o cartão. */
export function IconesInscritos({ inscritos, max = 14 }: { inscritos: IconeInscrito[]; max?: number }) {
  if (inscritos.length === 0) {
    return <p className="font-mono text-[11px] text-dim">SALA VAZIA — seja o primeiro a entrar.</p>;
  }
  const visiveis = inscritos.slice(0, max);
  const resto = inscritos.length - visiveis.length;

  return (
    <ul className="flex flex-wrap items-center gap-1" aria-label="Quem já entrou">
      {visiveis.map((i, k) => (
        <li
          key={k}
          title={`${i.nome}${i.tipo === 'reserva' ? ' (reserva)' : ''}`}
          className={`flex h-8 w-8 items-center justify-center border-2 bg-[#0E0E13] ${
            i.tipo === 'reserva' ? 'border-amber/70' : 'border-alter-green/70'
          }`}
        >
          {i.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={i.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" style={{ imageRendering: 'pixelated' }} />
          ) : (
            <span aria-hidden className="font-mono text-[12px] text-dim">?</span>
          )}
        </li>
      ))}
      {resto > 0 && <li className="font-mono text-[11px] text-dim">+{resto}</li>}
    </ul>
  );
}
