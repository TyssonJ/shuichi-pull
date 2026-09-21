import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { configuracoes } from '../schema';

type Banco = typeof DbClient;

/** Chaves com este prefixo guardam segredos (hash da chave da API, credencial
 * do bot). Nunca saem de `listar()`, que alimenta páginas e painéis. */
export const PREFIXO_SEGREDO = 'segredo.';

export function criarRepositorioConfiguracoes(db: Banco) {
  return {
    async listar(): Promise<Record<string, string>> {
      const linhas = await db.select().from(configuracoes);
      return Object.fromEntries(
        linhas.filter((l) => !l.chave.startsWith(PREFIXO_SEGREDO)).map((l) => [l.chave, l.valor]),
      );
    },

    /** Leitura direta por chave — o único jeito de ler um segredo. */
    async obter(chave: string): Promise<string | null> {
      const linhas = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave));
      return linhas[0]?.valor ?? null;
    },

    async definir(chave: string, valor: string) {
      await db.insert(configuracoes).values({ chave, valor }).onConflictDoUpdate({
        target: configuracoes.chave,
        set: { valor, atualizadoEm: new Date() },
      });
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioConfiguracoes = criarRepositorioConfiguracoes(db);
