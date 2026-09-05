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

describe('buscar em todas as seções', () => {
  it('acha item pelo nome em português', () => {
    const r = buscar('sucata enferrujada');
    expect(r[0].tipo).toBe('item');
    expect(r[0].url).toBe('/itens/rusty-scrap-metal/');
  });

  it('acha item pelo nome em inglês', () => {
    expect(buscar('Rusty Scrap').some((x) => x.id === 'rusty-scrap-metal')).toBe(true);
  });

  it('acha local', () => {
    const r = buscar('ginasio');
    expect(r.some((x) => x.tipo === 'local')).toBe(true);
  });

  it('põe na frente quem começa com o termo', () => {
    const r = buscar('pano');
    expect(r[0].titulo.toLowerCase().startsWith('pano')).toBe(true);
  });

  it('marca o tipo de cada resultado', () => {
    expect(buscar('chihiro')[0].tipo).toBe('personagem');
  });
});
