import { describe, it, expect } from 'vitest';
import {
  tabelasDeTeclas, cardsDeMecanica, mecanicasPorGrupo, mecanicasSemTraducao,
} from './controles';

describe('controles', () => {
  it('traz as duas tabelas de teclas', () => {
    const t = tabelasDeTeclas();
    expect(t).toHaveLength(2);
    expect(t[0].teclas.length).toBeGreaterThan(10);
  });

  it('traduz a descrição das teclas', () => {
    const movimento = tabelasDeTeclas()[0];
    expect(movimento.grupo).toBe('Movimentação básica');
    expect(movimento.teclas[0].descricao).toBe('Move o personagem');
  });

  it('mantém a combinação de teclas intacta', () => {
    expect(tabelasDeTeclas()[0].teclas[0].teclas).toBe('WASD');
  });

  it('traduz a nota da tecla', () => {
    const comNota = tabelasDeTeclas()[0].teclas.find((k) => k.nota);
    expect(comNota?.nota).toMatch(/obstáculos/);
  });

  it('traz os 52 cards de mecânica', () => {
    expect(cardsDeMecanica()).toHaveLength(52);
  });

  it('está todo traduzido', () => {
    expect(mecanicasSemTraducao()).toEqual([]);
  });

  it('agrupa as mecânicas com o nome do grupo em português', () => {
    const grupos = mecanicasPorGrupo();
    expect(grupos).toHaveLength(10);
    expect(grupos.map((g) => g.grupo)).toContain('Julgamento');
  });

  it('nenhum card ficou sem texto', () => {
    expect(cardsDeMecanica().filter((c) => c.texto.trim() === '')).toEqual([]);
  });
});
