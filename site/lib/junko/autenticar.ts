import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { CFG_JUNKO } from './config';
import { chaveConfere, extrairBearer } from './chave';

/** Autor que aparece na auditoria quando o bot altera algo no site. */
export const AUTOR_JUNKO = 'junko-bot';

/**
 * Confere a chave do bot numa rota /api/junko. Devolve a resposta de erro
 * (e a rota deve retorná-la) ou null se pode seguir.
 * Sem chave gerada no painel, a API inteira fica fechada (503): "sem
 * configuração" nunca pode virar "sem autenticação".
 */
export async function exigirChaveJunko(request: Request): Promise<Response | null> {
  const hash = await repositorioConfiguracoes.obter(CFG_JUNKO.chaveHash);
  if (!hash) {
    return Response.json({ erro: 'A integração ainda não foi configurada no painel do site.' }, { status: 503 });
  }
  const chave = extrairBearer(request.headers.get('authorization'));
  if (!chave || !chaveConfere(chave, hash)) {
    return Response.json({ erro: 'Chave inválida.' }, { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } });
  }
  return null;
}
