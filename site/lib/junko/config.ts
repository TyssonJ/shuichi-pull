/** Chaves da tabela `configuracoes` que a integração usa. As que começam com
 * "segredo." nunca saem de `repositorioConfiguracoes.listar()`. */
export const CFG_JUNKO = {
  chaveHash: 'segredo.junko.chave_hash',
  chaveSaida: 'segredo.junko.chave_saida',
  url: 'junko.url',
  eventosAtivos: 'junko.eventos_ativos',
  caminhoAvaliacoes: 'junko.caminho_avaliacoes',
  ultimaImportacao: 'junko.avaliacoes_ultima_importacao',
} as const;

export const URL_JUNKO_PADRAO = 'https://junkobott.squareweb.app';
/** Rota do bot que recebe os eventos do site (contrato em docs/junko-bot-api.md). */
export const CAMINHO_EVENTOS_JUNKO = '/eventos';
export const URL_SITE = 'https://shuichipull.vercel.app';

type Resultado = { ok: true; valor: string } | { ok: false; erro: string };

/**
 * A URL do bot é escolhida por um chefe e o servidor do site faz requisições
 * pra ela. Por isso só https e nada que aponte pra dentro da rede (localhost,
 * IP, .local/.internal): o site não pode virar ponte pra serviço interno.
 */
export function validarUrlJunko(entrada: string): Resultado {
  let url: URL;
  try {
    url = new URL(entrada.trim());
  } catch {
    return { ok: false, erro: 'Isso não parece um endereço válido.' };
  }

  if (url.protocol !== 'https:') return { ok: false, erro: 'O endereço precisa começar com https://.' };
  if (url.username || url.password) return { ok: false, erro: 'O endereço não pode ter usuário e senha.' };

  const host = url.hostname.toLowerCase();
  const ehIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[');
  const interno = host === 'localhost' || /\.(localhost|local|internal|lan|home)$/.test(host);
  if (ehIp || interno || !host.includes('.')) {
    return { ok: false, erro: 'Use o endereço público do bot (nada de IP, localhost ou rede interna).' };
  }

  // Só origem + caminho base: sem query nem #, e sem barra sobrando no fim.
  return { ok: true, valor: (url.origin + url.pathname).replace(/\/+$/, '') };
}
