import { describe, it, expect } from 'vitest';
import { calcularDistribuicao, frasePosicao } from './distribuicao';

describe('calcularDistribuicao', () => {
  const valores = [1, 2, 2, 3, 3, 3, 4];

  it('conta quantos há em cada valor', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.colunas).toEqual([
      { valor: 1, quantidade: 1, ehOValor: false },
      { valor: 2, quantidade: 2, ehOValor: false },
      { valor: 3, quantidade: 3, ehOValor: true },
      { valor: 4, quantidade: 1, ehOValor: false },
    ]);
  });

  it('calcula min, max, média e total', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.min).toBe(1);
    expect(d.max).toBe(4);
    expect(d.total).toBe(7);
    expect(d.media).toBeCloseTo(2.57, 1);
  });

  it('conta quantos estão abaixo, iguais e acima', () => {
    const d = calcularDistribuicao(valores, 3);
    expect(d.abaixo).toBe(3);
    expect(d.iguais).toBe(3);
    expect(d.acima).toBe(1);
  });

  it('cria colunas vazias nos buracos quando recebe passo', () => {
    const d = calcularDistribuicao([10, 20], 10, 5);
    expect(d.colunas.map((c) => c.valor)).toEqual([10, 15, 20]);
    expect(d.colunas[1].quantidade).toBe(0);
  });

  it('reproduz a velocidade real da Chihiro', () => {
    const velocidades = [
      ...Array(7).fill(180), ...Array(3).fill(185), ...Array(10).fill(190),
      ...Array(7).fill(195), ...Array(10).fill(200), ...Array(6).fill(205),
      ...Array(4).fill(210), ...Array(4).fill(215), ...Array(3).fill(220),
      225, 230,
    ];
    const d = calcularDistribuicao(velocidades, 180, 5);
    expect(d.total).toBe(56);
    expect(d.abaixo).toBe(0);
    expect(d.iguais).toBe(7);
    expect(Math.round(d.media)).toBe(199); // media real do elenco: 198,66
  });
});

describe('frasePosicao', () => {
  it('descreve o grupo mais baixo quando maior é melhor', () => {
    const d = calcularDistribuicao([...Array(7).fill(180), ...Array(49).fill(200)], 180, 5);
    expect(frasePosicao(d, true)).toBe('no grupo mais baixo · 7 de 56 empatam');
  });

  it('descreve quantos estão acima quando maior é melhor', () => {
    const d = calcularDistribuicao([...Array(51).fill(5), ...Array(5).fill(10)], 5);
    expect(frasePosicao(d, true)).toBe('5 de 56 estão acima');
  });

  it('inverte a leitura quando menor é melhor', () => {
    const d = calcularDistribuicao([...Array(51).fill(5), ...Array(5).fill(10)], 10);
    expect(frasePosicao(d, false)).toBe('51 de 56 estão melhor');
  });
});
