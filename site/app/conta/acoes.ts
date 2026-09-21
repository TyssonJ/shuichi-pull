'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { validarBio, validarBanner } from '@/lib/perfil-visual';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

export async function atualizarPerfilAction(dados: { uuidGmod: string | null; mains: string[] }) {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');

  const antes = await repositorioUsuarios.buscar(sessao.user.discordId);
  await repositorioUsuarios.atualizarPerfil(sessao.user.discordId, dados);
  revalidatePath('/conta');
  // UID novo volta a "pendente": o bot pode chamar a moderação no Discord.
  if (dados.uuidGmod && dados.uuidGmod !== antes?.uuidGmod) {
    emitirEvento({ tipo: 'uid.enviado', discordId: sessao.user.discordId, uid: dados.uuidGmod });
  }
}

/** Descrição e banner do perfil público. Quem decide o que vale é o
 * servidor: a prévia do editor só antecipa, nunca substitui esta validação. */
async function salvarPersonalizacaoAction_(dados: {
  bio: string; bannerTipo: string; bannerValor: string;
}) {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');

  const bio = validarBio(dados.bio);
  if (!bio.ok) throw new ErroDeNegocio(bio.erro);

  const elenco = new Set((await listarPersonagensComCorrecoes()).map((p) => p.id));
  const banner = validarBanner(dados.bannerTipo, dados.bannerValor, elenco);
  if (!banner.ok) throw new ErroDeNegocio(banner.erro);

  await repositorioUsuarios.atualizarPersonalizacao(discordId, {
    bio: bio.valor, bannerTipo: banner.valor.tipo, bannerValor: banner.valor.valor,
  });
  revalidatePath('/conta');
  revalidatePath(`/u/${discordId}`);
}

export async function salvarPersonalizacaoAction(...args: Parameters<typeof salvarPersonalizacaoAction_>) {
  return executar(() => salvarPersonalizacaoAction_(...args));
}
