export type StatusPartida = 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';

/** De onde a partida pode ir. Finalizada e cancelada são pontos finais. */
const TRANSICOES: Record<StatusPartida, readonly StatusPartida[]> = {
  agendada: ['em_andamento', 'cancelada'],
  em_andamento: ['finalizada', 'cancelada'],
  finalizada: [],
  cancelada: [],
};

export function transicaoValida(de: StatusPartida, para: StatusPartida): boolean {
  return TRANSICOES[de].includes(para);
}

/** Partida que ainda pode mudar de estado (não é ponto final). */
export function estaAberta(status: StatusPartida): boolean {
  return TRANSICOES[status].length > 0;
}

/** Quanto a partida durou: só existe se foi iniciada E finalizada. */
export function duracaoMs(iniciadaEm: Date | null, finalizadaEm: Date | null): number | null {
  if (!iniciadaEm || !finalizadaEm) return null;
  return Math.max(0, finalizadaEm.getTime() - iniciadaEm.getTime());
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Duração legível pra texto corrido: "1h 12min", "42min", "38s". */
export function formatarDuracao(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  if (horas > 0) return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
  if (minutos > 0) return `${minutos}min`;
  return `${segundos}s`;
}

/** Cronômetro de HUD: "00:42:07". Passa de 99h sem quebrar o formato. */
export function formatarCronometro(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
