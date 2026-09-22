import { ErroDeNegocio } from './acao';

export const VAGAS_PADRAO = 16;
export const VAGAS_MIN = 2;
/** Máximo de vagas de titular (o Monokuma, quando é o host, ocupa uma delas). */
export const VAGAS_MAX = 20;

type Inscrito = { discordId: string; personagemId: string | null; tipo: 'participante' | 'reserva' };

/**
 * Todo titular ocupa vaga, inclusive o host jogando de Monokuma. Reserva não
 * ocupa: é a fila pra quando alguém cai, e não conta como participante.
 */
export function ocupamVaga(inscritos: Inscrito[]): Inscrito[] {
  return inscritos.filter((i) => i.tipo === 'participante');
}

export function vagasRestantes(inscritos: Inscrito[], vagas: number): number {
  return Math.max(0, vagas - ocupamVaga(inscritos).length);
}

/**
 * Quem já é titular pode atualizar o próprio personagem mesmo com a sala
 * cheia (a vaga já é dele); um novo titular só entra se sobrou vaga — o
 * Monokuma também, já que ele ocupa uma. Reserva nunca é barrada por lotação.
 */
export function podeEntrarComoTitular(inscritos: Inscrito[], vagas: number, discordId: string): boolean {
  const outros = inscritos.filter((i) => i.discordId !== discordId);
  return ocupamVaga(outros).length < vagas;
}

export function validarVagas(vagas: number): void {
  if (!Number.isInteger(vagas) || vagas < VAGAS_MIN || vagas > VAGAS_MAX) {
    throw new ErroDeNegocio(`Vagas precisa ser um número inteiro entre ${VAGAS_MIN} e ${VAGAS_MAX}.`);
  }
}
