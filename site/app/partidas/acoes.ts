'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { repositorioPartidaCapitulos } from '@/db/repositorios/partida-capitulos';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { dateDeBrasilia } from '@/lib/fuso';
import { podeEntrarComoTitular, validarVagas, VAGAS_PADRAO } from '@/lib/vagas';

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
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number },
): Promise<number> {
  const sessao = await exigirSessao();
  const usuario = await repositorioUsuarios.buscar(sessao.user.discordId);
  if (usuario && !usuario.podeSerHost) throw new Error('Sua permissão de host foi revogada por um ADM.');
  if (!args.titulo.trim()) throw new Error('Dá um título pra partida.');
  const dataHora = dateDeBrasilia(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new Error('Data/hora inválida.');
  const vagas = args.vagas ?? VAGAS_PADRAO;
  validarVagas(vagas);

  const id = await repositorioPartidas.criar({
    titulo: args.titulo.trim(),
    hostDiscordId: sessao.user.discordId,
    dataHora,
    regras: args.regras?.trim() || null,
    capaUrl: args.capaUrl?.trim() || null,
    vagas,
  });
  revalidatePath('/partidas');
  return id;
}

export async function entrarPartidaAction(
  partidaId: number, personagemId: string | null, tipo: 'participante' | 'reserva' = 'participante',
) {
  const sessao = await exigirSessao();
  const discordId = sessao.user.discordId;

  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new Error('Partida não existe mais.');
  if (partida.status !== 'agendada') throw new Error('Essa partida não está mais aceitando inscrição.');
  // A trava do Monokuma estava só na interface: quem chamasse a action direto escolhia.
  if (personagemId === ID_MONOKUMA && partida.hostDiscordId !== discordId) {
    throw new Error('Só o host da partida pode ser o Monokuma.');
  }
  if (tipo === 'participante') {
    const inscritos = await repositorioPartidas.participantes(partidaId);
    if (!podeEntrarComoTitular(inscritos, partida.vagas, discordId, personagemId)) {
      throw new Error('As vagas de titular acabaram — entre como reserva.');
    }
  }

  await repositorioPartidas.entrar(partidaId, discordId, personagemId, tipo);
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
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number },
) {
  await exigirHost(partidaId);
  if (!args.titulo.trim()) throw new Error('Dá um título pra partida.');
  const dataHora = dateDeBrasilia(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new Error('Data/hora inválida.');
  validarVagas(args.vagas);

  await repositorioPartidas.atualizar(partidaId, {
    titulo: args.titulo.trim(),
    dataHora,
    regras: args.regras?.trim() || null,
    capaUrl: args.capaUrl?.trim() || null,
    vagas: args.vagas,
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
  mvpDiscordIds: string[];
  resultado: 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia' | null;
}) {
  await exigirHost(partidaId);
  await repositorioPartidas.salvarRelatorio(partidaId, {
    capitulo: dados.capitulo?.trim() || null,
    blackened: dados.blackened?.trim() || null,
    mvpDiscordIds: dados.mvpDiscordIds,
    resultado: dados.resultado,
  });
  revalidatePath(`/partidas/${partidaId}`);
}

export async function salvarCapituloAction(partidaId: number, dados: {
  numero: number;
  assassinoDiscordId: string | null;
  vitimaDiscordId: string | null;
  afk: string[];
}) {
  await exigirHost(partidaId);
  if (!Number.isInteger(dados.numero) || dados.numero < 1) throw new Error('Número de capítulo inválido.');
  await repositorioPartidaCapitulos.salvar({ partidaId, ...dados });
  revalidatePath(`/partidas/${partidaId}`);
}

export async function removerCapituloAction(partidaId: number, numero: number) {
  await exigirHost(partidaId);
  await repositorioPartidaCapitulos.remover(partidaId, numero);
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
  const alvoParticipou = participantes.some((p) => p.discordId === avaliadoDiscordId);
  if (!alvoParticipou) throw new Error('Só dá pra avaliar quem participou da partida.');

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
