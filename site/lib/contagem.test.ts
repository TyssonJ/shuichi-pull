import { describe, it, expect } from 'vitest';
import { formatarRestante, intervaloDaContagem } from './contagem';

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;

describe('formatarRestante', () => {
  it('passou do horário: AGORA', () => {
    expect(formatarRestante(0)).toBe('AGORA');
    expect(formatarRestante(-5000)).toBe('AGORA');
  });

  it('dias mostram dias e horas', () => {
    expect(formatarRestante(2 * D + 4 * H + 59 * MIN)).toBe('2d 04h');
  });

  it('horas mostram horas e minutos', () => {
    expect(formatarRestante(3 * H + 12 * MIN + 40_000)).toBe('03h 12m');
  });

  it('menos de uma hora mostra minutos e segundos', () => {
    expect(formatarRestante(12 * MIN + 5_000)).toBe('12m 05s');
    expect(formatarRestante(9_000)).toBe('00m 09s');
  });
});

describe('intervaloDaContagem', () => {
  it('atualiza a cada segundo só na última hora', () => {
    expect(intervaloDaContagem(30 * MIN)).toBe(1000);
    expect(intervaloDaContagem(2 * H)).toBe(30_000);
  });
});
