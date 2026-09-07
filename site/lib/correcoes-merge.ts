export type Colecao = 'personagens' | 'itens' | 'locais' | 'faq' | 'controles';

export type CorrecaoSalva = { valor: string; valorBase: string; autor: string; criadoEm: string };

/** registroId -> campo -> correção salva */
export type MapaCorrecoes = Map<string, Map<string, CorrecaoSalva>>;

export function obterCaminho(objeto: unknown, caminho: string): string | null {
  const valor = caminho.split('.').reduce<unknown>((atual, chave) => {
    if (atual && typeof atual === 'object') return (atual as Record<string, unknown>)[chave];
    return undefined;
  }, objeto);
  return typeof valor === 'string' ? valor : null;
}

/** Escreve um valor num caminho pontilhado sem mutar o objeto original,
 * criando objetos intermediários que estejam ausentes ou nulos. */
export function definirCaminho<T extends object>(objeto: T, caminho: string, valor: string): T {
  const partes = caminho.split('.');
  const clone = { ...objeto } as Record<string, unknown>;
  let atual = clone;

  for (let i = 0; i < partes.length - 1; i++) {
    const chave = partes[i];
    const existente = atual[chave];
    atual[chave] = existente && typeof existente === 'object' ? { ...existente } : {};
    atual = atual[chave] as Record<string, unknown>;
  }

  atual[partes[partes.length - 1]] = valor;
  return clone as T;
}

export function aplicarCorrecoes<T extends { id: string }>(
  registros: T[],
  correcoes: MapaCorrecoes,
): T[] {
  return registros.map((registro) => {
    const doRegistro = correcoes.get(registro.id);
    if (!doRegistro) return registro;

    let corrigido = registro;
    for (const [campo, correcao] of doRegistro) {
      corrigido = definirCaminho(corrigido, campo, correcao.valor);
    }
    return corrigido;
  });
}
