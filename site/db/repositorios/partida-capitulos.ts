import { eq, asc, and } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidaCapitulos } from '../schema';

type Banco = typeof DbClient;
export type CapituloLinha = typeof partidaCapitulos.$inferSelect;

export function criarRepositorioPartidaCapitulos(db: Banco) {
  return {
    async listarPorPartida(partidaId: number): Promise<CapituloLinha[]> {
      return db.select().from(partidaCapitulos)
        .where(eq(partidaCapitulos.partidaId, partidaId))
        .orderBy(asc(partidaCapitulos.numero));
    },

    async salvar(args: {
      partidaId: number; numero: number;
      assassinoDiscordId: string | null; vitimaDiscordId: string | null; afk: string[];
    }) {
      await db.insert(partidaCapitulos).values(args).onConflictDoUpdate({
        target: [partidaCapitulos.partidaId, partidaCapitulos.numero],
        set: {
          assassinoDiscordId: args.assassinoDiscordId,
          vitimaDiscordId: args.vitimaDiscordId,
          afk: args.afk,
        },
      });
    },

    async remover(partidaId: number, numero: number) {
      await db.delete(partidaCapitulos).where(and(
        eq(partidaCapitulos.partidaId, partidaId),
        eq(partidaCapitulos.numero, numero),
      ));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPartidaCapitulos = criarRepositorioPartidaCapitulos(db);
