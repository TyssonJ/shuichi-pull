import { Fragment } from 'react';

/** Desenha "Shift + W" como capas de teclado separadas pelos sinais. */
export function Tecla({ combinacao }: { combinacao: string }) {
  const pedacos = combinacao.split(/\s*([+/])\s*/).filter((p) => p !== '');

  return (
    <span role="group" aria-label={combinacao} className="inline-flex flex-wrap items-center gap-1">
      {pedacos.map((p, i) =>
        p === '+' || p === '/' ? (
          <span key={i} aria-hidden className="font-mono text-[9px] text-dim">{p}</span>
        ) : (
          <Fragment key={i}>
            <kbd className="rounded-[3px] border border-[#3A3A46] border-b-2 bg-[#22222C] px-1.5 py-px font-mono text-[9px] text-[#E2E2EA]">
              {p}
            </kbd>
          </Fragment>
        )
      )}
    </span>
  );
}
