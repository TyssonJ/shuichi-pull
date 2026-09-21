import { FUSO_SITE } from './fuso';

/**
 * Todo horário de partida é horário de Brasília (o padrão do site). Quem está
 * em outro fuso (Portugal, por exemplo) também vê o horário no relógio dele.
 */
export type HorarioLocal = {
  /** "seg., 21/09, 23:00" no fuso do aparelho. */
  texto: string;
  /** "GMT+1". */
  gmt: string;
  /** "Europe/Lisbon". */
  fuso: string;
};

function formatar(instante: Date, fuso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: fuso, weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(instante);
}

/**
 * O instante escrito no fuso do aparelho — ou null quando não acrescenta nada
 * (mesmo horário que em Brasília, ou fuso inválido). Compara o texto formatado
 * nos dois fusos em vez de deslocamentos, então vale também nos dias em que o
 * horário de verão de outro país muda.
 */
export function horarioNoFusoLocal(instante: Date, fusoLocal: string): HorarioLocal | null {
  if (Number.isNaN(instante.getTime())) return null;
  try {
    const local = formatar(instante, fusoLocal);
    if (local === formatar(instante, FUSO_SITE)) return null;
    const gmt = new Intl.DateTimeFormat('pt-BR', { timeZone: fusoLocal, timeZoneName: 'short' })
      .formatToParts(instante).find((p) => p.type === 'timeZoneName')?.value ?? fusoLocal;
    return { texto: local, gmt, fuso: fusoLocal };
  } catch {
    return null; // fuso que o navegador não reconhece
  }
}

/** O fuso do aparelho (só no navegador). */
export function fusoDoAparelho(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
