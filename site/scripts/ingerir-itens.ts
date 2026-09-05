import fs from 'node:fs';
import path from 'node:path';
import { traduzirRuEn } from '../lib/glossario';
import { traduzirPt } from '../lib/traducoes';
import { traduzirVocabulario, nivelDaRaridade } from '../lib/vocabulario';
import {
  validarItens, validarLocais,
  type Item, type Local, type Spawn, type Conteiner,
} from '../lib/schema-itens';
import type { Texto } from '../lib/schema';

const RAIZ = path.join(process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data');
const BRUTO = path.join(RAIZ, 'en', 'data.json');
const DROPS = path.join(RAIZ, 'drop-rates.json');

type ItemBruto = {
  name: string; category: string; branch: string; rarity?: string;
  weight?: string; description?: string; effect?: string; id?: string;
  mechanics?: Record<string, string | string[]>;
  shop?: { vendor: string; price: number };
  craft?: {
    ingredients: { name: string; qty: number }[];
    stations: string[]; successChance: string;
  };
};

type FonteBruta = {
  sourceId: string; floor: string; location: string; containerName: string;
  drops: {
    itemName: string; itemId: string;
    quantityRaw: string;
    quantityMin: number | null; quantityMax: number | null; chancePercent: number;
  }[];
};

export function gerarId(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Todo texto do site sai daqui: inglês do glossário, português se houver. */
function texto(ru: string, categoria: 'items' | 'locations'): Texto {
  const en = traduzirRuEn(ru, categoria);
  return { en, pt: traduzirPt(en) ?? en };
}

function vocabulario(ru: string): Texto {
  const t = traduzirVocabulario(ru);
  return t ? { pt: t.pt, en: t.en } : { pt: ru, en: ru };
}

/** hp/hunger vem como texto e cures/applies como lista: vira lista sempre. */
function mecanicas(bruto?: Record<string, string | string[]>): Record<string, string[]> {
  const saida: Record<string, string[]> = {};
  for (const [chave, valor] of Object.entries(bruto ?? {})) {
    saida[chave] = Array.isArray(valor) ? valor : [valor];
  }
  return saida;
}

function numeroOuNulo(valor?: string): number | null {
  if (valor === undefined) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export function ingerir(): { itens: Item[]; locais: Local[] } {
  const bruto = JSON.parse(fs.readFileSync(BRUTO, 'utf-8')) as {
    items: ItemBruto[]; locations: string[];
  };
  const fontes = JSON.parse(fs.readFileSync(DROPS, 'utf-8')) as FonteBruta[];

  // Um id por item: o dado bruto já traz um, e os dois que faltam saem do nome.
  const idPorNomeRu = new Map<string, string>();
  for (const i of bruto.items) {
    idPorNomeRu.set(i.name, gerarId(i.id ?? traduzirRuEn(i.name, 'items')));
  }

  const spawnsPorItem = new Map<string, Spawn[]>();
  const conteineresPorLocal = new Map<string, Conteiner[]>();
  const andarPorLocal = new Map<string, Texto>();

  for (const f of fontes) {
    const local = texto(f.location, 'locations');
    const localId = gerarId(local.en);
    const andar = f.floor ? texto(f.floor, 'locations') : null;
    const conteiner = texto(f.containerName, 'locations');
    if (andar) andarPorLocal.set(localId, andar);

    const itensDaFonte: Conteiner['itens'] = [];

    for (const d of f.drops) {
      const itemId = idPorNomeRu.get(d.itemName) ?? gerarId(d.itemId);
      const nome = texto(d.itemName, 'items');
      // Drop garantido as vezes vem sem faixa de quantidade, so com o texto.
      const qtdMin = d.quantityMin ?? Number(d.quantityRaw) ?? 1;
      const qtdMax = d.quantityMax ?? qtdMin;

      itensDaFonte.push({
        id: itemId, nome,
        chance: d.chancePercent, qtdMin, qtdMax,
      });

      const lista = spawnsPorItem.get(itemId) ?? [];
      lista.push({
        fonteId: f.sourceId, local, localId, andar, conteiner,
        chance: d.chancePercent, qtdMin, qtdMax,
      });
      spawnsPorItem.set(itemId, lista);
    }

    const conteineres = conteineresPorLocal.get(localId) ?? [];
    conteineres.push({ fonteId: f.sourceId, nome: conteiner, itens: itensDaFonte });
    conteineresPorLocal.set(localId, conteineres);
  }

  const itens: Item[] = bruto.items.map((i) => {
    const id = idPorNomeRu.get(i.name)!;
    const descricaoEn = i.description ?? null;
    const efeitoEn = i.effect ?? null;

    return {
      id,
      nome: texto(i.name, 'items'),
      categoria: vocabulario(i.category),
      ramo: vocabulario(i.branch),
      raridade: i.rarity ? vocabulario(i.rarity) : { pt: 'Não informada', en: 'Unknown' },
      nivelRaridade: i.rarity ? nivelDaRaridade(i.rarity) : 0,
      peso: numeroOuNulo(i.weight),
      descricao: descricaoEn ? { en: descricaoEn, pt: traduzirPt(descricaoEn) ?? descricaoEn } : null,
      efeito: efeitoEn ? { en: efeitoEn, pt: traduzirPt(efeitoEn) ?? efeitoEn } : null,
      mecanicas: mecanicas(i.mechanics),
      loja: i.shop ? { vendedor: i.shop.vendor, preco: i.shop.price } : null,
      craft: i.craft
        ? {
            ingredientes: i.craft.ingredients.map((ing) => ({
              id: idPorNomeRu.get(ing.name) ?? null,
              nome: texto(ing.name, 'items'),
              qtd: ing.qty,
            })),
            // As bancadas estao no glossario de itens, nao no de locais.
            bancadas: i.craft.stations.map((b) => texto(b, 'items')),
            chance: i.craft.successChance,
          }
        : null,
      spawns: (spawnsPorItem.get(id) ?? []).sort((a, b) => b.chance - a.chance),
      traducaoRevisada: false,
    };
  });

  // O mapa é a união dos locais canônicos com os que aparecem no loot.
  const idsDeLocais = new Map<string, Texto>();
  for (const l of bruto.locations) {
    const t = texto(l, 'locations');
    idsDeLocais.set(gerarId(t.en), t);
  }
  for (const f of fontes) {
    const t = texto(f.location, 'locations');
    idsDeLocais.set(gerarId(t.en), t);
  }

  const locais: Local[] = [...idsDeLocais.entries()].map(([id, nome]) => {
    const conteineres = conteineresPorLocal.get(id) ?? [];
    return {
      id, nome,
      andar: andarPorLocal.get(id) ?? null,
      conteineres,
      totalItens: new Set(conteineres.flatMap((c) => c.itens.map((i) => i.id))).size,
      traducaoRevisada: false,
    };
  }).sort((a, b) => a.nome.pt.localeCompare(b.nome.pt, 'pt-BR'));

  return { itens: validarItens(itens), locais: validarLocais(locais) };
}

if (process.argv[1]?.endsWith('ingerir-itens.ts')) {
  const { itens, locais } = ingerir();
  const pasta = path.join(process.cwd(), 'data');
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, 'itens.json'), JSON.stringify(itens, null, 2), 'utf-8');
  fs.writeFileSync(path.join(pasta, 'locais.json'), JSON.stringify(locais, null, 2), 'utf-8');
  console.log(`${itens.length} itens e ${locais.length} locais gravados em ${pasta}`);
}
