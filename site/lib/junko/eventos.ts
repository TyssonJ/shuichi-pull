import { URL_SITE } from './config';
import { duracaoMs, type StatusPartida } from '../status-partida';

/**
 * Eventos que o site avisa ao Junko Bot. O formato é o contrato de
 * docs/junko-bot-api.md: mexer aqui é mexer no que o bot recebe.
 */
export type ResumoPartida = {
  id: number;
  titulo: string;
  hostDiscordId: string;
  /** ISO 8601 (UTC). */
  dataHora: string;
  vagas: number;
  url: string;
  status: StatusPartida;
  /** ISO; só depois que o host apertou "Começar". */
  iniciadaEm: string | null;
  /** Só em partida iniciada e finalizada. */
  duracaoSegundos: number | null;
};

export type StatusUid = 'pendente' | 'aprovado' | 'banido';

export type EventoJunko =
  | { tipo: 'teste' }
  | { tipo: 'partida.criada'; partida: ResumoPartida }
  | { tipo: 'partida.iniciada'; partida: ResumoPartida }
  | { tipo: 'partida.cancelada'; partida: ResumoPartida }
  | { tipo: 'partida.finalizada'; partida: ResumoPartida }
  | { tipo: 'inscricao.entrou'; partidaId: number; discordId: string; papel: 'participante' | 'reserva'; personagemId: string | null }
  | { tipo: 'inscricao.saiu'; partidaId: number; discordId: string }
  | { tipo: 'uid.enviado'; discordId: string; uid: string | null }
  | { tipo: 'uid.status'; discordId: string; status: StatusUid }
  | { tipo: 'host.permissao'; discordId: string; podeSerHost: boolean }
  /** Anônimo de propósito: quem avaliou nunca vai no evento. */
  | { tipo: 'avaliacao.registrada'; avaliacaoId: number; partidaId: number; avaliadoDiscordId: string; estrelas: number; comentario: string }
  | { tipo: 'avaliacao.removida'; partidaId: number; avaliadoDiscordId: string };

export type TipoEventoJunko = EventoJunko['tipo'];

export function resumoDaPartida(
  p: {
    id: number; titulo: string; hostDiscordId: string; dataHora: Date; vagas: number;
    status?: StatusPartida; iniciadaEm?: Date | null; finalizadaEm?: Date | null;
  },
): ResumoPartida {
  const duracao = duracaoMs(p.iniciadaEm ?? null, p.finalizadaEm ?? null);
  return {
    id: p.id,
    titulo: p.titulo,
    hostDiscordId: p.hostDiscordId,
    dataHora: p.dataHora.toISOString(),
    vagas: p.vagas,
    url: `${URL_SITE}/partidas/${p.id}/`,
    status: p.status ?? 'agendada',
    iniciadaEm: p.iniciadaEm ? p.iniciadaEm.toISOString() : null,
    duracaoSegundos: duracao === null ? null : Math.round(duracao / 1000),
  };
}

export type PayloadJunko = {
  origem: 'shuichipull';
  evento: TipoEventoJunko;
  enviadoEm: string;
  dados: Record<string, unknown>;
};

/** Corpo JSON enviado ao bot: o tipo fica em `evento`, o resto em `dados`. */
export function montarPayload(evento: EventoJunko, agora: Date): PayloadJunko {
  const { tipo, ...dados } = evento;
  return { origem: 'shuichipull', evento: tipo, enviadoEm: agora.toISOString(), dados };
}
