import fs from 'node:fs';
import path from 'node:path';

/**
 * Cada personagem tem um sprite proprio em public/sprites/elenco/<id>.webp,
 * baixado da Danganronpa Fandom wiki por scripts/baixar-sprites.ts. Quem
 * ainda nao tiver arquivo cai na silhueta, para nunca aparecer imagem quebrada.
 */
export const SILHUETA = '/sprites/silhueta.svg';

const PASTA = path.join(process.cwd(), 'public', 'sprites', 'elenco');

let existentes: Set<string> | null = null;

function spritesDisponiveis(): Set<string> {
  if (existentes) return existentes;
  existentes = fs.existsSync(PASTA)
    ? new Set(fs.readdirSync(PASTA).filter((a) => a.endsWith('.webp')))
    : new Set<string>();
  return existentes;
}

export function spriteDoPersonagem(id: string): string {
  return spritesDisponiveis().has(`${id}.webp`)
    ? `/sprites/elenco/${id}.webp`
    : SILHUETA;
}
