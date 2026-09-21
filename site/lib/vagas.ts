import { ID_MONOKUMA } from './monokuma';

export const VAGAS_PADRAO = 16;
export const VAGAS_MIN = 2;
export const VAGAS_MAX = 40;

type Inscrito = { discordId: string; personagemId: string | null; tipo: 'participante' | 'reserva' };

/**
 * Só participante titular ocupa vaga. Reserva não ocupa (é a fila pra quando
 * alguém cai), e o host jogando de Monokuma também não: ele conduz a
 * partida, não é um dos estudantes.
 */
export function ocupamVaga(inscritos: Inscrito[]): Inscrito[] {
  return inscritos.filter((i) => i.tipo === 'participante' && i.personagemId !== ID_MONOKUMA);
}

export function vagasRestantes(inscritos: Inscrito[], vagas: number): number {
  return Math.max(0, vagas - ocupamVaga(inscritos).length);
}

/**
 * Quem já é titular pode atualizar o próprio personagem mesmo com a sala
 * cheia (a vaga já é dele); um novo titular só entra se sobrou vaga.
 * Reserva e Monokuma nunca são barrados por lotação.
 */
export function podeEntrarComoTitular(
  inscritos: Inscrito[], vagas: number, discordId: string, personagemId: string | null,
): boolean {
  if (personagemId === ID_MONOKUMA) return true;
  const outros = inscritos.filter((i) => i.discordId !== discordId);
  return ocupamVaga(outros).length < vagas;
}

export function validarVagas(vagas: number): void {
  if (!Number.isInteger(vagas) || vagas < VAGAS_MIN || vagas > VAGAS_MAX) {
    throw new Error(`Vagas precisa ser um número inteiro entre ${VAGAS_MIN} e ${VAGAS_MAX}.`);
  }
}
