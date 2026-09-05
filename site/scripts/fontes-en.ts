import fs from 'node:fs';
import path from 'node:path';

/**
 * O glossario RU->EN nao cobre nome de conteiner ("Armarios ao lado da
 * bancada"). O guidebook em markdown cobre: cada fonte de loot aparece com o
 * proprio src_NNN e os nomes ja em ingles. E dai que sai o EN dos conteineres.
 */
export type FonteEn = { conteiner: string; local: string; andar: string };

const LINHA =
  /^## .+?\s+`(src_\d+)`\s*$\n- tipo: \S+ \| andar: (.*?) \| local: (.*?) \| container: (.*?)\s*$/gm;

export function extrairFontes(markdown: string): Map<string, FonteEn> {
  const fontes = new Map<string, FonteEn>();
  for (const m of markdown.matchAll(LINHA)) {
    const [, id, andar, local, conteiner] = m;
    fontes.set(id, { andar: andar.trim(), local: local.trim(), conteiner: conteiner.trim() });
  }
  return fontes;
}

export function carregarFontesEn(): Map<string, FonteEn> {
  const caminho = path.join(
    process.cwd(), '..', 'kirigiris-guidebook', '06-drop-rates.md'
  );
  return extrairFontes(fs.readFileSync(caminho, 'utf-8'));
}
