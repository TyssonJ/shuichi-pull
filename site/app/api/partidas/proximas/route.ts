import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { limitesDoAviso } from '@/lib/alerta-partida';

/**
 * Partidas prestes a começar em que quem está logado se inscreveu. Sem
 * sessão devolve lista vazia (não 401): o banner do site chama isso em toda
 * página, inclusive pra visitante anônimo, e "nada a avisar" é a resposta certa.
 */
export async function GET() {
  const sessao = await auth();
  const semCache = { headers: { 'Cache-Control': 'no-store' } };
  if (!sessao?.user?.discordId) return Response.json({ partidas: [] }, semCache);

  const { de, ate } = limitesDoAviso(new Date());
  const partidas = await repositorioPartidas.proximasDoUsuario(sessao.user.discordId, de, ate);
  return Response.json({ partidas }, semCache);
}
