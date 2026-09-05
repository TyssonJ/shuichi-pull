import { describe, it, expect } from 'vitest';
import { cores } from './tokens';

describe('tokens de cor', () => {
  it('expõe todas as cores da spec com os valores exatos', () => {
    expect(cores.bg).toBe('#0E0E11');
    expect(cores.sur).toBe('#17171D');
    expect(cores.line).toBe('#2A2A33');
    expect(cores.papel).toBe('#E8E2D2');
    expect(cores.tinta).toBe('#14141A');
    expect(cores.teal).toBe('#63C4BC');
    expect(cores.tealEscuro).toBe('#1E6E73');
    expect(cores.red).toBe('#D9534A');
    expect(cores.dim).toBe('#7A7A88');
  });

  it('reserva o verde do Alter Ego separado das cores do site', () => {
    expect(cores.egoVerdeClaro).toBe('#4FA030');
    expect(cores.egoVerdeEscuro).toBe('#256512');
  });
});
