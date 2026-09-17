import { describe, it, expect } from 'vitest';
import { SECOES } from './secoes';

describe('SECOES', () => {
  it('tem as 9 seções na ordem e numeração já usadas no header', () => {
    expect(SECOES).toHaveLength(9);
    expect(SECOES[0]).toEqual({ numero: '01', nome: 'Elenco', url: '/elenco/' });
    expect(SECOES[7]).toEqual({ numero: '08', nome: 'Começar', url: '/comecar/' });
    expect(SECOES[8]).toEqual({ numero: '09', nome: 'Partidas', url: '/partidas/' });
  });

  it('toda url termina com barra', () => {
    for (const s of SECOES) {
      expect(s.url.endsWith('/')).toBe(true);
    }
  });
});
