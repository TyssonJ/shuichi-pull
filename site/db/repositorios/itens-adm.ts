import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { db as DbClient } from '../client';
import { itensExtras, itensRemovidos } from '../schema';
import { CraftSchema, SpawnSchema, type Item } from '../../lib/schema-itens';
import { montarItem, type DadosItemExtra } from '../../lib/adm/item-extra';

type Banco = typeof DbClient;
type Linha = typeof itensExtras.$inferSelect;

function paraItem(l: Linha): Item {
  // jsonb chega sem tipo garantido: se um dia o formato mudar, o item ainda
  // abre (sem receita/spawn) em vez de derrubar a listagem inteira.
  const craft = CraftSchema.safeParse(l.craft);
  const spawns = z.array(SpawnSchema).safeParse(l.spawns ?? []);
  const dados: DadosItemExtra = {
    nomePt: l.nomePt, nomeEn: l.nomeEn,
    categoriaPt: l.categoriaPt, categoriaEn: l.categoriaEn,
    ramoPt: l.ramoPt ?? '', ramoEn: l.ramoEn ?? '',
    raridadePt: l.raridadePt, raridadeEn: l.raridadeEn, nivelRaridade: l.nivelRaridade,
    peso: l.peso, icone: l.icone,
    descricaoPt: l.descricaoPt, descricaoEn: l.descricaoEn,
    efeitoPt: l.efeitoPt, efeitoEn: l.efeitoEn,
    loja: l.lojaVendedor ? { vendedor: l.lojaVendedor, preco: l.lojaPreco ?? 0 } : null,
    craft: craft.success ? craft.data : null,
    spawns: spawns.success ? spawns.data : [],
  };
  return montarItem(l.id, dados);
}

function paraLinha(item: Item) {
  return {
    nomePt: item.nome.pt, nomeEn: item.nome.en,
    categoriaPt: item.categoria.pt, categoriaEn: item.categoria.en,
    ramoPt: item.ramo.pt, ramoEn: item.ramo.en,
    raridadePt: item.raridade.pt, raridadeEn: item.raridade.en,
    nivelRaridade: item.nivelRaridade,
    peso: item.peso, icone: item.icone,
    descricaoPt: item.descricao?.pt ?? null, descricaoEn: item.descricao?.en ?? null,
    efeitoPt: item.efeito?.pt ?? null, efeitoEn: item.efeito?.en ?? null,
    lojaVendedor: item.loja?.vendedor ?? null, lojaPreco: item.loja?.preco ?? null,
    craft: item.craft, spawns: item.spawns,
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
    async criarExtra(item: Item, autor: string) {
      await db.insert(itensExtras).values({ id: item.id, autor, ...paraLinha(item) });
    },
    async atualizarExtra(item: Item) {
      await db.update(itensExtras).set(paraLinha(item)).where(eq(itensExtras.id, item.id));
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
