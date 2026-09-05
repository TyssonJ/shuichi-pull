import { listarPersonagens } from './dados';

export type Resultado = {
  id: string; titulo: string; subtitulo: string; url: string;
};

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

type Entrada = Resultado & { chaves: string };

let indice: Entrada[] | null = null;

function construirIndice(): Entrada[] {
  if (indice) return indice;
  indice = listarPersonagens().map((p) => ({
    id: p.id,
    titulo: p.nome,
    subtitulo: p.talento.pt,
    url: `/elenco/${p.id}/`,
    chaves: normalizar([p.nome, p.talento.pt, p.talento.en, p.jogo].join(' ')),
  }));
  return indice;
}

export function buscar(termo: string): Resultado[] {
  const t = normalizar(termo);
  if (t.length < 2) return [];
  return construirIndice()
    .filter((e) => e.chaves.includes(t))
    .map(({ chaves, ...r }) => r);
}
