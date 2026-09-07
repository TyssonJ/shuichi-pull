import conteudo from '@/content/faq.pt.json';
import bruto from '@/content/faq.json';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

export type Pergunta = {
  id: string;
  secao: string;
  pergunta: string;
  resposta: string;
  traducaoRevisada: boolean;
};

type Traducao = { pergunta: string; resposta: string };

const traducoes = conteudo.perguntas as Record<string, Traducao>;
const secoesPt = conteudo.secoes as Record<string, string>;

// A pergunta em inglês é a junção entre o guidebook e a tradução.
const perguntas: Pergunta[] = (bruto as { secao: string; pergunta: string; resposta: string }[])
  .map((p) => {
    const pt = traducoes[p.pergunta];
    return {
      id: p.pergunta
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        .slice(0, 60),
      secao: secoesPt[p.secao] ?? p.secao,
      pergunta: pt?.pergunta ?? p.pergunta,
      resposta: pt?.resposta ?? p.resposta,
      traducaoRevisada: false,
    };
  });

export function listarFaq(): Pergunta[] {
  return perguntas;
}

export function faqPorSecao(): { secao: string; perguntas: Pergunta[] }[] {
  const mapa = new Map<string, Pergunta[]>();
  for (const p of perguntas) mapa.set(p.secao, [...(mapa.get(p.secao) ?? []), p]);
  return [...mapa.entries()].map(([secao, perguntas]) => ({ secao, perguntas }));
}

/** Perguntas ainda sem tradução: o que o ADM precisa atacar primeiro. */
export function faqSemTraducao(): Pergunta[] {
  return (bruto as { pergunta: string }[])
    .filter((p) => !traducoes[p.pergunta])
    .map((p) => perguntas.find((x) => x.pergunta === p.pergunta)!)
    .filter(Boolean);
}

export async function listarFaqComCorrecoes(): Promise<Pergunta[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('faq');
  return aplicarCorrecoes(perguntas, correcoes);
}

export async function faqPorSecaoComCorrecoes(): Promise<{ secao: string; perguntas: Pergunta[] }[]> {
  const lista = await listarFaqComCorrecoes();
  const mapa = new Map<string, Pergunta[]>();
  for (const p of lista) mapa.set(p.secao, [...(mapa.get(p.secao) ?? []), p]);
  return [...mapa.entries()].map(([secao, perguntas]) => ({ secao, perguntas }));
}
