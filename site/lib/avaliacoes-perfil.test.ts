import { describe, it, expect } from 'vitest';
import { resumirAvaliacoes, reputacao, type AvaliacaoRecebida } from './avaliacoes-perfil';

const av = (id: number, tipo: 'like' | 'dislike', comentario: string | null, dia: number): AvaliacaoRecebida => ({
  id, tipo, comentario, criadoEm: new Date(2026, 8, dia),
});

describe('resumirAvaliacoes', () => {
  it('sem avaliação: zeros e aprovação nula', () => {
    expect(resumirAvaliacoes([])).toEqual({ likes: 0, dislikes: 0, total: 0, aprovacao: null, comentarios: [] });
  });

  it('conta likes, dislikes e arredonda a aprovação', () => {
    const r = resumirAvaliacoes([av(1, 'like', null, 1), av(2, 'like', null, 2), av(3, 'dislike', null, 3)]);
    expect(r).toMatchObject({ likes: 2, dislikes: 1, total: 3, aprovacao: 67 });
  });

  it('só devolve comentários preenchidos, do mais novo pro mais velho', () => {
    const r = resumirAvaliacoes([
      av(1, 'like', 'legal', 1), av(2, 'like', '   ', 2), av(3, 'dislike', 'chato', 5), av(4, 'like', null, 6),
    ]);
    expect(r.comentarios.map((c) => c.id)).toEqual([3, 1]);
  });

  it('o resumo não carrega nenhum campo de autor', () => {
    const r = resumirAvaliacoes([av(1, 'like', 'ok', 1)]);
    expect(JSON.stringify(r)).not.toMatch(/avaliador|discord/i);
  });
});

describe('reputacao', () => {
  const resumo = (likes: number, dislikes: number) =>
    resumirAvaliacoes([
      ...Array.from({ length: likes }, (_, i) => av(i, 'like', null, 1)),
      ...Array.from({ length: dislikes }, (_, i) => av(100 + i, 'dislike', null, 1)),
    ]);

  it('não rotula com menos de 3 avaliações', () => {
    expect(reputacao(resumo(2, 0))).toBeNull();
    expect(reputacao(resumo(0, 0))).toBeNull();
  });

  it('faixas: bem visto, misto, mal visto', () => {
    expect(reputacao(resumo(4, 1))?.rotulo).toBe('BEM VISTO');
    expect(reputacao(resumo(2, 2))?.rotulo).toBe('MISTO');
    expect(reputacao(resumo(1, 4))?.rotulo).toBe('MAL VISTO');
  });
});
