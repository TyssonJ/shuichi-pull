import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listarFaq, faqPorSecao, faqSemTraducao } from './faq';

vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { buscarCorrecoesPorColecao: vi.fn() },
}));
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
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
  beforeEach(() => vi.clearAllMocks());

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
  beforeEach(() => vi.clearAllMocks());

  it('agrupa por seção usando as respostas já corrigidas', async () => {
    vi.mocked(repositorioCorrecoes.buscarCorrecoesPorColecao).mockResolvedValue(new Map());
    const grupos = await faqPorSecaoComCorrecoes();
    expect(grupos.length).toBeGreaterThan(0);
  });
});
