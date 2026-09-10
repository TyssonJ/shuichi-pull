import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import {
  listarItensComCorrecoes, buscarItemComCorrecoes,
  listarLocaisComCorrecoes, buscarLocalComCorrecoes,
} from './itens-corrigidos';

describe('listarItensComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica correção de nome.pt sobre um item', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockImplementation(async (colecao) =>
      colecao === 'itens'
        ? new Map([['small-parts', new Map([['nome.pt', { valor: 'Peças Corrigidas', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])]])
        : new Map()
    );

    const lista = await listarItensComCorrecoes();
    const item = lista.find((i) => i.id === 'small-parts');

    expect(item?.nome.pt).toBe('Peças Corrigidas');
  });
});

describe('buscarItemComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null para id inexistente', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    expect(await buscarItemComCorrecoes('nao-existe')).toBeNull();
  });
});

describe('listarLocaisComCorrecoes / buscarLocalComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('aplica correção de nome.pt sobre um local', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockImplementation(async (colecao) =>
      colecao === 'locais'
        ? new Map([['storeroom', new Map([['nome.pt', { valor: 'Depósito', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])]])
        : new Map()
    );

    const local = await buscarLocalComCorrecoes('storeroom');

    expect(local?.nome.pt).toBe('Depósito');
  });
});
