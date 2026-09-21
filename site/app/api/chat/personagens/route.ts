import { auth } from '@/auth';
import cores from '@/data/cores-personagens.json';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { corDoPersonagem } from '@/lib/chat';

/**
 * Elenco com a cor de cada personagem, pra escrever e mostrar menções no chat.
 * A cor vem do sprite (calculada por scripts/gerar-cores-personagens.mjs); quem
 * não tem sprite usa uma cor derivada do id. Muda pouco: o navegador guarda por uma hora.
 */
export async function GET() {
  const sessao = await auth();
  if (!sessao?.user?.discordId) return Response.json({ erro: 'Entre com o Discord pra usar o chat.' }, { status: 401 });

  const mapa = cores as Record<string, string>;
  const elenco = await listarPersonagensComCorrecoes();
  return Response.json(
    { personagens: elenco.map((p) => ({ id: p.id, nome: p.nome, cor: corDoPersonagem(p.id, mapa[p.id]) })) },
    { headers: { 'Cache-Control': 'private, max-age=3600' } },
  );
}
