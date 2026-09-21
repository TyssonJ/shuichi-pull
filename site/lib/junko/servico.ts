import { after } from 'next/server';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { CFG_JUNKO, URL_JUNKO_PADRAO, validarUrlJunko } from './config';
import { criarNotificador, type ConfigEnvio } from './enviar';
import type { EventoJunko } from './eventos';

/** Endereço do bot para LER dados públicos dele (perfil e ranking). Mesma regra
 * de segurança da URL de envio: inválida ou ausente cai no endereço padrão. */
export async function lerUrlDoBot(): Promise<string> {
  const url = await repositorioConfiguracoes.obter(CFG_JUNKO.url);
  const validada = url ? validarUrlJunko(url) : null;
  return validada?.ok ? validada.valor : URL_JUNKO_PADRAO;
}

/** Lê a configuração de envio. A URL é revalidada na leitura, não só ao
 * salvar: se algo estranho entrar no banco, cai no endereço padrão. */
export async function lerConfigEnvio(): Promise<ConfigEnvio> {
  const [ativo, url, chave] = await Promise.all([
    repositorioConfiguracoes.obter(CFG_JUNKO.eventosAtivos),
    repositorioConfiguracoes.obter(CFG_JUNKO.url),
    repositorioConfiguracoes.obter(CFG_JUNKO.chaveSaida),
  ]);
  const validada = url ? validarUrlJunko(url) : null;
  return {
    ativo: ativo === 'true',
    url: validada?.ok ? validada.valor : URL_JUNKO_PADRAO,
    chave: chave || null,
  };
}

export const notificarJunko = criarNotificador({
  config: lerConfigEnvio,
  buscar: (url, init) => fetch(url, init),
  registrarFalha: (evento, motivo) => repositorioAuditoria.registrar({
    autor: 'sistema', acao: 'junko.falha', alvo: `junko/${evento}`, valorAntigo: null, valorNovo: motivo,
  }),
  agora: () => new Date(),
});

/**
 * Avisa o bot depois que a resposta ao usuário já saiu (`after`), pra o bot
 * lento ou fora do ar nunca atrasar uma ação do site. Fora de uma requisição
 * (scripts, testes) `after` não existe, então cai no envio direto.
 */
export function emitirEvento(evento: EventoJunko): void {
  try {
    after(() => notificarJunko(evento));
  } catch {
    void notificarJunko(evento);
  }
}
