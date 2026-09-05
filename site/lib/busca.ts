import { listarPersonagens } from './dados';
import { listarItens, listarLocais } from './itens';

export type Tipo = 'personagem' | 'item' | 'local';

export type Resultado = {
  id: string; titulo: string; subtitulo: string; url: string; tipo: Tipo;
};

function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

type Entrada = Resultado & { chaves: string };

let indice: Entrada[] | null = null;

function construirIndice(): Entrada[] {
  if (indice) return indice;

  const personagens: Entrada[] = listarPersonagens().map((p) => ({
    id: p.id,
    titulo: p.nome,
    subtitulo: p.talento.pt,
    url: `/elenco/${p.id}/`,
    tipo: 'personagem',
    chaves: normalizar([p.nome, p.talento.pt, p.talento.en, p.jogo].join(' ')),
  }));

  const itens: Entrada[] = listarItens().map((i) => ({
    id: i.id,
    titulo: i.nome.pt,
    subtitulo: `${i.categoria.pt} · ${i.raridade.pt}`,
    url: `/itens/${i.id}/`,
    tipo: 'item',
    chaves: normalizar(
      [i.nome.pt, i.nome.en, i.categoria.pt, i.ramo.pt, i.raridade.pt].join(' ')
    ),
  }));

  const locais: Entrada[] = listarLocais().map((l) => ({
    id: l.id,
    titulo: l.nome.pt,
    subtitulo: l.andar ? `Local · ${l.andar.pt}` : 'Local',
    url: `/mapa/${l.id}/`,
    tipo: 'local',
    chaves: normalizar([l.nome.pt, l.nome.en, l.andar?.pt ?? ''].join(' ')),
  }));

  indice = [...personagens, ...itens, ...locais];
  return indice;
}

export function buscar(termo: string): Resultado[] {
  const t = normalizar(termo);
  if (t.length < 2) return [];

  // Quem começa com o termo aparece antes de quem só o contém no meio.
  return construirIndice()
    .filter((e) => e.chaves.includes(t))
    .sort((a, b) => {
      const peso = (e: Entrada) => (normalizar(e.titulo).startsWith(t) ? 0 : 1);
      return peso(a) - peso(b) || a.titulo.localeCompare(b.titulo, 'pt-BR');
    })
    .map(({ chaves, ...r }) => r);
}
