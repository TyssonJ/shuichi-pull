import { eq, asc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { eventoComentarios } from '../schema';

type Banco = typeof DbClient;

export function criarRepositorioEventoComentarios(db: Banco) {
  return {
    async listar(eventoId: string) {
      return db
        .select()
        .from(eventoComentarios)
        .where(eq(eventoComentarios.eventoId, eventoId))
        .orderBy(asc(eventoComentarios.criadoEm));
    },
    async buscar(id: number) {
      const linhas = await db.select().from(eventoComentarios).where(eq(eventoComentarios.id, id));
      return linhas[0] ?? null;
    },
    async criar(eventoId: string, discordId: string, texto: string) {
      await db.insert(eventoComentarios).values({ eventoId, discordId, texto });
    },
    async remover(id: number) {
      await db.delete(eventoComentarios).where(eq(eventoComentarios.id, id));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioEventoComentarios = criarRepositorioEventoComentarios(db);
