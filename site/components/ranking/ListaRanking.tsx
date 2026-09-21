import Link from 'next/link';
import type { ItemDoRanking } from '@/lib/junko/estatisticas-bot';

const COR_POSICAO = ['#F5D30E', '#C0C0C8', '#CD7F32'];

/** Um placar do Junko Bot. `noSite` = quem tem conta aqui (esses viram link pro perfil). */
export function ListaRanking({
  titulo, rotuloValor, itens, noSite, indisponivel = false,
}: {
  titulo: string;
  rotuloValor: string;
  itens: ItemDoRanking[];
  noSite: ReadonlySet<string>;
  /** O bot não respondeu: aviso no lugar da lista. */
  indisponivel?: boolean;
}) {
  return (
    <section className="rounded-[3px] border border-line bg-sur p-3" aria-label={titulo}>
      <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-alter-green">{titulo}</h2>
      {indisponivel ? (
        <p className="text-[12px] text-dim">O Junko Bot não respondeu agora. Tenta de novo em instantes.</p>
      ) : itens.length === 0 ? (
        <p className="text-[12px] text-dim">Ninguém no placar ainda.</p>
      ) : (
        <ol className="space-y-1">
          {itens.map((i) => (
            <li key={i.discordId} className="flex items-baseline gap-2 text-[13px]">
              <span className="w-6 shrink-0 text-right font-mono text-[11px] font-bold" style={{ color: COR_POSICAO[i.posicao - 1] ?? '#7A7A88' }}>
                {i.posicao}º
              </span>
              <span className="min-w-0 flex-1 truncate text-[#D6D6E0]">
                {noSite.has(i.discordId) ? (
                  <Link href={`/u/${i.discordId}/`} className="hover:text-cyber-cyan hover:underline">{i.nome}</Link>
                ) : i.nome}
              </span>
              <span className="shrink-0 font-mono text-[12px] font-bold text-[#F2F2F5]">
                {i.valor.toLocaleString('pt-BR')} <span className="text-[9px] font-normal text-dim">{rotuloValor}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
