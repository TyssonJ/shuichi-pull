import { ESTRELAS_MAX } from './estrelas';

/**
 * Avaliações que um jogador recebeu, como o perfil público as mostra:
 * agregadas e SEM autor. O avaliador nunca sai do banco — só a nota, o
 * comentário, a data e de onde veio (site ou Junko Bot).
 */
export type AvaliacaoRecebida = {
  id: number;
  estrelas: number;
  comentario: string | null;
  criadoEm: Date;
  origem: 'site' | 'junko';
};

export type ResumoAvaliacoes = {
  total: number;
  /** Média de 0 a 5 com uma casa decimal, ou null sem avaliação. */
  media: number | null;
  /** Quantas avaliações tiveram cada nota: índice = estrelas (0 a 5). */
  distribuicao: number[];
  /** Só as que trazem texto, da mais nova pra mais velha. */
  comentarios: AvaliacaoRecebida[];
};

export function resumirAvaliacoes(avaliacoes: AvaliacaoRecebida[]): ResumoAvaliacoes {
  const distribuicao = Array.from({ length: ESTRELAS_MAX + 1 }, () => 0);
  let soma = 0;
  for (const a of avaliacoes) {
    distribuicao[a.estrelas] += 1;
    soma += a.estrelas;
  }
  const total = avaliacoes.length;

  return {
    total,
    media: total === 0 ? null : Math.round((soma / total) * 10) / 10,
    distribuicao,
    comentarios: avaliacoes
      .filter((a) => a.comentario && a.comentario.trim() !== '')
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
  };
}

/** Faixa de reputação pro selo do perfil. Com poucas avaliações a média
 * engana (uma 5★ é "5,0"), então abaixo de 3 não se rotula ninguém. */
export function reputacao(resumo: ResumoAvaliacoes): { rotulo: string; cor: string } | null {
  if (resumo.total < 3 || resumo.media === null) return null;
  if (resumo.media >= 4) return { rotulo: 'BEM VISTO', cor: '#00FF66' };
  if (resumo.media >= 2.5) return { rotulo: 'MISTO', cor: '#F5D30E' };
  return { rotulo: 'MAL VISTO', cor: '#FF007F' };
}
