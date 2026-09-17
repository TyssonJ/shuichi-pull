/** Título exibido no perfil público conforme partidas finalizadas —
 * cresce em ordem, do mais alto pro mais baixo que a contagem alcança. */
const DEGRAUS: { min: number; titulo: string }[] = [
  { min: 20, titulo: 'Lenda da Academia' },
  { min: 8, titulo: 'Sobrevivente Veterano' },
  { min: 3, titulo: 'Estudante Confirmado' },
  { min: 1, titulo: 'Calouro' },
];

export function tituloPorPartidas(partidasFinalizadas: number): string | null {
  const degrau = DEGRAUS.find((d) => partidasFinalizadas >= d.min);
  return degrau?.titulo ?? null;
}
