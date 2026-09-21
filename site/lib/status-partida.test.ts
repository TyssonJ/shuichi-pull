import { describe, it, expect } from 'vitest';
import {
  transicaoValida, estaAberta, duracaoMs, formatarDuracao, formatarCronometro,
} from './status-partida';

describe('transicaoValida', () => {
  it('agendada começa ou cancela; em andamento finaliza ou cancela', () => {
    expect(transicaoValida('agendada', 'em_andamento')).toBe(true);
    expect(transicaoValida('agendada', 'cancelada')).toBe(true);
    expect(transicaoValida('em_andamento', 'finalizada')).toBe(true);
    expect(transicaoValida('em_andamento', 'cancelada')).toBe(true);
  });

  it('não pula etapa nem volta', () => {
    expect(transicaoValida('agendada', 'finalizada')).toBe(false);
    expect(transicaoValida('em_andamento', 'agendada')).toBe(false);
  });

  it('finalizada e cancelada são pontos finais', () => {
    expect(estaAberta('finalizada')).toBe(false);
    expect(estaAberta('cancelada')).toBe(false);
    expect(transicaoValida('finalizada', 'em_andamento')).toBe(false);
    expect(estaAberta('agendada')).toBe(true);
    expect(estaAberta('em_andamento')).toBe(true);
  });
});

describe('duracaoMs', () => {
  const t = (h: number, m = 0) => new Date(Date.UTC(2026, 8, 21, h, m));

  it('diferença entre início e fim', () => {
    expect(duracaoMs(t(20), t(21, 12))).toBe(72 * 60_000);
  });

  it('sem início ou sem fim não há duração', () => {
    expect(duracaoMs(null, t(21))).toBeNull();
    expect(duracaoMs(t(20), null)).toBeNull();
  });

  it('relógio torto nunca dá duração negativa', () => {
    expect(duracaoMs(t(21), t(20))).toBe(0);
  });
});

describe('formatarDuracao', () => {
  it.each([
    [0, '0s'], [38_000, '38s'], [60_000, '1min'], [42 * 60_000, '42min'],
    [72 * 60_000, '1h 12min'], [2 * 3_600_000, '2h'], [3_600_000 + 29_999, '1h'],
  ])('%i ms -> %s', (ms, esperado) => {
    expect(formatarDuracao(ms)).toBe(esperado);
  });
});

describe('formatarCronometro', () => {
  it.each([
    [0, '00:00:00'], [7_000, '00:00:07'], [42 * 60_000 + 7_000, '00:42:07'],
    [3_600_000 + 61_000, '01:01:01'], [-500, '00:00:00'], [100 * 3_600_000, '100:00:00'],
  ])('%i ms -> %s', (ms, esperado) => {
    expect(formatarCronometro(ms)).toBe(esperado);
  });
});
