import { describe, it, expect } from 'vitest';
import { buscar } from './busca';

describe('buscar', () => {
  it('acha personagem pelo nome', () => {
    const r = buscar('chihiro');
    expect(r[0].titulo).toBe('Chihiro Fujisaki');
    expect(r[0].url).toBe('/elenco/chihiro-fujisaki/');
  });

  it('ignora acento e caixa', () => {
    expect(buscar('CHIHIRO').length).toBeGreaterThan(0);
    expect(buscar('programacao').length).toBeGreaterThan(0);
  });

  it('acha pelo talento em português e em inglês', () => {
    expect(buscar('Programação Suprema').length).toBeGreaterThan(0);
    expect(buscar('Ultimate Programmer').length).toBeGreaterThan(0);
  });

  it('devolve vazio para termo sem resultado', () => {
    expect(buscar('zzzzzzzz')).toEqual([]);
  });

  it('devolve vazio para termo muito curto', () => {
    expect(buscar('a')).toEqual([]);
  });
});
