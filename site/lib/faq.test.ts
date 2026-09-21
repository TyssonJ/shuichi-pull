import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarFaq, faqPorSecao, faqSemTraducao } from './faq';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
vi.mock('@/db/repositorios/conteudo-adm', () => ({
  repositorioConteudoAdm: { listarRemovidos: vi.fn(), listarExtras: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioConteudoAdm } from '@/db/repositorios/conteudo-adm';
import { listarFaqComCorrecoes, faqPorSecaoComCorrecoes } from './faq';

describe('FAQ', () => {
  it('traz as 51 perguntas do guidebook', () => {
    expect(listarFaq()).toHaveLength(51);
  });

  it('está todo em português', () => {
    expect(faqSemTraducao()).toEqual([]);
  });

  it('agrupa nas sete seções, com o nome em português', () => {
    const secoes = faqPorSecao();
    expect(secoes).toHaveLength(7);
    expect(secoes.map((s) => s.secao)).toContain('Primeiros passos');
  });

  it('dá um id de URL para cada pergunta', () => {
    for (const p of listarFaq()) {
      expect(p.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('não repete id', () => {
    const ids = listarFaq().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nenhuma resposta ficou vazia', () => {
    expect(listarFaq().filter((p) => p.resposta.trim() === '')).toEqual([]);
  });
});

describe('listarFaqComCorrecoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set());
    vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([]);
  });

  it('aplica uma correção de resposta', async () => {
    const idReal = listarFaq()[0].id;
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map([
      [idReal, new Map([['resposta', { valor: 'Resposta corrigida', valorBase: 'x', autor: '1', criadoEm: '2026-01-01' }]])],
    ]));

    const lista = await listarFaqComCorrecoes();

    expect(lista.find((p) => p.id === idReal)?.resposta).toBe('Resposta corrigida');
  });
});

describe('faqPorSecaoComCorrecoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set());
    vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([]);
  });

  it('agrupa por seção usando as respostas já corrigidas', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    const grupos = await faqPorSecaoComCorrecoes();
    expect(grupos.length).toBeGreaterThan(0);
  });
});

describe('faq: perguntas criadas e escondidas pelo ADM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set());
    vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([]);
  });

  it('pergunta escondida some e a criada entra no fim, com a própria seção', async () => {
    const escondida = listarFaq()[0].id;
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    vi.mocked(repositorioConteudoAdm.listarRemovidos).mockResolvedValue(new Set([escondida]));
    vi.mocked(repositorioConteudoAdm.listarExtras).mockResolvedValue([
      { id: 'nova', dados: { secao: 'Seção nova', pergunta: 'P?', resposta: 'R.' } },
    ]);

    const lista = await listarFaqComCorrecoes();

    expect(lista.some((p) => p.id === escondida)).toBe(false);
    expect(lista.at(-1)).toMatchObject({ id: 'nova', secao: 'Seção nova', pergunta: 'P?', resposta: 'R.' });
    expect(lista.length).toBe(listarFaq().length);

    const grupos = await faqPorSecaoComCorrecoes();
    expect(grupos.at(-1)?.secao).toBe('Seção nova');
  });
});
