import { describe, it, expect } from 'vitest';
import { conteudoIniciantes } from './iniciantes';

describe('conteúdo da área de iniciantes', () => {
  const c = conteudoIniciantes();

  it('tem chamada e resumo', () => {
    expect(c.chamada.length).toBeGreaterThan(10);
    expect(c.resumo.length).toBeGreaterThan(30);
  });

  it('descreve as quatro fases do capítulo', () => {
    expect(c.fases).toHaveLength(4);
    expect(c.fases.map((f) => f.nome)).toEqual([
      'Cotidiano', 'Crime', 'Investigação', 'Julgamento',
    ]);
  });

  it('numera os passos em sequência, sem buraco', () => {
    expect(c.passos.map((p) => p.n)).toEqual(
      c.passos.map((_, i) => i + 1)
    );
  });

  it('diz onde achar o UID', () => {
    expect(c.dicas.some((d) => /UID/.test(d))).toBe(true);
  });

  it('todo link aponta para um endereço absoluto', () => {
    for (const l of c.links) expect(l.url).toMatch(/^https:\/\//);
  });

  it('não repete id de bloco', () => {
    const ids = c.blocos.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
