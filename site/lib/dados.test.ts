import { describe, it, expect } from 'vitest';
import { listarPersonagens, buscarPersonagem, valoresDoElenco } from './dados';

describe('acesso aos dados', () => {
  it('lista os 56 personagens', () => {
    expect(listarPersonagens()).toHaveLength(56);
  });

  it('acha um personagem pelo id', () => {
    const c = buscarPersonagem('chihiro-fujisaki');
    expect(c?.nome).toBe('Chihiro Fujisaki');
  });

  it('devolve null para id inexistente', () => {
    expect(buscarPersonagem('personagem-que-nao-existe')).toBeNull();
  });

  it('devolve os 56 valores de um atributo', () => {
    const v = valoresDoElenco('velocidade');
    expect(v).toHaveLength(56);
    expect(Math.min(...v)).toBe(180);
    expect(Math.max(...v)).toBe(230);
  });
});
