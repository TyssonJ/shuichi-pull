/** Caminho da rota do bot que devolve as avaliações dele (configurável no painel). */
export const CAMINHO_AVALIACOES_PADRAO = '/avaliacoes';

/** Só um caminho simples: nada de esquema, "..", query ou barra dupla — o
 * chefe escolhe a ROTA do bot, não um endereço qualquer. */
export function validarCaminhoAvaliacoes(entrada: string): { ok: true; valor: string } | { ok: false; erro: string } {
  const c = entrada.trim();
  if (!/^\/[A-Za-z0-9._\-/]{0,100}$/.test(c) || c.includes('..') || c.includes('//')) {
    return { ok: false, erro: 'Use só o caminho da rota, começando com / (ex.: /avaliacoes).' };
  }
  return { ok: true, valor: c };
}

export type BuscaDoBot = { ok: true; bruto: unknown } | { ok: false; erro: string };

const TIMEOUT_MS = 8000;

/**
 * Puxa as avaliações do bot: GET <url><caminho>?desde=<ISO>. Aceita tanto
 * uma lista quanto {"avaliacoes": [...]}. Nunca lança — falha vira mensagem
 * que o painel mostra ao chefe.
 */
export async function buscarAvaliacoesDoBot(
  cfg: { url: string; caminho: string; chave: string | null; desde: string | null },
  buscar: typeof fetch = fetch,
): Promise<BuscaDoBot> {
  const alvo = new URL(cfg.url + cfg.caminho);
  if (cfg.desde) alvo.searchParams.set('desde', cfg.desde);

  const cabecalhos: Record<string, string> = { Accept: 'application/json', 'X-Origem': 'shuichipull' };
  if (cfg.chave) cabecalhos.Authorization = `Bearer ${cfg.chave}`;

  try {
    const resposta = await buscar(alvo.toString(), {
      headers: cabecalhos, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'manual', cache: 'no-store',
    });
    if (resposta.status === 404) {
      return { ok: false, erro: `O bot ainda não tem a rota ${cfg.caminho} (HTTP 404). Ela precisa devolver as avaliações — veja o contrato.` };
    }
    if (!resposta.ok) return { ok: false, erro: `O bot respondeu HTTP ${resposta.status}.` };

    let json: unknown;
    try {
      json = await resposta.json();
    } catch {
      return { ok: false, erro: 'O bot respondeu, mas não com JSON.' };
    }
    const lista = Array.isArray(json) ? json : (json as { avaliacoes?: unknown } | null)?.avaliacoes;
    if (!Array.isArray(lista)) return { ok: false, erro: 'O JSON do bot precisa ser uma lista ou {"avaliacoes": [...]}.' };
    return { ok: true, bruto: lista };
  } catch (e) {
    const nome = e instanceof Error ? e.name : '';
    return { ok: false, erro: nome === 'TimeoutError' || nome === 'AbortError' ? `O bot não respondeu em ${TIMEOUT_MS / 1000}s.` : 'Não deu pra conectar no bot.' };
  }
}
