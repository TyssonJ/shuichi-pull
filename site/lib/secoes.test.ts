import { describe, it, expect } from 'vitest';
import { SECOES } from './secoes';

describe('SECOES', () => {
  it('tem as 8 seções na ordem e numeração já usadas no header', () => {
    expect(SECOES).toHaveLength(8);
    expect(SECOES[0]).toEqual({ numero: '01', nome: 'Elenco', url: '/elenco/' });
    expect(SECOES[7]).toEqual({ numero: '08', nome: 'Começar', url: '/comecar/' });
  });

  it('toda url termina com barra', () => {
    for (const s of SECOES) {
      expect(s.url.endsWith('/')).toBe(true);
    }
  });
});
