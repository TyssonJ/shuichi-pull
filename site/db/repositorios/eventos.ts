import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { eventos } from '../schema';

type Banco = typeof DbClient;
export type NovoEvento = typeof eventos.$inferInsert;

export function criarRepositorioEventos(db: Banco) {
  return {
    async listar() {
      return db.select().from(eventos);
    },
    async buscar(id: string) {
      const linhas = await db.select().from(eventos).where(eq(eventos.id, id));
      return linhas[0] ?? null;
    },
    async criar(dados: NovoEvento) {
      await db.insert(eventos).values(dados);
    },
    async atualizar(id: string, dados: NovoEvento) {
      await db.update(eventos).set(dados).where(eq(eventos.id, id));
    },
    async excluir(id: string) {
      await db.delete(eventos).where(eq(eventos.id, id));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioEventos = criarRepositorioEventos(db);
