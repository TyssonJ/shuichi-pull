export type Coluna = { valor: number; quantidade: number; ehOValor: boolean };

export type Distribuicao = {
  colunas: Coluna[];
  min: number; max: number; media: number;
  abaixo: number; iguais: number; acima: number; total: number;
};

export function calcularDistribuicao(
  valores: number[], valor: number, passo?: number
): Distribuicao {
  if (valores.length === 0) throw new Error('calcularDistribuicao precisa de ao menos um valor');

  const contagem = new Map<number, number>();
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1);

  const min = Math.min(...valores);
  const max = Math.max(...valores);

  const chaves: number[] = passo
    ? Array.from({ length: Math.floor((max - min) / passo) + 1 }, (_, i) => min + i * passo)
    : [...contagem.keys()].sort((a, b) => a - b);

  const colunas: Coluna[] = chaves.map((v) => ({
    valor: v,
    quantidade: contagem.get(v) ?? 0,
    ehOValor: v === valor,
  }));

  const soma = valores.reduce((a, b) => a + b, 0);

  return {
    colunas, min, max,
    media: soma / valores.length,
    abaixo: valores.filter((v) => v < valor).length,
    iguais: valores.filter((v) => v === valor).length,
    acima: valores.filter((v) => v > valor).length,
    total: valores.length,
  };
}

export function frasePosicao(d: Distribuicao, maiorEhMelhor: boolean): string {
  // "No grupo mais baixo" só informa quando o empate é minoria: se metade do
  // elenco compartilha o valor, o que importa é quantos sobraram acima.
  if (d.abaixo === 0 && d.iguais <= d.total / 2) {
    return `no grupo mais baixo · ${d.iguais} de ${d.total} empatam`;
  }
  return maiorEhMelhor
    ? `${d.acima} de ${d.total} estão acima`
    : `${d.abaixo} de ${d.total} estão melhor`;
}
