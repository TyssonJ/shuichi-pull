import type { Item } from './schema-itens';

/**
 * O que a grade de itens realmente desenha. O item completo (receita, todos os
 * pontos de spawn, descrições em dois idiomas…) tem ~3 KB e a grade mostra ~140
 * cartões: mandar tudo pro navegador custava ~450 KB só de dados serializados.
 * O resumo leva o que o cartão usa e nada mais; a ficha completa continua na
 * página do item.
 */
export type ItemResumo = Pick<Item, 'id' | 'nome' | 'categoria' | 'raridade' | 'nivelRaridade' | 'peso' | 'icone'> & {
  /** Tem receita de fabricação. */
  fabricavel: boolean;
  /** Primeiro lugar onde aparece (PT), pra dica ao passar o mouse. */
  local: string | null;
};

export function resumirItem(item: Item): ItemResumo {
  return {
    id: item.id,
    nome: { pt: item.nome.pt, en: item.nome.en },
    categoria: { pt: item.categoria.pt, en: item.categoria.en },
    raridade: { pt: item.raridade.pt, en: item.raridade.en },
    nivelRaridade: item.nivelRaridade,
    peso: item.peso,
    icone: item.icone,
    fabricavel: item.craft !== null,
    local: item.spawns[0]?.local.pt ?? null,
  };
}
