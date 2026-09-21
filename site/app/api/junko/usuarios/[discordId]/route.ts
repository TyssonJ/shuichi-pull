import { exigirChaveJunko } from '@/lib/junko/autenticar';
import { discordIdValido, naoEncontrado } from '@/lib/junko/http';
import { URL_SITE } from '@/lib/junko/config';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';

/** Perfil de um jogador no site: UID e status, mains, descrição e estatísticas. */
export async function GET(request: Request, { params }: { params: Promise<{ discordId: string }> }) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const { discordId } = await params;
  if (!discordIdValido(discordId)) return Response.json({ erro: 'discordId inválido.' }, { status: 400 });

  const usuario = await repositorioUsuarios.buscar(discordId);
  if (!usuario) return naoEncontrado('Essa pessoa ainda não entrou no site.');

  const { estatisticas } = await repositorioPartidas.perfilDoUsuario(discordId);
  return Response.json({
    discordId: usuario.discordId,
    nome: usuario.discordNome,
    uid: usuario.uuidGmod,
    uidStatus: usuario.uuidStatus,
    podeSerHost: usuario.podeSerHost,
    mains: usuario.mains,
    bio: usuario.bio,
    perfilUrl: `${URL_SITE}/u/${usuario.discordId}/`,
    estatisticas,
  });
}
