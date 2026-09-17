'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';

async function exigirSessao() {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new Error('Entra com o Discord primeiro.');
  return sessao;
}

/** Devolve o id em vez de redirecionar direto — `redirect()` precisa correr
 * fora de try/catch, e o formulário (compartilhado com o de editar) sempre
 * chama `aoSalvar` dentro de um try/catch pra mostrar erro de validação.
 * Quem cria navega pro id depois, no cliente. */
export async function criarPartidaAction(
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null },
): Promise<number> {
  const sessao = await exigirSessao();
  if (!args.titulo.trim()) throw new Error('Dá um título pra partida.');
  const dataHora = new Date(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new Error('Data/hora inválida.');

  const id = await repositorioPartidas.criar({
    titulo: args.titulo.trim(),
    hostDiscordId: sessao.user.discordId,
    dataHora,
    regras: args.regras?.trim() || null,
    capaUrl: args.capaUrl?.trim() || null,
  });
  revalidatePath('/partidas');
  return id;
}

export async function entrarPartidaAction(partidaId: number, personagemId: string | null) {
  const sessao = await exigirSessao();
  await repositorioPartidas.entrar(partidaId, sessao.user.discordId, personagemId);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

export async function sairPartidaAction(partidaId: number) {
  const sessao = await exigirSessao();
  await repositorioPartidas.sair(partidaId, sessao.user.discordId);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

async function exigirHost(partidaId: number) {
  const sessao = await exigirSessao();
  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new Error('Partida não existe mais.');
  if (partida.hostDiscordId !== sessao.user.discordId) {
    throw new Error('Só o host desta partida pode fazer isso.');
  }
  return partida;
}

export async function atualizarPartidaAction(
  partidaId: number,
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null },
) {
  await exigirHost(partidaId);
  if (!args.titulo.trim()) throw new Error('Dá um título pra partida.');
  const dataHora = new Date(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new Error('Data/hora inválida.');

  await repositorioPartidas.atualizar(partidaId, {
    titulo: args.titulo.trim(),
    dataHora,
    regras: args.regras?.trim() || null,
    capaUrl: args.capaUrl?.trim() || null,
  });
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

export async function mudarStatusPartidaAction(
  partidaId: number,
  status: 'agendada' | 'finalizada' | 'cancelada',
) {
  await exigirHost(partidaId);
  await repositorioPartidas.mudarStatus(partidaId, status);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

export async function salvarRelatorioAction(partidaId: number, dados: {
  capitulo: string | null;
  blackened: string | null;
  mvpDiscordId: string | null;
  resultado: 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia' | null;
}) {
  await exigirHost(partidaId);
  await repositorioPartidas.salvarRelatorio(partidaId, {
    capitulo: dados.capitulo?.trim() || null,
    blackened: dados.blackened?.trim() || null,
    mvpDiscordId: dados.mvpDiscordId || null,
    resultado: dados.resultado,
  });
  revalidatePath(`/partidas/${partidaId}`);
}

export async function avaliarParticipanteAction(
  partidaId: number, avaliadoDiscordId: string, tipo: 'like' | 'dislike', comentario: string | null,
) {
  const sessao = await exigirSessao();
  const avaliadorDiscordId = sessao.user.discordId;
  if (avaliadoDiscordId === avaliadorDiscordId) throw new Error('Não dá pra avaliar a si mesmo.');

  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new Error('Partida não existe mais.');
  if (partida.status !== 'finalizada') throw new Error('Só dá pra avaliar depois que a partida for finalizada.');

  const participantes = await repositorioPartidas.participantes(partidaId);
  const souParticipante = participantes.some((p) => p.discordId === avaliadorDiscordId);
  if (!souParticipante) throw new Error('Só quem participou da partida pode avaliar.');

  await repositorioPartidaAvaliacoes.avaliar({
    partidaId, avaliadorDiscordId, avaliadoDiscordId, tipo, comentario: comentario?.trim() || null,
  });
  revalidatePath(`/partidas/${partidaId}`);
}

export async function removerAvaliacaoAction(partidaId: number, avaliadoDiscordId: string) {
  const sessao = await exigirSessao();
  await repositorioPartidaAvaliacoes.remover(partidaId, sessao.user.discordId, avaliadoDiscordId);
  revalidatePath(`/partidas/${partidaId}`);
}
