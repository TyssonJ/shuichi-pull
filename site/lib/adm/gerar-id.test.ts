import { describe, it, expect } from 'vitest';
import { gerarId } from './gerar-id';

describe('gerarId', () => {
  it('tira acento e vira kebab-case', () => {
    expect(gerarId('Espada Flamejante')).toBe('espada-flamejante');
    expect(gerarId('Poção de Cura')).toBe('pocao-de-cura');
    expect(gerarId('Ração Militar «Monokuma»')).toBe('racao-militar-monokuma');
  });

  it('não deixa hífen sobrando nas pontas', () => {
    expect(gerarId('  --Chave!! ')).toBe('chave');
  });

  it('nome só de símbolos vira id vazio', () => {
    expect(gerarId('???')).toBe('');
  });
});
