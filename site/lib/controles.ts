import bruto from '@/content/controles.json';
import pt from '@/content/controles.pt.json';

export type Tecla = { teclas: string; descricao: string; nota: string | null };
export type TabelaTeclas = { grupo: string; teclas: Tecla[] };
export type Card = {
  id: string; grupo: string; titulo: string; texto: string; traducaoRevisada: boolean;
};

type BrutoTecla = { teclas: string; descricao: string; nota: string | null };
type BrutoCard = { grupo: string; id: string; titulo: string; texto: string };

const grupos = pt.grupos as Record<string, string>;
const teclasPt = pt.teclas as Record<string, string>;
const notasPt = pt.notas as Record<string, string>;
const cardsPt = pt.cards as Record<string, { titulo: string; texto: string }>;

export function tabelasDeTeclas(): TabelaTeclas[] {
  return (bruto.tabelas as { grupo: string; teclas: BrutoTecla[] }[]).map((t) => ({
    grupo: grupos[t.grupo] ?? t.grupo,
    teclas: t.teclas.map((k) => ({
      teclas: k.teclas,
      descricao: teclasPt[k.descricao] ?? k.descricao,
      nota: k.nota ? notasPt[k.nota] ?? k.nota : null,
    })),
  }));
}

export function cardsDeMecanica(): Card[] {
  return (bruto.cards as BrutoCard[]).map((c) => {
    const t = cardsPt[c.id];
    return {
      id: c.id,
      grupo: grupos[c.grupo] ?? c.grupo,
      titulo: t?.titulo ?? c.titulo,
      texto: t?.texto ?? c.texto,
      traducaoRevisada: false,
    };
  });
}

export function mecanicasPorGrupo(): { grupo: string; cards: Card[] }[] {
  const mapa = new Map<string, Card[]>();
  for (const c of cardsDeMecanica()) mapa.set(c.grupo, [...(mapa.get(c.grupo) ?? []), c]);
  return [...mapa.entries()].map(([grupo, cards]) => ({ grupo, cards }));
}

/** O que o ADM ainda precisa traduzir. */
export function mecanicasSemTraducao(): string[] {
  return (bruto.cards as BrutoCard[]).filter((c) => !cardsPt[c.id]).map((c) => c.id);
}
