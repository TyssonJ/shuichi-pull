export type EstadoBot = {
  online: boolean;
  /** Tempo de resposta em ms (só quando respondeu). */
  ms?: number;
  /** O que o bot disse na raiz (campo `mensagem` do JSON), se disse. */
  mensagem?: string;
  erro?: string;
};

const TIMEOUT_MS = 3000;

/** Pergunta ao bot se está de pé: GET na raiz, que hoje responde
 * {"status":"online","bot":"JunkoBot","mensagem":"…"}. Nunca lança. */
export async function pingarBot(
  url: string,
  deps: { buscar?: typeof fetch; agora?: () => number } = {},
): Promise<EstadoBot> {
  const buscar = deps.buscar ?? fetch;
  const agora = deps.agora ?? Date.now;
  const inicio = agora();

  try {
    const resposta = await buscar(`${url}/`, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'manual', cache: 'no-store' });
    const ms = agora() - inicio;
    if (!resposta.ok) return { online: false, ms, erro: `o bot respondeu HTTP ${resposta.status}` };

    let mensagem: string | undefined;
    try {
      const json = (await resposta.json()) as { status?: unknown; mensagem?: unknown };
      if (typeof json.mensagem === 'string') mensagem = json.mensagem.slice(0, 200);
      if (json.status !== undefined && json.status !== 'online') {
        return { online: false, ms, mensagem, erro: `o bot diz que está "${String(json.status)}"` };
      }
    } catch { /* resposta que não é JSON: ainda assim respondeu 200 */ }
    return { online: true, ms, mensagem };
  } catch (e) {
    const nome = e instanceof Error ? e.name : '';
    return {
      online: false,
      erro: nome === 'TimeoutError' || nome === 'AbortError' ? `não respondeu em ${TIMEOUT_MS / 1000}s` : 'não deu pra conectar',
    };
  }
}
