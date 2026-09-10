import fs from 'node:fs';
import path from 'node:path';

/**
 * Cada personagem tem um sprite proprio em public/sprites/elenco/<id>.webp,
 * baixado da Danganronpa Fandom wiki por scripts/baixar-sprites.ts. Quem
 * ainda nao tiver arquivo cai na silhueta, para nunca aparecer imagem quebrada.
 */
export const SILHUETA = '/sprites/silhueta.svg';

const RAIZ = path.join(process.cwd(), 'public', 'sprites');

const cache = new Map<string, Set<string>>();

function spritesDisponiveis(pasta: string): Set<string> {
  const guardado = cache.get(pasta);
  if (guardado) return guardado;
  const caminho = path.join(RAIZ, pasta);
  const lista = fs.existsSync(caminho)
    ? new Set(fs.readdirSync(caminho).filter((a) => a.endsWith('.webp')))
    : new Set<string>();
  cache.set(pasta, lista);
  return lista;
}

export function spriteDoPersonagem(id: string): string {
  return spritesDisponiveis('elenco').has(`${id}.webp`)
    ? `/sprites/elenco/${id}.webp`
    : SILHUETA;
}

/**
 * Corpo inteiro so aparece na ficha aberta, que tem altura para ele. Nem todo
 * personagem tem — a Ryoko, por exemplo, so existe como ilustracao — e quem
 * nao tem devolve null para a ficha ficar com o retrato de meio-corpo.
 */
export function spriteInteiroDoPersonagem(id: string): string | null {
  return spritesDisponiveis('fullbody').has(`${id}.webp`)
    ? `/sprites/fullbody/${id}.webp`
    : null;
}
