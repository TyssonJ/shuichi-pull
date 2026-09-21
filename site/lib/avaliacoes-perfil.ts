/**
 * Avaliações que um jogador recebeu dos colegas, como o perfil público as
 * mostra: agregadas e SEM autor. O avaliador nunca sai do banco — só o tipo,
 * o comentário e quando foi.
 */

export type AvaliacaoRecebida = {
  id: number;
  tipo: 'like' | 'dislike';
  comentario: string | null;
  criadoEm: Date;
};

export type ResumoAvaliacoes = {
  likes: number;
  dislikes: number;
  total: number;
  /** 0–100, ou null quando ainda não há avaliação. */
  aprovacao: number | null;
  /** Só as que trazem comentário, da mais nova pra mais velha. */
  comentarios: AvaliacaoRecebida[];
};

export function resumirAvaliacoes(avaliacoes: AvaliacaoRecebida[]): ResumoAvaliacoes {
  const likes = avaliacoes.filter((a) => a.tipo === 'like').length;
  const dislikes = avaliacoes.length - likes;
  const total = avaliacoes.length;

  return {
    likes,
    dislikes,
    total,
    aprovacao: total === 0 ? null : Math.round((likes / total) * 100),
    comentarios: avaliacoes
      .filter((a) => a.comentario && a.comentario.trim() !== '')
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
  };
}

/** Faixa de reputação pro selo do perfil. Com poucas avaliações a porcentagem
 * engana (1 like = 100%), então abaixo de 3 não se rotula ninguém. */
export function reputacao(resumo: ResumoAvaliacoes): { rotulo: string; cor: string } | null {
  if (resumo.total < 3 || resumo.aprovacao === null) return null;
  if (resumo.aprovacao >= 80) return { rotulo: 'BEM VISTO', cor: '#00FF66' };
  if (resumo.aprovacao >= 50) return { rotulo: 'MISTO', cor: '#F5D30E' };
  return { rotulo: 'MAL VISTO', cor: '#FF007F' };
}
