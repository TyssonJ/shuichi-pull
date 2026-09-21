import { eq, and, asc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { conteudoExtras, conteudoRemovidos } from '../schema';
import type { ColecaoConteudo } from '../../lib/adm/conteudo';

type Banco = typeof DbClient;
export type ConteudoExtra = { id: string; dados: Record<string, string> };

export function criarRepositorioConteudoAdm(db: Banco) {
  const alvo = (colecao: ColecaoConteudo, id: string) =>
    and(eq(conteudoExtras.colecao, colecao), eq(conteudoExtras.id, id));

  return {
    /** Na ordem em que foram criados: quem cria depois aparece depois. */
    async listarExtras(colecao: ColecaoConteudo): Promise<ConteudoExtra[]> {
      const linhas = await db.select().from(conteudoExtras)
        .where(eq(conteudoExtras.colecao, colecao)).orderBy(asc(conteudoExtras.criadoEm));
      return linhas.map((l) => ({ id: l.id, dados: l.dados }));
    },

    async buscarExtra(colecao: ColecaoConteudo, id: string): Promise<ConteudoExtra | null> {
      const linhas = await db.select().from(conteudoExtras).where(alvo(colecao, id));
      return linhas[0] ? { id: linhas[0].id, dados: linhas[0].dados } : null;
    },

    async criarExtra(colecao: ColecaoConteudo, id: string, dados: Record<string, string>, autor: string) {
      await db.insert(conteudoExtras).values({ colecao, id, dados, autor });
    },

    async atualizarExtra(colecao: ColecaoConteudo, id: string, dados: Record<string, string>) {
      await db.update(conteudoExtras).set({ dados }).where(alvo(colecao, id));
    },

    async excluirExtra(colecao: ColecaoConteudo, id: string) {
      await db.delete(conteudoExtras).where(alvo(colecao, id));
    },

    async listarRemovidos(colecao: ColecaoConteudo): Promise<Set<string>> {
      const linhas = await db.select().from(conteudoRemovidos).where(eq(conteudoRemovidos.colecao, colecao));
      return new Set(linhas.map((l) => l.registroId));
    },

    async ocultar(colecao: ColecaoConteudo, registroId: string, autor: string) {
      await db.insert(conteudoRemovidos).values({ colecao, registroId, autor }).onConflictDoNothing();
    },

    async restaurar(colecao: ColecaoConteudo, registroId: string) {
      await db.delete(conteudoRemovidos).where(
        and(eq(conteudoRemovidos.colecao, colecao), eq(conteudoRemovidos.registroId, registroId)),
      );
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioConteudoAdm = criarRepositorioConteudoAdm(db);
