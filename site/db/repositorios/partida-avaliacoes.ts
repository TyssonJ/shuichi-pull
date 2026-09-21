import { eq, and, desc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidaAvaliacoes } from '../schema';
import type { AvaliacaoRecebida } from '@/lib/avaliacoes-perfil';

type Banco = typeof DbClient;
export type AvaliacaoLinha = typeof partidaAvaliacoes.$inferSelect;

export function criarRepositorioPartidaAvaliacoes(db: Banco) {
  return {
    async listarPorPartida(partidaId: number): Promise<AvaliacaoLinha[]> {
      return db.select().from(partidaAvaliacoes).where(eq(partidaAvaliacoes.partidaId, partidaId));
    },

    /** O que um jogador recebeu dos colegas, pro perfil público. De propósito
     * NÃO seleciona avaliadorDiscordId nem partidaId: quem vê o perfil (ou
     * qualquer coisa que chame isto) não tem como descobrir quem avaliou. */
    async listarRecebidas(avaliadoDiscordId: string): Promise<AvaliacaoRecebida[]> {
      const linhas = await db.select({
        id: partidaAvaliacoes.id,
        tipo: partidaAvaliacoes.tipo,
        comentario: partidaAvaliacoes.comentario,
        criadoEm: partidaAvaliacoes.criadoEm,
      }).from(partidaAvaliacoes)
        .where(eq(partidaAvaliacoes.avaliadoDiscordId, avaliadoDiscordId))
        .orderBy(desc(partidaAvaliacoes.criadoEm));
      return linhas;
    },

    /** Moderação: ADM apaga uma avaliação abusiva pelo id, sem precisar
     * saber (nem poder ver) quem a escreveu. */
    async removerPorId(id: number) {
      await db.delete(partidaAvaliacoes).where(eq(partidaAvaliacoes.id, id));
    },

    /** Avaliar de novo (like -> dislike, ou o mesmo tipo de novo) substitui
     * a avaliação anterior — só uma vale por par avaliador/avaliado. */
    async avaliar(args: {
      partidaId: number; avaliadorDiscordId: string; avaliadoDiscordId: string;
      tipo: 'like' | 'dislike'; comentario: string | null;
    }) {
      await db.insert(partidaAvaliacoes).values(args).onConflictDoUpdate({
        target: [partidaAvaliacoes.partidaId, partidaAvaliacoes.avaliadorDiscordId, partidaAvaliacoes.avaliadoDiscordId],
        set: { tipo: args.tipo, comentario: args.comentario, criadoEm: new Date() },
      });
    },

    async remover(partidaId: number, avaliadorDiscordId: string, avaliadoDiscordId: string) {
      await db.delete(partidaAvaliacoes).where(and(
        eq(partidaAvaliacoes.partidaId, partidaId),
        eq(partidaAvaliacoes.avaliadorDiscordId, avaliadorDiscordId),
        eq(partidaAvaliacoes.avaliadoDiscordId, avaliadoDiscordId),
      ));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPartidaAvaliacoes = criarRepositorioPartidaAvaliacoes(db);
