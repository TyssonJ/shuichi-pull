import { eq, and, desc, asc, gt } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidaAvaliacoes } from '../schema';
import type { AvaliacaoRecebida } from '@/lib/avaliacoes-perfil';
import type { AvaliacaoExterna } from '@/lib/junko/avaliacoes';

type Banco = typeof DbClient;
export type AvaliacaoLinha = typeof partidaAvaliacoes.$inferSelect;

/** Avaliação do site como o Junko Bot a recebe: sem o avaliador, de propósito. */
export type AvaliacaoParaOBot = {
  id: number; partidaId: number | null; avaliadoDiscordId: string; estrelas: number;
  comentario: string | null; criadoEm: Date;
};

export function criarRepositorioPartidaAvaliacoes(db: Banco) {
  return {
    async listarPorPartida(partidaId: number): Promise<AvaliacaoLinha[]> {
      return db.select().from(partidaAvaliacoes).where(eq(partidaAvaliacoes.partidaId, partidaId));
    },

    /** O que um jogador recebeu, pro perfil público (site + Junko Bot). De
     * propósito NÃO seleciona avaliadorDiscordId nem partidaId: quem vê o
     * perfil (ou qualquer coisa que chame isto) não tem como descobrir quem avaliou. */
    async listarRecebidas(avaliadoDiscordId: string): Promise<AvaliacaoRecebida[]> {
      const linhas = await db.select({
        id: partidaAvaliacoes.id,
        estrelas: partidaAvaliacoes.estrelas,
        comentario: partidaAvaliacoes.comentario,
        criadoEm: partidaAvaliacoes.criadoEm,
        origem: partidaAvaliacoes.origem,
      }).from(partidaAvaliacoes)
        .where(eq(partidaAvaliacoes.avaliadoDiscordId, avaliadoDiscordId))
        .orderBy(desc(partidaAvaliacoes.criadoEm));
      return linhas.map((l) => ({ ...l, origem: l.origem === 'junko' ? 'junko' : 'site' }));
    },

    /** Moderação: ADM apaga uma avaliação abusiva pelo id, sem precisar
     * saber (nem poder ver) quem a escreveu. */
    async removerPorId(id: number) {
      await db.delete(partidaAvaliacoes).where(eq(partidaAvaliacoes.id, id));
    },

    /** Avaliar de novo substitui a avaliação anterior — só uma vale por par
     * avaliador/avaliado na partida. Devolve o id da avaliação. */
    async avaliar(args: {
      partidaId: number; avaliadorDiscordId: string; avaliadoDiscordId: string;
      estrelas: number; comentario: string;
    }): Promise<number> {
      const [linha] = await db.insert(partidaAvaliacoes).values({ ...args, origem: 'site' }).onConflictDoUpdate({
        target: [partidaAvaliacoes.partidaId, partidaAvaliacoes.avaliadorDiscordId, partidaAvaliacoes.avaliadoDiscordId],
        set: { estrelas: args.estrelas, comentario: args.comentario, criadoEm: new Date() },
      }).returning({ id: partidaAvaliacoes.id });
      return linha.id;
    },

    async remover(partidaId: number, avaliadorDiscordId: string, avaliadoDiscordId: string) {
      await db.delete(partidaAvaliacoes).where(and(
        eq(partidaAvaliacoes.partidaId, partidaId),
        eq(partidaAvaliacoes.avaliadorDiscordId, avaliadorDiscordId),
        eq(partidaAvaliacoes.avaliadoDiscordId, avaliadoDiscordId),
      ));
    },

    /**
     * Grava avaliações que vieram do Junko Bot. Idempotente: o par
     * (origem 'junko', externoId) é único, então repetir a importação
     * atualiza em vez de duplicar. Sem partida do site (partidaId nulo).
     */
    async importarDoJunko(itens: AvaliacaoExterna[]): Promise<number> {
      for (const i of itens) {
        await db.insert(partidaAvaliacoes).values({
          partidaId: null,
          avaliadorDiscordId: i.avaliadorDiscordId ?? 'junko-bot',
          avaliadoDiscordId: i.avaliadoDiscordId,
          estrelas: i.estrelas,
          comentario: i.comentario,
          origem: 'junko',
          externoId: i.externoId,
          ...(i.criadoEm ? { criadoEm: i.criadoEm } : {}),
        }).onConflictDoUpdate({
          target: [partidaAvaliacoes.origem, partidaAvaliacoes.externoId],
          set: { estrelas: i.estrelas, comentario: i.comentario, avaliadoDiscordId: i.avaliadoDiscordId },
        });
      }
      return itens.length;
    },

    /** Avaliações dadas no SITE, mais antigas primeiro, depois de `desde` —
     * é o que o bot puxa. Só origem 'site' (o bot não recebe de volta o que
     * ele mesmo mandou) e nunca o avaliador. */
    async listarDoSiteParaOBot(desde: Date | null, limite: number): Promise<AvaliacaoParaOBot[]> {
      return db.select({
        id: partidaAvaliacoes.id,
        partidaId: partidaAvaliacoes.partidaId,
        avaliadoDiscordId: partidaAvaliacoes.avaliadoDiscordId,
        estrelas: partidaAvaliacoes.estrelas,
        comentario: partidaAvaliacoes.comentario,
        criadoEm: partidaAvaliacoes.criadoEm,
      }).from(partidaAvaliacoes)
        .where(and(
          eq(partidaAvaliacoes.origem, 'site'),
          ...(desde ? [gt(partidaAvaliacoes.criadoEm, desde)] : []),
        ))
        .orderBy(asc(partidaAvaliacoes.criadoEm))
        .limit(limite);
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPartidaAvaliacoes = criarRepositorioPartidaAvaliacoes(db);
