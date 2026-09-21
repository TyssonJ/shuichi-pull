/**
 * A página da partida é montada no servidor e não se atualiza sozinha: quem a
 * abriu antes do host apertar "Começar" ficava com a contagem parada em
 * "AGORA" (nunca via o cronômetro), e quem a abriu durante o jogo continuava
 * vendo o cronômetro correr depois que o host finalizou. Um monitor confere o
 * estado de tempos em tempos; isto decide se mudou (e a página precisa recarregar).
 */
export type EstadoConhecido = { id: number; status: string; iniciadaEm: string | null };
export type EstadoNoServidor = { status: string; iniciadaEm: string | null; finalizadaEm?: string | null };

/** Partida que ainda pode mudar (vale a pena ficar de olho). */
export function estaEmMovimento(status: string): boolean {
  return status === 'agendada' || status === 'em_andamento';
}

/** Alguma partida da tela está diferente do que o servidor tem agora? */
export function algumaMudou(conhecidas: EstadoConhecido[], noServidor: Record<string, EstadoNoServidor | undefined>): boolean {
  return conhecidas.some((p) => {
    const atual = noServidor[String(p.id)];
    return atual !== undefined && (atual.status !== p.status || (atual.iniciadaEm ?? null) !== p.iniciadaEm);
  });
}

/** "14,15,20" → [14,15,20]: só inteiros positivos, sem repetir, no máximo `limite`. */
export function lerIds(texto: string | null, limite = 30): number[] {
  if (!texto) return [];
  const vistos = new Set<number>();
  for (const parte of texto.split(',')) {
    if (!/^\d{1,9}$/.test(parte.trim())) continue;
    const n = Number(parte);
    if (n > 0) vistos.add(n);
    if (vistos.size >= limite) break;
  }
  return [...vistos];
}
