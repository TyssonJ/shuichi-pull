import fs from 'node:fs';
import path from 'node:path';

/**
 * Nem todo item tem icone: as entradas internas do jogo (impressao digital,
 * "arma", "comida") nao tem arte no guidebook. Quem nao tem cai no fallback
 * desenhado na propria interface.
 */
const PASTA = path.join(process.cwd(), 'public', 'icones');

let existentes: Set<string> | null = null;

function disponiveis(): Set<string> {
  if (existentes) return existentes;
  existentes = fs.existsSync(PASTA)
    ? new Set(fs.readdirSync(PASTA).filter((a) => a.endsWith('.webp')))
    : new Set<string>();
  return existentes;
}

export function iconeDoItem(id: string): string | null {
  return disponiveis().has(`${id}.webp`) ? `/icones/${id}.webp` : null;
}
