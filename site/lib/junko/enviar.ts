import { CAMINHO_EVENTOS_JUNKO, URL_JUNKO_PADRAO } from './config';
import { montarPayload, type EventoJunko } from './eventos';

export type ConfigEnvio = {
  /** Interruptor do chefe: enquanto o bot não recebe eventos, fica desligado. */
  ativo: boolean;
  url: string;
  /** Credencial que o bot exige pra aceitar eventos (opcional). */
  chave: string | null;
};

export type ResultadoEnvio = { enviado: boolean; motivo?: string; status?: number };

export type DepsEnvio = {
  config: () => Promise<ConfigEnvio>;
  buscar: (url: string, init: RequestInit) => Promise<Response>;
  registrarFalha: (evento: string, motivo: string) => Promise<void>;
  agora: () => Date;
};

const TIMEOUT_MS = 4000;
/** Bot fora do ar geraria uma linha de log por evento; assim sai no máximo uma por minuto. */
const INTERVALO_LOG_FALHA_MS = 60_000;

/**
 * Manda um evento ao Junko Bot. NUNCA lança: um bot fora do ar não pode
 * derrubar quem está criando uma partida no site. Falha vira resultado (e
 * uma linha no log de auditoria, com limite de frequência).
 * `forcar` ignora o interruptor — é o botão "enviar teste" do painel.
 */
export function criarNotificador(deps: DepsEnvio) {
  let ultimoLog = 0;

  return async function notificar(evento: EventoJunko, opcoes: { forcar?: boolean } = {}): Promise<ResultadoEnvio> {
    let config: ConfigEnvio;
    try {
      config = await deps.config();
    } catch {
      return { enviado: false, motivo: 'não deu pra ler a configuração' };
    }
    if (!config.ativo && !opcoes.forcar) return { enviado: false, motivo: 'envio de eventos desligado' };

    const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json', 'X-Origem': 'shuichipull' };
    if (config.chave) cabecalhos.Authorization = `Bearer ${config.chave}`;

    let resultado: ResultadoEnvio;
    try {
      const resposta = await deps.buscar(config.url + CAMINHO_EVENTOS_JUNKO, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify(montarPayload(evento, deps.agora())),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'manual',
      });
      resultado = resposta.ok
        ? { enviado: true, status: resposta.status }
        : { enviado: false, status: resposta.status, motivo: `o bot respondeu HTTP ${resposta.status}` };
    } catch (e) {
      const nome = e instanceof Error ? e.name : '';
      resultado = {
        enviado: false,
        motivo: nome === 'TimeoutError' || nome === 'AbortError'
          ? `o bot não respondeu em ${TIMEOUT_MS / 1000}s`
          : 'não deu pra conectar no bot',
      };
    }

    if (!resultado.enviado) {
      const agora = deps.agora().getTime();
      if (opcoes.forcar || agora - ultimoLog >= INTERVALO_LOG_FALHA_MS) {
        ultimoLog = agora;
        try { await deps.registrarFalha(evento.tipo, resultado.motivo ?? 'falha'); } catch { /* o log não pode derrubar o envio */ }
      }
    }
    return resultado;
  };
}

export { URL_JUNKO_PADRAO };
