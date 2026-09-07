import brutoItens from '@/data/itens.json';
import brutoLocais from '@/data/locais.json';
import { validarItens, validarLocais, type Item, type Local } from './schema-itens';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

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

export async function listarItensComCorrecoes(): Promise<Item[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('itens');
  return aplicarCorrecoes(itens, correcoes);
}

export async function buscarItemComCorrecoes(id: string): Promise<Item | null> {
  const lista = await listarItensComCorrecoes();
  return lista.find((i) => i.id === id) ?? null;
}

export async function listarLocaisComCorrecoes(): Promise<Local[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('locais');
  return aplicarCorrecoes(locais, correcoes);
}

export async function buscarLocalComCorrecoes(id: string): Promise<Local | null> {
  const lista = await listarLocaisComCorrecoes();
  return lista.find((l) => l.id === id) ?? null;
}
