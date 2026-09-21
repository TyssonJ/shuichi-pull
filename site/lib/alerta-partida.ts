/** O aviso global aparece a partir de 60 minutos antes e some 15 minutos
 * depois do horário — depois disso quem não entrou já sabe que perdeu. */
export const AVISO_ANTES_MIN = 60;
export const AVISO_DEPOIS_MIN = 15;

/** Intervalo de horários de partida que merece aviso, a partir de `agora`. */
export function limitesDoAviso(agora: Date): { de: Date; ate: Date } {
  return {
    de: new Date(agora.getTime() - AVISO_DEPOIS_MIN * 60_000),
    ate: new Date(agora.getTime() + AVISO_ANTES_MIN * 60_000),
  };
}

export type PartidaAvisada = { id: number; titulo: string; dataHora: string; tipo: 'participante' | 'reserva' };

/** Chave do "fechei este aviso" — por partida, pra fechar um não esconder o próximo. */
export function chaveAvisoFechado(partidaId: number): string {
  return `alerta-partida-fechado-${partidaId}`;
}
