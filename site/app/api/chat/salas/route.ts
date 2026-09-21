import { auth } from '@/auth';
import { repositorioChat } from '@/db/repositorios/chat';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { SALA_GERAL, salaDaPartida } from '@/lib/chat';

const SEM_CACHE = { headers: { 'Cache-Control': 'no-store' } };

/**
 * Salas que a pessoa pode abrir: a geral e a de cada partida em aberto em que
 * ela está (ADM vê a de todas). Sem login devolve 401 — é assim que o botão do
 * chat sabe que não deve aparecer.
 */
export async function GET() {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) return Response.json({ erro: 'Entre com o Discord pra usar o chat.' }, { status: 401, ...SEM_CACHE });

  const ehAdm = Boolean(sessao.user.papel);
  const abertas = ehAdm
    ? (await repositorioPartidas.listarAbertas()).filter((p) => p.status === 'agendada' || p.status === 'em_andamento')
    : await repositorioChat.salasDePartida(discordId);

  return Response.json({
    eu: discordId,
    ehAdm,
    salas: [
      { id: SALA_GERAL, nome: 'GERAL' },
      ...abertas.map((p) => ({ id: salaDaPartida(p.id), nome: p.titulo })),
    ],
  }, SEM_CACHE);
}
