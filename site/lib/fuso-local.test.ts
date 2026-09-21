import { describe, it, expect } from 'vitest';
import { horarioNoFusoLocal, fusoDoAparelho } from './fuso-local';

// 21/09/2026 20:00 em Brasília (UTC-3) = 23:00 UTC
const PARTIDA = new Date('2026-09-21T23:00:00.000Z');

describe('horarioNoFusoLocal', () => {
  it('Portugal (Lisboa, UTC+1 no fim de setembro): mostra o horário deles, 4 h à frente de Brasília', () => {
    const r = horarioNoFusoLocal(PARTIDA, 'Europe/Lisbon');
    expect(r).not.toBeNull();
    expect(r!.texto).toContain('00:00');
    expect(r!.texto).toContain('22/09'); // já virou o dia lá
    expect(r!.fuso).toBe('Europe/Lisbon');
    expect(r!.gmt).toMatch(/GMT\+1/);
  });

  it('Açores e Madeira contam pelo relógio de cada um (mesmo instante, fuso diferente)', () => {
    const acores = horarioNoFusoLocal(PARTIDA, 'Atlantic/Azores');
    expect(acores!.texto).toContain('23:00');
    expect(acores!.gmt).toMatch(/GMT/);
  });

  it('Brasília (ou fuso com o mesmo horário): não repete, devolve null', () => {
    expect(horarioNoFusoLocal(PARTIDA, 'America/Sao_Paulo')).toBeNull();
    expect(horarioNoFusoLocal(PARTIDA, 'America/Argentina/Buenos_Aires')).toBeNull(); // UTC-3 o ano todo
  });

  it('outro fuso brasileiro (Manaus, UTC-4) aparece com 1 h de diferença', () => {
    const r = horarioNoFusoLocal(PARTIDA, 'America/Manaus');
    expect(r!.texto).toContain('19:00');
  });

  it('fuso inválido ou data inválida: null, sem lançar', () => {
    expect(horarioNoFusoLocal(PARTIDA, 'Marte/Olympus')).toBeNull();
    expect(horarioNoFusoLocal(new Date('nada'), 'Europe/Lisbon')).toBeNull();
  });
});

describe('fusoDoAparelho', () => {
  it('devolve o fuso do ambiente (uma string tipo "America/Sao_Paulo") ou null', () => {
    const f = fusoDoAparelho();
    expect(f === null || typeof f === 'string').toBe(true);
  });
});
