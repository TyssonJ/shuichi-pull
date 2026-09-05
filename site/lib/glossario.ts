import fs from 'node:fs';
import path from 'node:path';

export type CategoriaGlossario =
  | 'items' | 'locations' | 'statusEffects' | 'characters' | 'talents';

const CAMINHO = path.join(
  process.cwd(), '..', 'kirigiris-guidebook', '_raw', 'data', 'i18n', 'glossary.ru-en.json'
);

type Glossario = Record<CategoriaGlossario, Record<string, string>>;

let cache: Glossario | null = null;

export function carregarGlossario(): Glossario {
  if (cache) return cache;
  const bruto = JSON.parse(fs.readFileSync(CAMINHO, 'utf-8')) as Record<string, unknown>;
  cache = {
    items: (bruto.items ?? {}) as Record<string, string>,
    locations: (bruto.locations ?? {}) as Record<string, string>,
    statusEffects: (bruto.statusEffects ?? {}) as Record<string, string>,
    characters: (bruto.characters ?? {}) as Record<string, string>,
    talents: (bruto.talents ?? {}) as Record<string, string>,
  };
  return cache;
}

export function traduzirRuEn(termo: string, categoria: CategoriaGlossario): string {
  return carregarGlossario()[categoria][termo] ?? termo;
}
