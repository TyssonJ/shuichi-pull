'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { repositorioPartidaCapitulos } from '@/db/repositorios/partida-capitulos';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { dateDeBrasilia } from '@/lib/fuso';
import { validarVagas, VAGAS_PADRAO } from '@/lib/vagas';
import { validarAvaliacao } from '@/lib/estrelas';
import { transicaoValida, estaAberta, type StatusPartida } from '@/lib/status-partida';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { podeEntrarComoTitular } from '@/lib/vagas';
import { ROTULO_STATUS } from '@/lib/rotulos-partida';
import { inscreverNaPartida } from '@/lib/inscricao-partida';
import { emitirEvento } from '@/lib/junko/servico';
import { resumoDaPartida } from '@/lib/junko/eventos';
import { executar, ErroDeNegocio } from '@/lib/acao';

async function exigirSessao() {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');
  return sessao;
}

/** Devolve o id em vez de redirecionar direto — `redirect()` precisa correr
 * fora de try/catch, e o formulário (compartilhado com o de editar) sempre
 * chama `aoSalvar` dentro de um try/catch pra mostrar erro de validação.
 * Quem cria navega pro id depois, no cliente. */
async function criarPartidaAction_(
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number },
): Promise<number> {
  const sessao = await exigirSessao();
  const usuario = await repositorioUsuarios.buscar(sessao.user.discordId);
  if (usuario && !usuario.podeSerHost) throw new ErroDeNegocio('Sua permissão de host foi revogada por um ADM.');
  if (!args.titulo.trim()) throw new ErroDeNegocio('Dá um título pra partida.');
  const dataHora = dateDeBrasilia(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new ErroDeNegocio('Data/hora inválida.');
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
  emitirEvento({
    tipo: 'partida.criada',
    partida: resumoDaPartida({ id, titulo: args.titulo.trim(), hostDiscordId: sessao.user.discordId, dataHora, vagas }),
  });
  return id;
}

async function entrarPartidaAction_(
  partidaId: number, personagemId: string | null, tipo: 'participante' | 'reserva' = 'participante',
) {
  const sessao = await exigirSessao();
  const discordId = sessao.user.discordId;

  await inscreverNaPartida({ partidaId, discordId, personagemId, tipo });
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
  emitirEvento({ tipo: 'inscricao.entrou', partidaId, discordId, papel: tipo, personagemId });
}

export async function sairPartidaAction(partidaId: number) {
  const sessao = await exigirSessao();
  await repositorioPartidas.sair(partidaId, sessao.user.discordId);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
  emitirEvento({ tipo: 'inscricao.saiu', partidaId, discordId: sessao.user.discordId });
}

async function exigirHost(partidaId: number) {
  const sessao = await exigirSessao();
  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new ErroDeNegocio('Partida não existe mais.');
  if (partida.hostDiscordId !== sessao.user.discordId) {
    throw new ErroDeNegocio('Só o host desta partida pode fazer isso.');
  }
  return partida;
}

async function atualizarPartidaAction_(
  partidaId: number,
  args: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number },
) {
  await exigirHost(partidaId);
  if (!args.titulo.trim()) throw new ErroDeNegocio('Dá um título pra partida.');
  const dataHora = dateDeBrasilia(args.dataHora);
  if (Number.isNaN(dataHora.getTime())) throw new ErroDeNegocio('Data/hora inválida.');
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

/** Só o host mexe nos inscritos, e só enquanto a partida ainda está aberta. */
async function exigirHostDePartidaAberta(partidaId: number) {
  const partida = await exigirHost(partidaId);
  if (!estaAberta(partida.status)) throw new ErroDeNegocio('Essa partida já terminou.');
  return partida;
}

async function removerParticipante_(partidaId: number, discordId: string) {
  await exigirHostDePartidaAberta(partidaId);
  const inscritos = await repositorioPartidas.participantes(partidaId);
  if (!inscritos.some((p) => p.discordId === discordId)) throw new ErroDeNegocio('Essa pessoa não está na partida.');

  await repositorioPartidas.sair(partidaId, discordId);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
  emitirEvento({ tipo: 'inscricao.saiu', partidaId, discordId });
}

/** O host muda o personagem e/ou a vaga (titular ou reserva) de quem já entrou. */
async function trocarInscricao_(
  partidaId: number, discordId: string, personagemId: string | null, tipo: 'participante' | 'reserva',
) {
  const partida = await exigirHostDePartidaAberta(partidaId);
  const inscritos = await repositorioPartidas.participantes(partidaId);
  if (!inscritos.some((p) => p.discordId === discordId)) throw new ErroDeNegocio('Essa pessoa não está na partida.');

  if (personagemId === ID_MONOKUMA && discordId !== partida.hostDiscordId) {
    throw new ErroDeNegocio('Só o host da partida pode ser o Monokuma.');
  }
  if (tipo === 'participante' && !podeEntrarComoTitular(inscritos, partida.vagas, discordId)) {
    throw new ErroDeNegocio('As vagas de titular acabaram — passe alguém pra reserva primeiro.');
  }

  await repositorioPartidas.atualizarInscricao(partidaId, discordId, { personagemId, tipo });
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
  emitirEvento({ tipo: 'inscricao.entrou', partidaId, discordId, papel: tipo, personagemId });
}

async function marcarConvidado_(partidaId: number, discordId: string, convidado: boolean) {
  await exigirHostDePartidaAberta(partidaId);
  await repositorioPartidas.definirConvidado(partidaId, discordId, convidado);
  revalidatePath(`/partidas/${partidaId}`);
}

/** Começar, finalizar ou cancelar. Só anda pra frente (agendada → em andamento →
 * finalizada), e é aqui que os horários de início e fim são carimbados. */
async function mudarStatusPartida_(partidaId: number, status: StatusPartida) {
  const partida = await exigirHost(partidaId);
  if (!transicaoValida(partida.status, status)) {
    throw new ErroDeNegocio(`Essa partida está ${ROTULO_STATUS[partida.status].toLowerCase()} e não pode ir pra ${ROTULO_STATUS[status].toLowerCase()}.`);
  }

  const agora = new Date();
  await repositorioPartidas.mudarStatus(partidaId, status, agora);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');

  const atualizada = {
    ...partida, status,
    iniciadaEm: status === 'em_andamento' ? agora : partida.iniciadaEm,
    finalizadaEm: status === 'finalizada' ? agora : partida.finalizadaEm,
  };
  const tipo = status === 'em_andamento' ? 'partida.iniciada'
    : status === 'finalizada' ? 'partida.finalizada'
    : 'partida.cancelada';
  emitirEvento({ tipo, partida: resumoDaPartida(atualizada) });
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
  if (!Number.isInteger(dados.numero) || dados.numero < 1) throw new ErroDeNegocio('Número de capítulo inválido.');
  await repositorioPartidaCapitulos.salvar({ partidaId, ...dados });
  revalidatePath(`/partidas/${partidaId}`);
}

export async function removerCapituloAction(partidaId: number, numero: number) {
  await exigirHost(partidaId);
  await repositorioPartidaCapitulos.remover(partidaId, numero);
  revalidatePath(`/partidas/${partidaId}`);
}

/** Nota de 0 a 5 estrelas + texto obrigatório. Avaliar de novo o mesmo colega na
 * mesma partida substitui a avaliação anterior. */
async function avaliarParticipante_(
  partidaId: number, avaliadoDiscordId: string, estrelas: number, comentario: string | null,
) {
  const sessao = await exigirSessao();
  const avaliadorDiscordId = sessao.user.discordId;
  if (avaliadoDiscordId === avaliadorDiscordId) throw new ErroDeNegocio('Não dá pra avaliar a si mesmo.');

  const dados = validarAvaliacao(estrelas, comentario);
  if (!dados.ok) throw new ErroDeNegocio(dados.erro);

  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new ErroDeNegocio('Partida não existe mais.');
  if (partida.status !== 'finalizada') throw new ErroDeNegocio('Só dá pra avaliar depois que a partida for finalizada.');

  const participantes = await repositorioPartidas.participantes(partidaId);
  const souParticipante = participantes.some((p) => p.discordId === avaliadorDiscordId);
  if (!souParticipante) throw new ErroDeNegocio('Só quem participou da partida pode avaliar.');
  const alvoParticipou = participantes.some((p) => p.discordId === avaliadoDiscordId);
  if (!alvoParticipou) throw new ErroDeNegocio('Só dá pra avaliar quem participou da partida.');

  const avaliacaoId = await repositorioPartidaAvaliacoes.avaliar({
    partidaId, avaliadorDiscordId, avaliadoDiscordId, ...dados.valor,
  });
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath(`/u/${avaliadoDiscordId}`);
  emitirEvento({
    tipo: 'avaliacao.registrada', avaliacaoId, partidaId, avaliadoDiscordId,
    estrelas: dados.valor.estrelas, comentario: dados.valor.comentario,
  });
}

async function removerAvaliacao_(partidaId: number, avaliadoDiscordId: string) {
  const sessao = await exigirSessao();
  await repositorioPartidaAvaliacoes.remover(partidaId, sessao.user.discordId, avaliadoDiscordId);
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath(`/u/${avaliadoDiscordId}`);
  emitirEvento({ tipo: 'avaliacao.removida', partidaId, avaliadoDiscordId });
}

export async function criarPartidaAction(...args: Parameters<typeof criarPartidaAction_>) {
  return executar(() => criarPartidaAction_(...args));
}

export async function entrarPartidaAction(...args: Parameters<typeof entrarPartidaAction_>) {
  return executar(() => entrarPartidaAction_(...args));
}

export async function atualizarPartidaAction(...args: Parameters<typeof atualizarPartidaAction_>) {
  return executar(() => atualizarPartidaAction_(...args));
}

export async function avaliarParticipanteAction(...args: Parameters<typeof avaliarParticipante_>) {
  return executar(() => avaliarParticipante_(...args));
}

export async function removerAvaliacaoAction(...args: Parameters<typeof removerAvaliacao_>) {
  return executar(() => removerAvaliacao_(...args));
}

export async function mudarStatusPartidaAction(...args: Parameters<typeof mudarStatusPartida_>) {
  return executar(() => mudarStatusPartida_(...args));
}

export async function removerParticipanteAction(...args: Parameters<typeof removerParticipante_>) {
  return executar(() => removerParticipante_(...args));
}

export async function trocarInscricaoAction(...args: Parameters<typeof trocarInscricao_>) {
  return executar(() => trocarInscricao_(...args));
}

export async function marcarConvidadoAction(...args: Parameters<typeof marcarConvidado_>) {
  return executar(() => marcarConvidado_(...args));
}
