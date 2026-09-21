/**
 * O cronômetro e a contagem das partidas comparam um horário do SERVIDOR
 * (quando o host apertou "Começar", ou o horário marcado) com "agora". Se o
 * "agora" for o relógio do aparelho, cada pessoa vê um tempo diferente
 * (relógio adiantado ou atrasado é comum), e quem está atrasado via o
 * cronômetro parado em 00:00:00. Por isso o navegador pergunta a hora ao
 * servidor e guarda a diferença — o método é o do NTP, em miniatura.
 */
export type AmostraDeRelogio = {
  /** Hora do servidor (ms desde 1970) na resposta. */
  servidorMs: number;
  /** Quanto a ida e volta demorou (ms), medido com relógio monotônico. */
  idaEVoltaMs: number;
  /** Relógio do aparelho (ms desde 1970) quando a resposta chegou. */
  aparelhoNaChegadaMs: number;
};

/** Ida e volta abaixo disso já é boa o bastante: para de medir. */
export const IDA_E_VOLTA_BOA_MS = 150;

/**
 * Quantos ms somar ao relógio do aparelho pra obter o do servidor. A hora do
 * servidor foi lida em algum ponto entre o envio e a chegada; supondo ida e
 * volta iguais, quando a resposta chega o servidor já está metade da viagem
 * à frente.
 */
export function deslocamentoDaAmostra(a: AmostraDeRelogio): number {
  return a.servidorMs + a.idaEVoltaMs / 2 - a.aparelhoNaChegadaMs;
}

/** A amostra mais confiável é a de menor ida e volta (menos incerteza). */
export function melhorAmostra(amostras: AmostraDeRelogio[]): AmostraDeRelogio | null {
  const validas = amostras.filter((a) => Number.isFinite(a.servidorMs) && Number.isFinite(a.idaEVoltaMs) && a.idaEVoltaMs >= 0);
  if (validas.length === 0) return null;
  return validas.reduce((melhor, a) => (a.idaEVoltaMs < melhor.idaEVoltaMs ? a : melhor));
}
