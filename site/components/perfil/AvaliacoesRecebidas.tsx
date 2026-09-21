import type { ResumoAvaliacoes } from '@/lib/avaliacoes-perfil';
import { formatarDataBR } from '@/lib/fuso';
import { BotaoRemoverAvaliacao } from './BotaoRemoverAvaliacao';

/** Avaliações dos colegas, sem revelar quem escreveu. O selo de reputação
 * mora no cabeçalho; aqui ficam os números e os comentários. */
export function AvaliacoesRecebidas({
  resumo, moderar, aoRemover,
}: {
  resumo: ResumoAvaliacoes;
  /** Só ADM: mostra o botão de apagar comentário abusivo. */
  moderar: boolean;
  aoRemover: (avaliacaoId: number) => Promise<void>;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-1 font-mono text-[10px] tracking-[.14em] text-dim">AVALIAÇÕES DOS COLEGAS · ANÔNIMAS</h2>

      {resumo.total === 0 ? (
        <p className="text-[12px] text-dim">
          Ninguém avaliou ainda. Quem joga uma partida junto pode deixar uma avaliação na página dela.
        </p>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3 font-mono text-[12px]">
            <span className="text-alter-green">▲ {resumo.likes}</span>
            <span className="text-execution-pink">▼ {resumo.dislikes}</span>
            {resumo.aprovacao !== null && <span className="text-dim">{resumo.aprovacao}% de aprovação</span>}
          </div>

          <div
            aria-hidden
            className="mb-4 h-1.5 max-w-xs overflow-hidden bg-execution-pink/40"
          >
            <div className="h-full bg-alter-green" style={{ width: `${resumo.aprovacao ?? 0}%` }} />
          </div>

          {resumo.comentarios.length > 0 && (
            <ul className="space-y-1.5">
              {resumo.comentarios.map((c) => (
                <li
                  key={c.id}
                  className={`flex items-start gap-2 rounded-[3px] border bg-sur px-2.5 py-2 ${
                    c.tipo === 'like' ? 'border-alter-green/30' : 'border-execution-pink/30'
                  }`}
                >
                  <span aria-hidden className={`font-mono text-[11px] ${c.tipo === 'like' ? 'text-alter-green' : 'text-execution-pink'}`}>
                    {c.tipo === 'like' ? '▲' : '▼'}
                  </span>
                  <p className="min-w-0 flex-1 whitespace-pre-line text-[12px] leading-relaxed text-[#D6D6E0]">{c.comentario}</p>
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
