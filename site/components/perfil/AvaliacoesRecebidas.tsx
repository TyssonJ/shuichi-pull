import type { ResumoAvaliacoes } from '@/lib/avaliacoes-perfil';
import { formatarDataBR } from '@/lib/fuso';
import { Estrelas } from './Estrelas';
import { BotaoRemoverAvaliacao } from './BotaoRemoverAvaliacao';

/** Avaliações dos colegas (do site e do Junko Bot), sem revelar quem escreveu.
 * O selo de reputação mora no cabeçalho; aqui ficam a média, a distribuição
 * e os comentários. */
export function AvaliacoesRecebidas({
  resumo, moderar, aoRemover,
}: {
  resumo: ResumoAvaliacoes;
  /** Só ADM: mostra o botão de apagar comentário abusivo. */
  moderar: boolean;
  aoRemover: (avaliacaoId: number) => Promise<void>;
}) {
  const maior = Math.max(1, ...resumo.distribuicao);

  return (
    <section className="mt-6">
      <h2 className="mb-1 font-mono text-[10px] tracking-[.14em] text-dim">AVALIAÇÕES DOS COLEGAS · ANÔNIMAS</h2>

      {resumo.total === 0 || resumo.media === null ? (
        <p className="text-[12px] text-dim">
          Ninguém avaliou ainda. Quem joga uma partida junto pode deixar uma nota de 0 a 5 estrelas na página dela.
        </p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="font-mono text-4xl font-black leading-none text-[#F2F2F5]">
                {resumo.media.toString().replace('.', ',')}
                <span className="ml-1 text-[14px] font-normal text-dim">/ 5</span>
              </p>
              <Estrelas valor={resumo.media} className="mt-1 text-[16px]" />
              <p className="mt-1 font-mono text-[10px] text-dim">
                {resumo.total} avaliaç{resumo.total === 1 ? 'ão' : 'ões'}
              </p>
            </div>

            <ul aria-label="Distribuição das notas" className="min-w-[180px] flex-1 space-y-0.5 sm:max-w-xs">
              {[5, 4, 3, 2, 1, 0].map((nota) => (
                <li key={nota} className="flex items-center gap-2 font-mono text-[10px] text-dim">
                  <span className="w-3 text-right">{nota}</span>
                  <span aria-hidden className="text-amber">★</span>
                  <span className="h-1.5 flex-1 overflow-hidden bg-neutral-800">
                    <span className="block h-full bg-amber" style={{ width: `${(resumo.distribuicao[nota] / maior) * 100}%` }} />
                  </span>
                  <span className="w-5">{resumo.distribuicao[nota]}</span>
                </li>
              ))}
            </ul>
          </div>

          {resumo.comentarios.length > 0 && (
            <ul className="space-y-1.5">
              {resumo.comentarios.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-[3px] border border-line bg-sur px-2.5 py-2">
                  <Estrelas valor={c.estrelas} className="mt-0.5 shrink-0 text-[11px]" />
                  <p className="min-w-0 flex-1 whitespace-pre-line text-[12px] leading-relaxed text-[#D6D6E0]">{c.comentario}</p>
                  {c.origem === 'junko' && (
                    <span className="shrink-0 rounded-[2px] border border-cyber-cyan/60 px-1 font-mono text-[8px] text-cyber-cyan" title="Avaliação feita pelo Junko Bot no Discord">
                      VIA JUNKO
                    </span>
                  )}
                  <span className="shrink-0 font-mono text-[9px] text-dim">{formatarDataBR(c.criadoEm)}</span>
                  {moderar && <BotaoRemoverAvaliacao avaliacaoId={c.id} aoRemover={aoRemover} />}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
