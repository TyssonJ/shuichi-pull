import { ZodError } from 'zod';
import { ItemSchema, type Item, type Craft, type Spawn } from '../schema-itens';

/** O que o formulário completo de item manda pro servidor. Os pares PT/EN
 * aceitam o EN em branco — nesse caso repete o PT, porque a ficha do item
 * exige os dois idiomas. */
export type DadosItemExtra = {
  nomePt: string; nomeEn: string;
  categoriaPt: string; categoriaEn: string;
  ramoPt: string; ramoEn: string;
  raridadePt: string; raridadeEn: string; nivelRaridade: number;
  peso: number | null;
  icone: string | null;
  descricaoPt: string | null; descricaoEn: string | null;
  efeitoPt: string | null; efeitoEn: string | null;
  loja: { vendedor: string; preco: number } | null;
  craft: Craft | null;
  spawns: Spawn[];
};

const vazio = (s: string | null | undefined) => !s || !s.trim();

function par(pt: string, en: string, padraoPt: string, padraoEn: string) {
  const ptFinal = vazio(pt) ? (vazio(en) ? padraoPt : en.trim()) : pt.trim();
  const enFinal = vazio(en) ? (vazio(pt) ? padraoEn : pt.trim()) : en.trim();
  return { pt: ptFinal, en: enFinal };
}

function parOpcional(pt: string | null, en: string | null) {
  if (vazio(pt) && vazio(en)) return null;
  return par(pt ?? '', en ?? '', '', '');
}

export function montarItem(id: string, d: DadosItemExtra): Item {
  return {
    id,
    nome: par(d.nomePt, d.nomeEn, '', ''),
    categoria: par(d.categoriaPt, d.categoriaEn, 'Diversos', 'Miscellaneous'),
    ramo: par(d.ramoPt, d.ramoEn, 'Diversos', 'Miscellaneous'),
    raridade: par(d.raridadePt, d.raridadeEn, 'Comum', 'Common'),
    nivelRaridade: d.nivelRaridade,
    peso: d.peso,
    icone: vazio(d.icone) ? null : d.icone!.trim(),
    descricao: parOpcional(d.descricaoPt, d.descricaoEn),
    efeito: parOpcional(d.efeitoPt, d.efeitoEn),
    mecanicas: {},
    loja: d.loja && !vazio(d.loja.vendedor) ? { vendedor: d.loja.vendedor.trim(), preco: d.loja.preco } : null,
    craft: d.craft,
    spawns: d.spawns,
    traducaoRevisada: true,
  };
}

/** Monta o item e valida com o mesmo schema do resto do site — assim um
 * item salvo nunca derruba a página dele. Erro em português, com o campo. */
export function validarItemExtra(id: string, d: DadosItemExtra): Item {
  try {
    return ItemSchema.parse(montarItem(id, d));
  } catch (e) {
    if (e instanceof ZodError) {
      const i = e.issues[0];
      throw new Error(`Item inválido em "${i.path.join('.') || 'item'}": ${i.message}`);
    }
    throw e;
  }
}

/** O caminho inverso, pra abrir um extra no formulário de edição. */
export function itemParaDados(item: Item): DadosItemExtra {
  return {
    nomePt: item.nome.pt, nomeEn: item.nome.en,
    categoriaPt: item.categoria.pt, categoriaEn: item.categoria.en,
    ramoPt: item.ramo.pt, ramoEn: item.ramo.en,
    raridadePt: item.raridade.pt, raridadeEn: item.raridade.en, nivelRaridade: item.nivelRaridade,
    peso: item.peso,
    icone: item.icone,
    descricaoPt: item.descricao?.pt ?? null, descricaoEn: item.descricao?.en ?? null,
    efeitoPt: item.efeito?.pt ?? null, efeitoEn: item.efeito?.en ?? null,
    loja: item.loja,
    craft: item.craft,
    spawns: item.spawns,
  };
}
