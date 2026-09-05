export type TipoAtributo = 'speed' | 'capacity' | 'attention';

const PADROES: Record<TipoAtributo, RegExp> = {
  speed: /Run speed (\d+)/i,
  capacity: /Capacity (\d+)/i,
  attention: /Perception (\d+)/i,
};

export function extrairValor(valor: string, tipo: TipoAtributo): number | null {
  const achado = PADROES[tipo].exec(valor);
  return achado ? Number(achado[1]) : null;
}
