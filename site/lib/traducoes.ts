import elenco from '@/data/traducoes/elenco.pt.json';

const mapa = elenco as Record<string, string>;

export function traduzirPt(chave: string): string | null {
  return mapa[chave] ?? null;
}
