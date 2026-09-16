import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { itensExtras, itensRemovidos } from '../schema';
import type { Item } from '../../lib/schema-itens';

type Banco = typeof DbClient;
export type NovoItemExtra = typeof itensExtras.$inferInsert;

function paraItem(linha: typeof itensExtras.$inferSelect): Item {
  return {
    id: linha.id,
    nome: { pt: linha.nomePt, en: linha.nomeEn },
    categoria: { pt: linha.categoriaPt, en: linha.categoriaEn },
    ramo: { pt: 'Diversos', en: 'Miscellaneous' },
    raridade: { pt: linha.raridadePt, en: linha.raridadeEn },
    nivelRaridade: linha.nivelRaridade,
    peso: linha.peso,
    icone: linha.icone,
    descricao: linha.descricaoPt ? { pt: linha.descricaoPt, en: linha.descricaoPt } : null,
    efeito: null,
    mecanicas: {},
    loja: null,
    craft: null,
    spawns: [],
    traducaoRevisada: true,
  };
}

export function criarRepositorioItensAdm(db: Banco) {
  return {
    async listarExtras(): Promise<Item[]> {
      const linhas = await db.select().from(itensExtras);
      return linhas.map(paraItem);
    },
    async listarRemovidos(): Promise<Set<string>> {
      const linhas = await db.select().from(itensRemovidos);
      return new Set(linhas.map((l) => l.itemId));
    },
    async criarExtra(dados: NovoItemExtra) {
      await db.insert(itensExtras).values(dados);
    },
    /** Some com o item — se for um extra criado pelo ADM, apaga de vez; se
     * for item do guidebook, só marca como removido (o dado-fonte continua
     * intacto em data/itens.json). */
    async excluir(id: string, autor: string) {
      const extra = await db.select().from(itensExtras).where(eq(itensExtras.id, id));
      if (extra.length > 0) {
        await db.delete(itensExtras).where(eq(itensExtras.id, id));
        return;
      }
      await db.insert(itensRemovidos).values({ itemId: id, autor }).onConflictDoNothing();
    },
    async restaurar(id: string) {
      await db.delete(itensRemovidos).where(eq(itensRemovidos.itemId, id));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioItensAdm = criarRepositorioItensAdm(db);
