import { describe, it, expect } from 'vitest';
import { dateDeBrasilia, paraInputBrasilia, formatarDataHoraBR, formatarDataBR } from './fuso';

describe('fuso de Brasília', () => {
  it('lê o valor do input como horário de Brasília (20:00 vira 23:00 UTC)', () => {
    expect(dateDeBrasilia('2026-09-21T20:00').toISOString()).toBe('2026-09-21T23:00:00.000Z');
  });

  it('virada de dia: 22:30 em Brasília já é o dia seguinte em UTC', () => {
    expect(dateDeBrasilia('2026-09-21T22:30').toISOString()).toBe('2026-09-22T01:30:00.000Z');
  });

  it('formato inválido vira Invalid Date, sem chutar', () => {
    expect(Number.isNaN(dateDeBrasilia('').getTime())).toBe(true);
    expect(Number.isNaN(dateDeBrasilia('21/09/2026 20:00').getTime())).toBe(true);
    expect(Number.isNaN(dateDeBrasilia('2026-09-21').getTime())).toBe(true);
  });

  it('ida e volta: o que o host digita é o que a edição mostra', () => {
    for (const v of ['2026-09-21T20:00', '2026-01-01T00:00', '2026-12-31T23:59', '2026-09-22T00:05']) {
      expect(paraInputBrasilia(dateDeBrasilia(v))).toBe(v);
    }
  });

  it('formata em Brasília, não no fuso de quem roda', () => {
    const instante = new Date('2026-09-21T23:00:00Z'); // 20:00 em Brasília
    expect(formatarDataHoraBR(instante)).toContain('20:00');
    expect(formatarDataHoraBR(instante)).toContain('21/09');
    // 01:30 UTC ainda é 22:30 do dia 21 em Brasília:
    expect(formatarDataBR(new Date('2026-09-22T01:30:00Z'))).toBe('21/09/26');
    expect(formatarDataBR(new Date('2026-09-22T01:30:00Z'), true)).toBe('21/09/2026');
  });
});
