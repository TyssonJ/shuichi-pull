import { describe, it, expect } from 'vitest';
import { faceDoEstado, falaDoEstado } from './alter-ego';

describe('faceDoEstado', () => {
  it('usa sprite quando o estado tem arte própria', () => {
    const f = faceDoEstado('ocioso');
    expect(f.tipo).toBe('sprite');
    expect(f.tipo === 'sprite' && f.src).toMatch(/\.webp$/);
  });

  it('usa kaomoji quando o estado não tem sprite', () => {
    expect(faceDoEstado('item-raro')).toEqual({ tipo: 'kaomoji', texto: '(・o・)' });
    expect(faceDoEstado('carregando')).toEqual({ tipo: 'kaomoji', texto: '(－ω－) zZ' });
    expect(faceDoEstado('erro-404')).toEqual({ tipo: 'kaomoji', texto: '(╥﹏╥)' });
  });

  it('cobre todos os estados sem quebrar', () => {
    const estados = ['ocioso','busca-com-resultado','busca-sem-resultado',
      'item-raro','primeira-visita','carregando','erro-404'] as const;
    for (const e of estados) expect(faceDoEstado(e)).toBeDefined();
  });
});

describe('falaDoEstado', () => {
  it('devolve a fala do estado', () => {
    expect(falaDoEstado('erro-404')).toBe('Essa página não existe...');
  });

  it('substitui variáveis na fala', () => {
    expect(falaDoEstado('busca-com-resultado', { n: 12 })).toBe('Achei 12 resultados!');
  });
});
