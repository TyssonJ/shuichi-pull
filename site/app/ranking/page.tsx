import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { ListaRanking } from '@/components/ranking/ListaRanking';
import { lerUrlDoBot } from '@/lib/junko/servico';
import { buscarRankingDoBot, CATEGORIAS_RANKING, type CategoriaRanking } from '@/lib/junko/estatisticas-bot';

export const metadata = { title: 'Ranking — Shuichi Pull' };
// Depende do bot (externo): nada de fixar no build. O cache de 60 s é da própria busca.
export const dynamic = 'force-dynamic';

const PLACARES: Record<CategoriaRanking, { titulo: string; rotuloValor: string }> = {
  riqueza: { titulo: 'RIQUEZA', rotuloValor: 'JCoins' },
  vitorias: { titulo: 'VITÓRIAS', rotuloValor: 'vitórias' },
  // A categoria do bot se chama "assassinatos", mas o número que ele devolve é o de MVPs.
  assassinatos: { titulo: 'MVPS', rotuloValor: 'MVPs' },
};

export default async function PaginaRanking() {
  const url = await lerUrlDoBot();
  const resultados = await Promise.all(CATEGORIAS_RANKING.map((c) => buscarRankingDoBot(url, c)));
  const ids = [...new Set(resultados.flatMap((r) => (r.ok ? r.dados.itens.map((i) => i.discordId) : [])))];
  const noSite = await repositorioUsuarios.existentes(ids);

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">JUNKO BOT</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">RANKING</h1>
      <p className="mb-6 max-w-xl text-[12px] leading-relaxed text-dim">
        Os placares do Junko Bot no Discord: quem tem mais JCoins, mais vitórias e mais MVPs. Quem também tem conta
        no site vira link pro perfil. Atualiza a cada minuto.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIAS_RANKING.map((categoria, i) => {
          const r = resultados[i];
          return (
            <ListaRanking
              key={categoria}
              titulo={PLACARES[categoria].titulo}
              rotuloValor={PLACARES[categoria].rotuloValor}
              itens={r.ok ? r.dados.itens : []}
              noSite={noSite}
              indisponivel={!r.ok}
            />
          );
        })}
      </div>
    </PainelComTrilhas>
  );
}
