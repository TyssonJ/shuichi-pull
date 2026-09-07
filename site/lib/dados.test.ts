import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarPersonagens, buscarPersonagem, valoresDoElenco } from './dados';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { listarPersonagensComCorrecoes, buscarPersonagemComCorrecoes } from './dados';

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

describe('listarPersonagensComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve os personagens sem alteração quando não há correções', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());

    const lista = await listarPersonagensComCorrecoes();

    expect(lista.find((p) => p.id === 'makoto-naegi')?.nome).toBe('Makoto Naegi');
  });

  it('aplica uma correção de nome por cima do JSON', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      ['makoto-naegi', new Map([['nome', { valor: 'Nome Corrigido', valorBase: 'Makoto Naegi', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await listarPersonagensComCorrecoes();

    expect(lista.find((p) => p.id === 'makoto-naegi')?.nome).toBe('Nome Corrigido');
  });
});

describe('buscarPersonagemComCorrecoes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null para id inexistente', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    expect(await buscarPersonagemComCorrecoes('nao-existe')).toBeNull();
  });

  it('aplica correção ao buscar um só personagem', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      ['makoto-naegi', new Map([['descricao.pt', { valor: 'Nova descrição', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const p = await buscarPersonagemComCorrecoes('makoto-naegi');

    expect(p?.descricao.pt).toBe('Nova descrição');
  });
});
