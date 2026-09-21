const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Tempo até a partida, no formato de HUD: "2d 04h", "03h 12m", "12m 05s".
 * Só mostra a unidade de baixo quando ainda importa (a menos de um dia não
 * precisa de segundos; a menos de uma hora, precisa).
 */
export function formatarRestante(ms: number): string {
  if (ms <= 0) return 'AGORA';
  const s = Math.floor(ms / 1000);
  const dias = Math.floor(s / 86400);
  const horas = Math.floor((s % 86400) / 3600);
  const minutos = Math.floor((s % 3600) / 60);
  const segundos = s % 60;
  if (dias > 0) return `${dias}d ${pad(horas)}h`;
  if (horas > 0) return `${pad(horas)}h ${pad(minutos)}m`;
  return `${pad(minutos)}m ${pad(segundos)}s`;
}

/** De quanto em quanto tempo vale redesenhar: 1s na reta final, 30s antes. */
export function intervaloDaContagem(ms: number): number {
  return ms < 3_600_000 ? 1000 : 30_000;
}
