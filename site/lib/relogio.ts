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

/**
 * Quantos ms somar ao relógio do aparelho pra obter o do servidor. A hora do
 * servidor foi lida em algum ponto entre o envio e a chegada; supondo ida e
 * volta iguais, quando a resposta chega o servidor já está metade da viagem
 * à frente.
 */
export function deslocamentoDaAmostra(a: AmostraDeRelogio): number {
  return a.servidorMs + a.idaEVoltaMs / 2 - a.aparelhoNaChegadaMs;
}
