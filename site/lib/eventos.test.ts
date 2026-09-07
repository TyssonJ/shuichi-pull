import { describe, it, expect } from 'vitest';
import { estaExpirado, type Codigo } from './eventos';

describe('estaExpirado', () => {
  const base: Codigo = {
    codigo: 'X', recompensa: 'r', descricao: 'd', expiraEm: null, fonte: null,
  };

  it('nunca expira sem data', () => {
    expect(estaExpirado(base)).toBe(false);
  });

  it('ainda vale no próprio dia da expiração', () => {
    const c = { ...base, expiraEm: '2026-01-10' };
    expect(estaExpirado(c, new Date(2026, 0, 10, 23, 0))).toBe(false);
  });

  it('expira no dia seguinte', () => {
    const c = { ...base, expiraEm: '2026-01-10' };
    expect(estaExpirado(c, new Date(2026, 0, 11, 0, 0, 1))).toBe(true);
  });
});
