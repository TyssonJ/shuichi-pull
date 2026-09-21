/**
 * O site é da comunidade BR/PT e todo horário de partida é horário de
 * Brasília. Nada aqui depende do fuso de quem roda o código: o servidor da
 * Vercel roda em UTC e o navegador em qualquer um, e ler/formatar data "no
 * fuso local" fazia a partida gravar 3 horas fora do que o host digitou.
 */
export const FUSO_SITE = 'America/Sao_Paulo';
export const ROTULO_FUSO = 'horário de Brasília';

const FORMATO_INPUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * "2026-09-21T20:00" — o valor de um <input type="datetime-local"> — lido
 * como horário de Brasília. Brasília não tem horário de verão desde 2019, então
 * o deslocamento fixo de -03:00 é exato para datas futuras. Inválido → Invalid Date.
 */
export function dateDeBrasilia(local: string): Date {
  if (!FORMATO_INPUT.test(local)) return new Date(NaN);
  return new Date(`${local}:00-03:00`);
}

/** O inverso: o instante como valor de <input datetime-local>, em Brasília. */
export function paraInputBrasilia(d: Date): string {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_SITE, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(d);
  const v = (tipo: string) => p.find((x) => x.type === tipo)!.value;
  return `${v('year')}-${v('month')}-${v('day')}T${v('hour')}:${v('minute')}`;
}

/** "seg., 21/09, 20:00" */
export function formatarDataHoraBR(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_SITE, weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(d);
}

/** "21/09/26" (ou com o ano inteiro, se pedido). */
export function formatarDataBR(d: Date, anoCompleto = false): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_SITE, day: '2-digit', month: '2-digit', year: anoCompleto ? 'numeric' : '2-digit',
  }).format(d);
}
