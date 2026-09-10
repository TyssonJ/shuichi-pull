import brutoItens from '@/data/itens.json';
import brutoLocais from '@/data/locais.json';
import { validarItens, validarLocais, type Item, type Local } from './schema-itens';

// Valida uma vez no import: dado quebrado derruba o build, não a página.
const itens: Item[] = validarItens(brutoItens);
const locais: Local[] = validarLocais(brutoLocais);

export function listarItens(): Item[] {
  return itens;
}

export function buscarItem(id: string): Item | null {
  return itens.find((i) => i.id === id) ?? null;
}

export function listarLocais(): Local[] {
  return locais;
}

export function buscarLocal(id: string): Local | null {
  return locais.find((l) => l.id === id) ?? null;
}

/**
 * O icone pelo id do item. O loot do mapa guarda so id e nome, entao a pagina
 * do local busca a arte por aqui em vez de duplicar o caminho em locais.json.
 */
const iconePorId = new Map(itens.map((i) => [i.id, i.icone]));

export function iconeDoItem(id: string): string | null {
  return iconePorId.get(id) ?? null;
}

/** Categorias na ordem em que aparecem no filtro, com a contagem. */
export function categoriasComTotal(): { pt: string; en: string; total: number }[] {
  const mapa = new Map<string, { pt: string; en: string; total: number }>();
  for (const i of itens) {
    const atual = mapa.get(i.categoria.en);
    if (atual) atual.total++;
    else mapa.set(i.categoria.en, { ...i.categoria, total: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

/** Quem usa este item como ingrediente — o caminho inverso da receita. */
export function receitasQueUsam(id: string): Item[] {
  return itens.filter((i) => i.craft?.ingredientes.some((ing) => ing.id === id));
}
