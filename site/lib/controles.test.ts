import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  tabelasDeTeclas, cardsDeMecanica, mecanicasPorGrupo, mecanicasSemTraducao,
} from './controles';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { cardsDeMecanicaComCorrecoes, mecanicasPorGrupoComCorrecoes } from './controles';

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

describe('cardsDeMecanicaComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica uma correção de texto', async () => {
    const idReal = cardsDeMecanica()[0].id;
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [idReal, new Map([['texto', { valor: 'Texto corrigido', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await cardsDeMecanicaComCorrecoes();

    expect(lista.find((c) => c.id === idReal)?.texto).toBe('Texto corrigido');
  });
});

describe('mecanicasPorGrupoComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('agrupa usando os cards já corrigidos', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    const grupos = await mecanicasPorGrupoComCorrecoes();
    expect(grupos.length).toBeGreaterThan(0);
  });
});
