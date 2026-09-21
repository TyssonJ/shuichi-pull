import { eq, desc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { perfilPosts } from '../schema';
import type { AnexoPost } from '../../lib/perfil-posts';

type Banco = typeof DbClient;
export type PerfilPostLinha = typeof perfilPosts.$inferSelect;

export function criarRepositorioPerfilPosts(db: Banco) {
  return {
    /** Mais novos primeiro. */
    async listar(discordId: string): Promise<PerfilPostLinha[]> {
      return db.select().from(perfilPosts).where(eq(perfilPosts.discordId, discordId)).orderBy(desc(perfilPosts.criadoEm), desc(perfilPosts.id));
    },

    async buscar(id: number): Promise<PerfilPostLinha | null> {
      const linhas = await db.select().from(perfilPosts).where(eq(perfilPosts.id, id));
      return linhas[0] ?? null;
    },

    async criar(discordId: string, texto: string, anexos: AnexoPost[]): Promise<number> {
      const [linha] = await db.insert(perfilPosts).values({ discordId, texto, anexos }).returning({ id: perfilPosts.id });
      return linha.id;
    },

    async remover(id: number) {
      await db.delete(perfilPosts).where(eq(perfilPosts.id, id));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPerfilPosts = criarRepositorioPerfilPosts(db);
