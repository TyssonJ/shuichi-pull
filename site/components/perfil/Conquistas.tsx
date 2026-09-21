'use client';

import { useState } from 'react';

export type ConquistaExibida = {
  id: number;
  nome: string;
  descricaoCurta: string;
  descricaoLonga: string;
  iconeUrl: string;
  /** Data já formatada, ex.: "21/09/2026". */
  concedidaEm: string;
  motivo: string | null;
};

/**
 * Conquistas do perfil: um quadrado com o ícone, o nome e a descrição curta.
 * Clicar abre a descrição completa (e o motivo, se um ADM deixou) logo abaixo;
 * clicar de novo fecha.
 */
export function Conquistas({ conquistas }: { conquistas: ConquistaExibida[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const atual = conquistas.find((c) => c.id === aberta) ?? null;

  return (
    <section className="mt-6" aria-label="Conquistas">
      <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
        CONQUISTAS{conquistas.length > 0 ? ` (${conquistas.length})` : ''}
      </h2>

      {conquistas.length === 0 ? (
        <p className="text-[12px] text-dim">Nenhuma conquista ainda.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {conquistas.map((c) => {
              const ativa = aberta === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-expanded={ativa}
                    aria-controls={`conquista-${c.id}`}
                    onClick={() => setAberta(ativa ? null : c.id)}
                    className={`flex w-full items-center gap-2.5 rounded-[3px] border bg-sur p-2 text-left transition-colors ${
                      ativa ? 'border-amber' : 'border-line hover:border-amber/60'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.iconeUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 shrink-0 rounded-[3px] border border-line bg-[#0E0E13] object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-bold text-[#F2F2F5]">{c.nome}</span>
                      <span className="line-clamp-2 block text-[10px] leading-snug text-dim">{c.descricaoCurta}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {atual && (
            <div
              id={`conquista-${atual.id}`}
              role="region"
              aria-label={`Conquista ${atual.nome}`}
              className="mt-2 rounded-[3px] border border-amber/60 bg-amber/5 p-3"
            >
              <p className="text-[13px] font-bold text-amber">{atual.nome}</p>
              <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-[#D6D6E0]">
                {atual.descricaoLonga || atual.descricaoCurta}
              </p>
              {atual.motivo && <p className="mt-1.5 text-[11px] italic text-dim">“{atual.motivo}”</p>}
              <p className="mt-1.5 font-mono text-[9px] text-dim">conquistada em {atual.concedidaEm}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
