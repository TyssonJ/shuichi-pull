import { eq, and } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidaAvaliacoes } from '../schema';

type Banco = typeof DbClient;
export type AvaliacaoLinha = typeof partidaAvaliacoes.$inferSelect;

export function criarRepositorioPartidaAvaliacoes(db: Banco) {
  return {
    async listarPorPartida(partidaId: number): Promise<AvaliacaoLinha[]> {
      return db.select().from(partidaAvaliacoes).where(eq(partidaAvaliacoes.partidaId, partidaId));
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
