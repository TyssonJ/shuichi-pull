import fs from 'node:fs';
import path from 'node:path';

/**
 * O doc de controles tem duas partes: tabelas de teclas ("- [W] Descricao")
 * e cards de mecanica ("#### Titulo [id: x]" seguido de gif e texto).
 */
export type Tecla = { teclas: string; descricao: string; nota: string | null };
export type TabelaTeclas = { grupo: string; teclas: Tecla[] };
export type Card = { grupo: string; id: string; titulo: string; texto: string; gif: string | null };

const LINHA_TECLA = /^(\s*)-\s+\[(.+?)\]\s{2,}(.+?)\s*$/;
const NOTA = /^\s*nota:\s*(.+?)\s*$/;

export function extrairTeclas(markdown: string): TabelaTeclas[] {
  const dentro = markdown.split('## TABELAS DE TECLAS')[1]?.split('## CARDS')[0] ?? '';
  const tabelas: TabelaTeclas[] = [];
  let atual: TabelaTeclas | null = null;

  for (const linha of dentro.split(/\r?\n/)) {
    const grupo = /^### (.+)$/.exec(linha);
    if (grupo) {
      atual = { grupo: grupo[1].trim(), teclas: [] };
      tabelas.push(atual);
      continue;
    }
    if (!atual) continue;

    const nota = NOTA.exec(linha);
    if (nota && atual.teclas.length > 0) {
      atual.teclas[atual.teclas.length - 1].nota = nota[1];
      continue;
    }
    const t = LINHA_TECLA.exec(linha);
    // A combinacao pode ter varios colchetes ("[Shift] + [W / WA / WD]"): o
    // fecha-colchetes que encerra a captura e o ultimo, entao sobram internos.
    if (t) {
      atual.teclas.push({
        teclas: t[2].replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim(),
        descricao: t[3].trim(),
        nota: null,
      });
    }
  }

  return tabelas.filter((t) => t.teclas.length > 0);
}

export function extrairCards(markdown: string): Card[] {
  const dentro = markdown.split('## CARDS DE MECANICAS')[1] ?? '';
  const cards: Card[] = [];
  let grupo = '';
  let atual: Card | null = null;
  const corpo: string[] = [];

  const fechar = () => {
    if (!atual) return;
    // Linhas de figura vem como JSON solto no meio do texto; nao sao prosa.
    atual.texto = corpo
      .filter((l) => !l.trim().startsWith('{'))
      .join('\n').trim();
    cards.push(atual);
    corpo.length = 0;
  };

  for (const linha of dentro.split(/\r?\n/)) {
    const g = /^### (.+?)\s*(?:\(\d+ cards?\))?\s*$/.exec(linha);
    const c = /^#### (.+?)\s+\[id:\s*(.+?)\]\s*$/.exec(linha);
    const gif = /^gif:\s*(.+?)\s*$/.exec(linha);

    if (g) { fechar(); atual = null; grupo = g[1].trim(); }
    else if (c) { fechar(); atual = { grupo, id: c[2].trim(), titulo: c[1].trim(), texto: '', gif: null }; }
    else if (gif && atual) atual.gif = gif[1].trim();
    else if (atual) corpo.push(linha);
  }
  fechar();

  return cards.filter((c) => c.texto !== '');
}

export function carregarControlesEn() {
  const caminho = path.join(
    process.cwd(), '..', 'kirigiris-guidebook', '04-controles-e-mecanicas.md'
  );
  const md = fs.readFileSync(caminho, 'utf-8');
  return { tabelas: extrairTeclas(md), cards: extrairCards(md) };
}
