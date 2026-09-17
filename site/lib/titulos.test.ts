import { describe, it, expect } from 'vitest';
import { tituloPorPartidas } from './titulos';

describe('tituloPorPartidas', () => {
  it('sem partida nenhuma, não tem título', () => {
    expect(tituloPorPartidas(0)).toBeNull();
  });

  it('degraus corretos nos limites', () => {
    expect(tituloPorPartidas(1)).toBe('Calouro');
    expect(tituloPorPartidas(2)).toBe('Calouro');
    expect(tituloPorPartidas(3)).toBe('Estudante Confirmado');
    expect(tituloPorPartidas(7)).toBe('Estudante Confirmado');
    expect(tituloPorPartidas(8)).toBe('Sobrevivente Veterano');
    expect(tituloPorPartidas(19)).toBe('Sobrevivente Veterano');
    expect(tituloPorPartidas(20)).toBe('Lenda da Academia');
    expect(tituloPorPartidas(100)).toBe('Lenda da Academia');
  });
});
