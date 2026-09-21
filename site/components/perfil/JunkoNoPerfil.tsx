import { lerUrlDoBot } from '@/lib/junko/servico';
import { buscarPerfilDoBot } from '@/lib/junko/estatisticas-bot';
import { CartaoJunko } from './CartaoJunko';

/**
 * Busca o perfil da pessoa no Junko Bot e mostra o cartão. Quem nunca usou o
 * bot, ou o bot fora do ar, ou uma resposta esquisita: não mostra nada — o
 * perfil do site nunca ganha uma mensagem de erro por causa de um serviço de fora.
 */
export async function JunkoNoPerfil({ discordId }: { discordId: string }) {
  const perfil = await buscarPerfilDoBot(await lerUrlDoBot(), discordId);
  return perfil.ok ? <CartaoJunko perfil={perfil.dados} /> : null;
}
