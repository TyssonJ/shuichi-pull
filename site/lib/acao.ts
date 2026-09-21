import type { ResultadoAcao } from './acao-cliente';

export type { ResultadoAcao };

/**
 * Erro esperado, cuja mensagem é pra pessoa ler ("Dá um título pra
 * partida"). Só estes viram {ok:false} — qualquer outro erro (banco fora,
 * bug) continua sendo lançado, e o Next esconde o texto dele de propósito
 * (pode ter detalhe interno).
 */
export class ErroDeNegocio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeNegocio';
  }
}

/** Roda o corpo da action e transforma ErroDeNegocio em resposta {ok:false}. */
export async function executar<T = void>(corpo: () => Promise<T>): Promise<ResultadoAcao<T>> {
  try {
    return { ok: true, dados: await corpo() };
  } catch (e) {
    if (e instanceof ErroDeNegocio) return { ok: false, erro: e.message };
    throw e;
  }
}
