import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { codigos } from '../schema';

type Banco = typeof DbClient;
export type NovoCodigo = typeof codigos.$inferInsert;
type CodigoSelecionado = typeof codigos.$inferSelect;

export function criarRepositorioCodigos(db: Banco) {
  return {
    async listar() {
      return db.select().from(codigos);
    },
    async buscar(codigo: string): Promise<CodigoSelecionado | null> {
      const linhas = await db.select().from(codigos).where(eq(codigos.codigo, codigo));
      return linhas[0] ?? null;
    },
    async criar(dados: NovoCodigo) {
      await db.insert(codigos).values(dados);
    },
    async atualizar(codigo: string, dados: NovoCodigo) {
      await db.update(codigos).set(dados).where(eq(codigos.codigo, codigo));
    },
    async excluir(codigo: string) {
      await db.delete(codigos).where(eq(codigos.codigo, codigo));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioCodigos = criarRepositorioCodigos(db);
