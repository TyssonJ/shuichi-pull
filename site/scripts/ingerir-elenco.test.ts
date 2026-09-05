import { describe, it, expect } from 'vitest';
import { gerarId, ingerirElenco } from './ingerir-elenco';

describe('gerarId', () => {
  it('transforma nome em kebab-case', () => {
    expect(gerarId('Chihiro Fujisaki')).toBe('chihiro-fujisaki');
    expect(gerarId('Makoto Naegi')).toBe('makoto-naegi');
  });

  it('remove acentos e pontuação', () => {
    expect(gerarId('K1-B0')).toBe('k1-b0');
  });
});

describe('ingerirElenco', () => {
  const elenco = ingerirElenco();

  it('traz os 56 personagens', () => {
    expect(elenco).toHaveLength(56);
  });

  it('traz a Chihiro com os atributos corretos', () => {
    const c = elenco.find((p) => p.id === 'chihiro-fujisaki');
    expect(c).toBeDefined();
    expect(c!.velocidade).toBe(180);
    expect(c!.mochila).toBe(13);
    expect(c!.percepcao).toBe(9);
    expect(c!.talento.en).toBe('Ultimate Programmer');
    expect(c!.talento.pt).toBe('Programação Suprema');
  });

  it('não deixa nenhum id repetido', () => {
    const ids = elenco.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo personagem tem os três atributos da régua', () => {
    for (const p of elenco) {
      expect(p.velocidade).toBeGreaterThan(0);
      expect(p.mochila).toBeGreaterThan(0);
      expect(p.percepcao).toBeGreaterThan(0);
    }
  });
});
