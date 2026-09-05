/**
 * Categorias, raridades e ramos vêm em russo no dado bruto e formam um
 * vocabulário pequeno e fechado — cabe aqui, junto do código, em vez de virar
 * mais um arquivo de tradução.
 */
export type Termo = { pt: string; en: string };

const CATEGORIAS: Record<string, Termo> = {
  'Ресурс': { pt: 'Recurso', en: 'Resource' },
  'Расходник': { pt: 'Consumível', en: 'Consumable' },
  'Прочее': { pt: 'Diversos', en: 'Miscellaneous' },
  'Оружие/Инструмент': { pt: 'Arma/Ferramenta', en: 'Weapon/Tool' },
  'Снаряжение': { pt: 'Equipamento', en: 'Equipment' },
};

const RAMOS: Record<string, Termo> = {
  'Инженерия': { pt: 'Engenharia', en: 'Engineering' },
  'Универсальные': { pt: 'Universais', en: 'Universal' },
  'Прочее': { pt: 'Diversos', en: 'Miscellaneous' },
  'Медицина': { pt: 'Medicina', en: 'Medicine' },
  'Еда': { pt: 'Comida', en: 'Food' },
};

/** Da mais comum para a mais rara — a ordem importa na listagem e na cor. */
export const RARIDADES: (Termo & { ru: string; nivel: number })[] = [
  { ru: 'Обычный', pt: 'Comum', en: 'Common', nivel: 1 },
  { ru: 'Необычный', pt: 'Incomum', en: 'Uncommon', nivel: 2 },
  { ru: 'Редкий', pt: 'Raro', en: 'Rare', nivel: 3 },
  { ru: 'Очень редкий', pt: 'Muito raro', en: 'Very Rare', nivel: 4 },
  { ru: 'Легендарный', pt: 'Lendário', en: 'Legendary', nivel: 5 },
];

const POR_RARIDADE = new Map(RARIDADES.map((r) => [r.ru, r]));

export function traduzirVocabulario(termo: string): Termo | null {
  const raridade = POR_RARIDADE.get(termo);
  if (raridade) return { pt: raridade.pt, en: raridade.en };
  return CATEGORIAS[termo] ?? RAMOS[termo] ?? null;
}

export function nivelDaRaridade(termo: string): number {
  return POR_RARIDADE.get(termo)?.nivel ?? 0;
}
