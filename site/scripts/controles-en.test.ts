import { describe, it, expect } from 'vitest';
import { extrairTeclas, extrairCards, carregarControlesEn } from './controles-en';

const trecho = `## TABELAS DE TECLAS

### Movement basics

- [WASD]                             Move your character
- [Shift] + [W / WA / WD]            Run
- [Space] + [Ctrl]                   High jump
    nota: Clear obstacles that a normal jump can't.

## CARDS DE MECANICAS (texto integral)

### Movement and camera  (2 cards)

#### Movement   [id: wasd_walk_shift]
gif: /guidebook/assets/mechanics/wasd.gif

W, A, S, D - move in the matching directions.

#### Jump   [id: space]

SPACE - a normal jump.
{"kind": "figure", "src": "x.jpg"}
`;

describe('extrairTeclas', () => {
  it('lê a combinação sem deixar colchete sobrando', () => {
    const t = extrairTeclas(trecho);
    expect(t[0].teclas.map((k) => k.teclas)).toEqual([
      'WASD', 'Shift + W / WA / WD', 'Space + Ctrl',
    ]);
  });

  it('prende a nota na tecla anterior', () => {
    expect(extrairTeclas(trecho)[0].teclas[2].nota).toMatch(/normal jump/);
  });

  it('não confunde os cards com a tabela de teclas', () => {
    expect(extrairTeclas(trecho)).toHaveLength(1);
  });
});

describe('extrairCards', () => {
  it('lê id, título, grupo e texto', () => {
    const c = extrairCards(trecho);
    expect(c).toHaveLength(2);
    expect(c[0]).toMatchObject({
      id: 'wasd_walk_shift', titulo: 'Movement', grupo: 'Movement and camera',
    });
    expect(c[0].gif).toContain('wasd.gif');
  });

  it('tira a contagem de cards do nome do grupo', () => {
    expect(extrairCards(trecho)[0].grupo).not.toMatch(/cards/);
  });

  it('descarta a linha JSON de figura do texto', () => {
    expect(extrairCards(trecho)[1].texto).not.toContain('{');
  });
});

describe('carregarControlesEn', () => {
  it('lê as tabelas e os 52 cards do guidebook', () => {
    const { tabelas, cards } = carregarControlesEn();
    expect(tabelas).toHaveLength(2);
    expect(cards).toHaveLength(52);
  });

  it('nenhuma combinação de teclas fica com colchete', () => {
    const sujas = carregarControlesEn().tabelas
      .flatMap((t) => t.teclas)
      .filter((k) => /[[\]]/.test(k.teclas));
    expect(sujas).toEqual([]);
  });
});
