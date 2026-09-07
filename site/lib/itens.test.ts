import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listarItens, buscarItem, listarLocais, buscarLocal,
  categoriasComTotal, receitasQueUsam,
} from './itens';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import {
  listarItensComCorrecoes, buscarItemComCorrecoes,
  listarLocaisComCorrecoes, buscarLocalComCorrecoes,
} from './itens';

describe('acesso aos itens', () => {
  it('lista os 162 itens', () => {
    expect(listarItens()).toHaveLength(162);
  });

  it('acha item pelo id e traz o nome em PT e EN', () => {
    const i = buscarItem('small-parts');
    expect(i?.nome.pt).toBe('Peças Miúdas');
    expect(i?.nome.en).toBe('Small Parts');
  });

  it('devolve null para item inexistente', () => {
    expect(buscarItem('item-que-nao-existe')).toBeNull();
  });

  it('traz a receita com ingrediente ligado a outro item', () => {
    const craft = buscarItem('small-parts')?.craft;
    expect(craft?.ingredientes[0].id).toBe('rusty-scrap-metal');
    expect(craft?.ingredientes[0].qtd).toBe(3);
    expect(craft?.bancadas[0].pt).toBe('Bancada');
  });

  it('traz os spawns ordenados da maior para a menor chance', () => {
    const spawns = buscarItem('small-parts')!.spawns;
    expect(spawns.length).toBeGreaterThan(0);
    const chances = spawns.map((s) => s.chance);
    expect([...chances].sort((a, b) => b - a)).toEqual(chances);
  });

  it('nenhuma bancada ficou em russo', () => {
    const russo = listarItens()
      .flatMap((i) => i.craft?.bancadas ?? [])
      .filter((b) => /[\u0400-\u04FF]/.test(b.pt));
    expect(russo).toEqual([]);
  });
});

describe('categoriasComTotal', () => {
  it('soma todos os itens entre as categorias', () => {
    const total = categoriasComTotal().reduce((a, c) => a + c.total, 0);
    expect(total).toBe(162);
  });

  it('vem da mais numerosa para a menos', () => {
    const totais = categoriasComTotal().map((c) => c.total);
    expect([...totais].sort((a, b) => b - a)).toEqual(totais);
  });
});

describe('receitasQueUsam', () => {
  it('acha quem usa sucata enferrujada como ingrediente', () => {
    const usos = receitasQueUsam('rusty-scrap-metal');
    expect(usos.map((i) => i.id)).toContain('small-parts');
  });

  it('devolve vazio para item que ninguém usa', () => {
    expect(receitasQueUsam('item-que-nao-existe')).toEqual([]);
  });
});

describe('acesso aos locais', () => {
  it('lista os locais do mapa', () => {
    expect(listarLocais().length).toBeGreaterThan(40);
  });

  it('acha local pelo id com seus contêineres', () => {
    const comLoot = listarLocais().find((l) => l.conteineres.length > 0)!;
    const l = buscarLocal(comLoot.id);
    expect(l?.conteineres[0].itens.length).toBeGreaterThan(0);
    expect(l?.totalItens).toBeGreaterThan(0);
  });

  it('devolve null para local inexistente', () => {
    expect(buscarLocal('local-que-nao-existe')).toBeNull();
  });

  it('nenhum local ficou com nome em russo', () => {
    const russo = listarLocais().filter((l) => /[\u0400-\u04FF]/.test(l.nome.pt));
    expect(russo.map((l) => l.id)).toEqual([]);
  });
});

describe('nada sobra em russo', () => {
  const russo = /[\u0400-\u04FF]/;

  it('nenhum contêiner de spawn ficou em russo', () => {
    const sujos = listarItens()
      .flatMap((i) => i.spawns)
      .filter((s) => russo.test(s.conteiner.pt) || russo.test(s.conteiner.en));
    expect(sujos.map((s) => s.conteiner.en)).toEqual([]);
  });

  it('nenhum contêiner de local ficou em russo', () => {
    const sujos = listarLocais()
      .flatMap((l) => l.conteineres)
      .filter((c) => russo.test(c.nome.pt) || russo.test(c.nome.en));
    expect(sujos.map((c) => c.nome.en)).toEqual([]);
  });

  it('nenhum nome de item ficou em russo', () => {
    const sujos = listarItens().filter((i) => russo.test(i.nome.pt) || russo.test(i.nome.en));
    expect(sujos.map((i) => i.id)).toEqual([]);
  });

  it('todo spawn aponta para um local que existe no mapa', () => {
    const ids = new Set(listarLocais().map((l) => l.id));
    const orfaos = listarItens()
      .flatMap((i) => i.spawns)
      .filter((s) => !ids.has(s.localId));
    expect(orfaos.map((s) => s.localId)).toEqual([]);
  });
});

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
