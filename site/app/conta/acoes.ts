'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { validarBio, validarBanner } from '@/lib/perfil-visual';
import { validarApelido, resolverAvatar } from '@/lib/identidade';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

export async function atualizarPerfilAction(dados: { uuidGmod: string | null; mains: string[] }) {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');

  const antes = await repositorioUsuarios.buscar(sessao.user.discordId);
  await repositorioUsuarios.atualizarPerfil(sessao.user.discordId, dados);
  revalidatePath('/conta');
  // A ficha de cada personagem lista quem joga de main: revalida os que entraram e os que saíram.
  const mudaram = new Set([...(antes?.mains ?? []), ...dados.mains]);
  for (const id of mudaram) {
    if (!(antes?.mains ?? []).includes(id) || !dados.mains.includes(id)) revalidatePath(`/elenco/${id}`);
  }
  // UID novo volta a "pendente": o bot pode chamar a moderação no Discord.
  if (dados.uuidGmod && dados.uuidGmod !== antes?.uuidGmod) {
    emitirEvento({ tipo: 'uid.enviado', discordId: sessao.user.discordId, uid: dados.uuidGmod });
  }
}

/** Descrição e banner do perfil público. Quem decide o que vale é o
 * servidor: a prévia do editor só antecipa, nunca substitui esta validação. */
async function salvarPersonalizacaoAction_(dados: {
  bio: string; bannerTipo: string; bannerValor: string;
  /** Apelido e ícone vão juntos: o editor sempre manda os dois. Omitidos = não mexe. */
  apelido?: string; avatarTipo?: string; avatarValor?: string;
}) {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');

  const bio = validarBio(dados.bio);
  if (!bio.ok) throw new ErroDeNegocio(bio.erro);

  const personagens = await listarPersonagensComCorrecoes();
  const elenco = new Set(personagens.map((p) => p.id));
  const banner = validarBanner(dados.bannerTipo, dados.bannerValor, elenco);
  if (!banner.ok) throw new ErroDeNegocio(banner.erro);

  // Identidade (apelido + ícone): valida antes de gravar qualquer coisa.
  let identidade: Parameters<typeof repositorioUsuarios.atualizarIdentidade>[1] | null = null;
  if (dados.apelido !== undefined && dados.avatarTipo !== undefined) {
    const apelido = validarApelido(dados.apelido);
    if (!apelido.ok) throw new ErroDeNegocio(apelido.erro);
    const sprites = new Map(personagens.map((p) => [p.id, p.sprite] as const));
    const avatar = resolverAvatar(dados.avatarTipo, dados.avatarValor ?? '', sprites);
    if (!avatar.ok) throw new ErroDeNegocio(avatar.erro);
    identidade = {
      apelido: apelido.valor,
      avatarTipo: avatar.valor?.tipo ?? null,
      avatarValor: avatar.valor?.valor ?? null,
      avatarUrl: avatar.valor?.url ?? null,
    };
  }

  await repositorioUsuarios.atualizarPersonalizacao(discordId, {
    bio: bio.valor, bannerTipo: banner.valor.tipo, bannerValor: banner.valor.valor,
  });
  if (identidade) await repositorioUsuarios.atualizarIdentidade(discordId, identidade);
  revalidatePath('/conta');
  revalidatePath(`/u/${discordId}`);
  // Apelido e ícone aparecem na ficha dos personagens que a pessoa joga de main.
  if (identidade) {
    for (const id of (await repositorioUsuarios.buscar(discordId))?.mains ?? []) revalidatePath(`/elenco/${id}`);
  }
}

export async function salvarPersonalizacaoAction(...args: Parameters<typeof salvarPersonalizacaoAction_>) {
  return executar(() => salvarPersonalizacaoAction_(...args));
}
