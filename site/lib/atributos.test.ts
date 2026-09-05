import { describe, it, expect } from 'vitest';
import { extrairValor } from './atributos';

describe('extrairValor', () => {
  it('lê a velocidade', () => {
    expect(extrairValor('Run speed 190 units', 'speed')).toBe(190);
    expect(extrairValor('Run speed 180 units', 'speed')).toBe(180);
  });

  it('lê a capacidade', () => {
    expect(extrairValor('Capacity 14 units', 'capacity')).toBe(14);
    expect(extrairValor('Capacity 45 units', 'capacity')).toBe(45);
  });

  it('lê a percepção, inclusive com o sufixo de máximo', () => {
    expect(extrairValor('Perception 7', 'attention')).toBe(7);
    expect(extrairValor('Perception 10 (max.)', 'attention')).toBe(10);
  });

  it('devolve null quando a frase não bate com o tipo', () => {
    expect(extrairValor('Hunger 20% less often', 'speed')).toBeNull();
    expect(extrairValor('', 'capacity')).toBeNull();
  });
});
