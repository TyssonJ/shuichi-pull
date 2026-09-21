import { Prosa } from '@/components/conteudo/Prosa';

export type TipoPreview = 'faq' | 'mecanica' | 'personagem' | 'nenhum';

const v = (valores: Record<string, string>, chave: string) => valores[chave]?.trim() ?? '';

function TituloSecao({ children }: { children: string }) {
  return (
    <h3 className="mb-1.5 flex items-center gap-2 font-serif text-[10px] tracking-[.14em] text-[#B9B9C6]">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </h3>
  );
}

/**
 * Prévia de um registro do jeito que ele aparece no site. Usa os mesmos
 * componentes de texto (Prosa) e as mesmas classes das páginas públicas, pra
 * quem edita ver o resultado de verdade em vez de imaginar.
 */
export function PreviewConteudo({ tipo, valores }: { tipo: TipoPreview; valores: Record<string, string> }) {
  if (tipo === 'nenhum') return null;

  return (
    <div className="rounded-[4px] border border-dashed border-alter-green/40 bg-[#08090D] p-3">
      <p className="mb-2 font-mono text-[9px] tracking-[.2em] text-alter-green/70">
        PRÉVIA — COMO APARECE NO SITE
      </p>

      {tipo === 'faq' && (
        <details open className="rounded-[4px] border border-ego-escuro bg-sur px-3 py-2">
          <summary className="cursor-default list-none text-[12px] font-bold text-alter-green marker:content-none">
            <span className="mr-1.5 font-mono text-[9px]">?</span>
            {v(valores, 'pergunta') || <span className="text-dim">(sem pergunta)</span>}
          </summary>
          <div className="mt-2 border-t border-line pt-2">
            {v(valores, 'resposta') ? <Prosa texto={v(valores, 'resposta')} /> : <p className="text-[11px] text-dim">(sem resposta)</p>}
          </div>
        </details>
      )}

      {tipo === 'mecanica' && (
        <article className="relative rounded-[4px] border-2 border-[#0F5A2E] bg-[#062710]/40 p-3 pb-5">
          <h3 className="mb-2 font-mono text-[11px] font-bold tracking-[.04em] text-[#D6F5E0]">
            {v(valores, 'titulo') || <span className="text-dim">(sem título)</span>}
          </h3>
          {v(valores, 'texto') ? <Prosa texto={v(valores, 'texto')} /> : <p className="text-[11px] text-dim">(sem texto)</p>}
          <span aria-hidden className="absolute bottom-1.5 right-2 font-mono text-[9px] text-alter-green">▼</span>
        </article>
      )}

      {tipo === 'personagem' && (
        <div className="space-y-4">
          <header className="flex gap-3">
            {v(valores, 'sprite') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v(valores, 'sprite')} alt="" className="h-20 w-16 shrink-0 object-contain" />
            )}
            <div className="min-w-0">
              <p className="font-mono text-[8px] tracking-[.2em] text-dim">{v(valores, 'jogo')}</p>
              <h3 className="text-2xl font-black leading-none tracking-tight text-[#F2F2F5]">{v(valores, 'nome')}</h3>
              <p className="mt-1 font-serif text-[15px] italic leading-tight text-alter-green">{v(valores, 'talento.pt')}</p>
              <p className="font-mono text-[9px] text-dim">{v(valores, 'talento.en')}</p>
            </div>
          </header>

          {v(valores, 'descricao.pt') && (
            <p className="text-[12px] leading-relaxed text-[#C8C8D4]">{v(valores, 'descricao.pt')}</p>
          )}

          {v(valores, 'personalidade') && (
            <section>
              <TituloSecao>— // PERSONALIDADE // —</TituloSecao>
              <p className="text-[12px] leading-relaxed text-[#C8C8D4]">{v(valores, 'personalidade')}</p>
            </section>
          )}
          {v(valores, 'aparencia') && (
            <section>
              <TituloSecao>— // APARÊNCIA // —</TituloSecao>
              <p className="text-[12px] leading-relaxed text-[#C8C8D4]">{v(valores, 'aparencia')}</p>
            </section>
          )}
          {v(valores, 'historia') && (
            <section>
              <TituloSecao>— // HISTÓRIA / PASSADO // —</TituloSecao>
              <p className="text-[12px] leading-relaxed text-[#C8C8D4]">{v(valores, 'historia')}</p>
              <p className="mt-1 font-mono text-[8px] text-dim">No site, fica atrás do cofre do Alter Ego.</p>
            </section>
          )}
          {v(valores, 'segredo') && (
            <section>
              <TituloSecao>— // SEGREDO // —</TituloSecao>
              <p className="text-[12px] leading-relaxed text-[#C8C8D4]">{v(valores, 'segredo')}</p>
              <p className="mt-1 font-mono text-[8px] text-dim">No site, fica atrás do cofre do Alter Ego.</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
