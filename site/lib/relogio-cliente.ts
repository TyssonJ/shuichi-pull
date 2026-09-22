import { deslocamentoDaAmostra, type AmostraDeRelogio } from './relogio';

/** Endereço que devolve a hora do servidor (o site usa barra no final). */
export const CAMINHO_HORA = '/api/hora/';

/** Depois disso a diferença é medida de novo (relógios derivam, aparelho volta de suspensão). */
const REVALIDAR_MS = 10 * 60 * 1000;

let deslocamento = 0;
let sincronizadoEm: number | null = null;
let emAndamento: Promise<void> | null = null;

/**
 * "Agora" de verdade: o relógio do aparelho corrigido pela diferença medida
 * contra o servidor. Sem medição (ainda, ou se a rede falhou) é o do aparelho.
 */
export function agoraSincronizado(): number {
  return Date.now() + deslocamento;
}

export function relogioJaSincronizado(): boolean {
  return sincronizadoEm !== null;
}

/** Só pra teste. */
export function reiniciarRelogio(): void {
  deslocamento = 0;
  sincronizadoEm = null;
  emAndamento = null;
}

async function medir(buscar: typeof fetch): Promise<AmostraDeRelogio | null> {
  try {
    const inicio = performance.now();
    const resposta = await buscar(CAMINHO_HORA, { cache: 'no-store' });
    const idaEVoltaMs = performance.now() - inicio;
    const aparelhoNaChegadaMs = Date.now();
    if (!resposta.ok) return null;
    const corpo = (await resposta.json()) as { agora?: unknown };
    if (typeof corpo.agora !== 'number') return null;
    return { servidorMs: corpo.agora, idaEVoltaMs, aparelhoNaChegadaMs };
  } catch {
    return null;
  }
}

/** Mede a diferença uma vez e guarda. */
export async function sincronizarRelogio(buscar: typeof fetch = fetch): Promise<void> {
  const amostra = await medir(buscar);
  if (amostra) {
    deslocamento = deslocamentoDaAmostra(amostra);
    sincronizadoEm = Date.now();
  }
}

/**
 * Garante que o relógio foi sincronizado há pouco. Várias chamadas ao mesmo
 * tempo dividem a mesma medição. NUNCA rejeita: falha de rede deixa o relógio
 * do aparelho, como era antes.
 */
export function garantirSincronia(buscar: typeof fetch = fetch): Promise<void> {
  if (emAndamento) return emAndamento;
  if (sincronizadoEm !== null && Date.now() - sincronizadoEm < REVALIDAR_MS) return Promise.resolve();
  emAndamento = sincronizarRelogio(buscar)
    .catch(() => {})
    .finally(() => { emAndamento = null; });
  return emAndamento;
}
