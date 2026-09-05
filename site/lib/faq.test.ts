import { describe, it, expect } from 'vitest';
import { listarFaq, faqPorSecao, faqSemTraducao } from './faq';

describe('FAQ', () => {
  it('traz as 51 perguntas do guidebook', () => {
    expect(listarFaq()).toHaveLength(51);
  });

  it('está todo em português', () => {
    expect(faqSemTraducao()).toEqual([]);
  });

  it('agrupa nas sete seções, com o nome em português', () => {
    const secoes = faqPorSecao();
    expect(secoes).toHaveLength(7);
    expect(secoes.map((s) => s.secao)).toContain('Primeiros passos');
  });

  it('dá um id de URL para cada pergunta', () => {
    for (const p of listarFaq()) {
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('não repete id', () => {
    const ids = listarFaq().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nenhuma resposta ficou vazia', () => {
    expect(listarFaq().filter((p) => p.resposta.trim() === '')).toEqual([]);
  });
});
