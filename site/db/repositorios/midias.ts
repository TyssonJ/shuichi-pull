import { eq, and, gte, sql } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { midias } from '../schema';

type Banco = typeof DbClient;
export type MidiaLinha = typeof midias.$inferSelect;

export function criarRepositorioMidias(db: Banco) {
  return {
    /** Chamado quando o Vercel Blob avisa que o envio terminou. Repetir é seguro (url é única). */
    async registrar(dados: { url: string; discordId: string; tipo: string; tipoMime: string | null }) {
      await db.insert(midias).values(dados).onConflictDoNothing();
    },

    /** Quantos arquivos a pessoa enviou nas últimas 24 h — a trava diária de envio. */
    async contarDoDia(discordId: string): Promise<number> {
      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [linha] = await db.select({ n: sql<number>`count(*)::int` }).from(midias)
        .where(and(eq(midias.discordId, discordId), gte(midias.criadoEm, desde)));
      return linha?.n ?? 0;
    },

    async buscarPorUrl(url: string): Promise<MidiaLinha | null> {
      const linhas = await db.select().from(midias).where(eq(midias.url, url));
      return linhas[0] ?? null;
    },

    async remover(url: string) {
      await db.delete(midias).where(eq(midias.url, url));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioMidias = criarRepositorioMidias(db);
