import { eq, like, and, desc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { auditoria } from '../schema';

type Banco = typeof DbClient;
export type NovaAuditoria = typeof auditoria.$inferInsert;
export type AuditoriaLinha = typeof auditoria.$inferSelect;

export function criarRepositorioAuditoria(db: Banco) {
  return {
    async registrar(args: {
      autor: string; acao: string; alvo: string;
      valorAntigo: string | null; valorNovo: string | null;
    }) {
      await db.insert(auditoria).values(args);
    },

    async listarAuditoria(filtros: { autor?: string; colecao?: string } = {}): Promise<AuditoriaLinha[]> {
      const condicoes = [];
      if (filtros.autor) condicoes.push(eq(auditoria.autor, filtros.autor));
      if (filtros.colecao) condicoes.push(like(auditoria.alvo, `${filtros.colecao}/%`));

      const consulta = db.select().from(auditoria).orderBy(desc(auditoria.criadoEm));
      return condicoes.length > 0 ? consulta.where(and(...condicoes)) : consulta;
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioAuditoria = criarRepositorioAuditoria(db);
