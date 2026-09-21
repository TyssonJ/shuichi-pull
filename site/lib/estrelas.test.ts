import { describe, it, expect } from 'vitest';
import { validarAvaliacao, estrelasValidas, COMENTARIO_MAX } from './estrelas';

describe('estrelasValidas', () => {
  it('só inteiros de 0 a 5', () => {
    for (const n of [0, 1, 2, 3, 4, 5]) expect(estrelasValidas(n)).toBe(true);
    for (const n of [-1, 6, 2.5, NaN, Infinity]) expect(estrelasValidas(n)).toBe(false);
    expect(estrelasValidas('3')).toBe(false);
    expect(estrelasValidas(null)).toBe(false);
  });
});

describe('validarAvaliacao', () => {
  it('aceita nota e texto, apara o texto', () => {
    expect(validarAvaliacao(4, '  jogou muito bem  ')).toEqual({ ok: true, valor: { estrelas: 4, comentario: 'jogou muito bem' } });
  });

  it('0 estrelas é uma nota válida', () => {
    expect(validarAvaliacao(0, 'não apareceu na hora').ok).toBe(true);
  });

  it('o texto é obrigatório: vazio, só espaços, null e curto demais são barrados', () => {
    for (const texto of ['', '     ', null, undefined, 'ok']) {
      const r = validarAvaliacao(5, texto as string);
      expect(r.ok).toBe(false);
      expect(!r.ok && r.erro).toContain('Escreva a avaliação');
    }
  });

  it('respeita o limite máximo', () => {
    expect(validarAvaliacao(3, 'a'.repeat(COMENTARIO_MAX)).ok).toBe(true);
    expect(validarAvaliacao(3, 'a'.repeat(COMENTARIO_MAX + 1)).ok).toBe(false);
  });

  it('nota fora de 0–5 é barrada antes de olhar o texto', () => {
    expect(validarAvaliacao(6, 'texto válido aqui')).toEqual({ ok: false, erro: 'A nota vai de 0 a 5 estrelas.' });
    expect(validarAvaliacao(3.5, 'texto válido aqui').ok).toBe(false);
  });
});
