import { describe, it, expect } from 'vitest';
import { resumirAvaliacoes, reputacao, type AvaliacaoRecebida } from './avaliacoes-perfil';

const av = (id: number, estrelas: number, comentario: string | null, dia: number, origem: 'site' | 'junko' = 'site'): AvaliacaoRecebida => ({
  id, estrelas, comentario, criadoEm: new Date(2026, 8, dia), origem,
});

describe('resumirAvaliacoes', () => {
  it('sem avaliação: média nula e distribuição zerada (0 a 5)', () => {
    expect(resumirAvaliacoes([])).toEqual({ total: 0, media: null, distribuicao: [0, 0, 0, 0, 0, 0], comentarios: [] });
  });

  it('média com uma casa decimal e distribuição por nota', () => {
    const r = resumirAvaliacoes([av(1, 5, 'a', 1), av(2, 4, 'b', 2), av(3, 4, 'c', 3)]);
    expect(r.media).toBe(4.3);
    expect(r.distribuicao).toEqual([0, 0, 0, 0, 2, 1]);
    expect(r.total).toBe(3);
  });

  it('a nota 0 conta na média (não é "sem nota")', () => {
    const r = resumirAvaliacoes([av(1, 0, 'ruim', 1), av(2, 4, 'bom', 2)]);
    expect(r.media).toBe(2);
    expect(r.distribuicao[0]).toBe(1);
  });

  it('só devolve comentários preenchidos, do mais novo pro mais velho', () => {
    const r = resumirAvaliacoes([av(1, 5, 'legal', 1), av(2, 3, '   ', 2), av(3, 1, 'chato', 5), av(4, 5, null, 6)]);
    expect(r.comentarios.map((c) => c.id)).toEqual([3, 1]);
  });

  it('avaliações do bot entram na conta e mantêm a origem', () => {
    const r = resumirAvaliacoes([av(1, 5, 'do site', 1), av(2, 3, 'do bot', 2, 'junko')]);
    expect(r.total).toBe(2);
    expect(r.comentarios.find((c) => c.id === 2)?.origem).toBe('junko');
  });

  it('o resumo não carrega nenhum campo de autor', () => {
    const r = resumirAvaliacoes([av(1, 5, 'ok', 1)]);
    expect(JSON.stringify(r)).not.toMatch(/avaliador|discord/i);
  });
});

describe('reputacao', () => {
  const de = (...notas: number[]) => resumirAvaliacoes(notas.map((n, i) => av(i, n, null, 1)));

  it('não rotula com menos de 3 avaliações', () => {
    expect(reputacao(de(5, 5))).toBeNull();
    expect(reputacao(de())).toBeNull();
  });

  it('faixas pela média: bem visto (≥4), misto (≥2,5), mal visto', () => {
    expect(reputacao(de(5, 4, 4))?.rotulo).toBe('BEM VISTO');
    expect(reputacao(de(3, 3, 2))?.rotulo).toBe('MISTO');
    expect(reputacao(de(1, 2, 3))?.rotulo).toBe('MAL VISTO');
  });
});
