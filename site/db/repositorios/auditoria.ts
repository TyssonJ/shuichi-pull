import { eq, like, and, desc, gte } from 'drizzle-orm';
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

    /** `desde`/`limite` existem pro painel: o gráfico de 7 dias e o feed de
     * 10 linhas não precisam carregar a tabela inteira. */
    async listarAuditoria(
      filtros: { autor?: string; colecao?: string; desde?: Date; limite?: number } = {},
    ): Promise<AuditoriaLinha[]> {
      const condicoes = [];
      if (filtros.autor) condicoes.push(eq(auditoria.autor, filtros.autor));
      if (filtros.colecao) condicoes.push(like(auditoria.alvo, `${filtros.colecao}/%`));
      if (filtros.desde) condicoes.push(gte(auditoria.criadoEm, filtros.desde));

      const consulta = db.select().from(auditoria)
        .where(condicoes.length > 0 ? and(...condicoes) : undefined)
        .orderBy(desc(auditoria.criadoEm));
      return filtros.limite ? await consulta.limit(filtros.limite) : await consulta;
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioAuditoria = criarRepositorioAuditoria(db);
