import { repositorioPartidas } from '@/db/repositorios/partidas';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { podeEntrarComoTitular } from '@/lib/vagas';
import { ErroDeNegocio } from '@/lib/acao';

/** Erro esperado de regra de negócio, com o status HTTP que uma rota deve usar. */
export class ErroInscricao extends ErroDeNegocio {
  constructor(mensagem: string, readonly status: number) {
    super(mensagem);
    this.name = 'ErroInscricao';
  }
}

/**
 * Regras de entrada numa partida, num lugar só: o site (server action) e o
 * Junko Bot (rota da API) passam por aqui, então nenhum dos dois consegue o
 * que o outro não pode — vaga de titular esgotada, Monokuma só pro host,
 * partida que já não aceita inscrição.
 */
export async function inscreverNaPartida(args: {
  partidaId: number; discordId: string; personagemId: string | null; tipo: 'participante' | 'reserva';
}): Promise<void> {
  const { partidaId, discordId, personagemId, tipo } = args;

  const partida = await repositorioPartidas.buscar(partidaId);
  if (!partida) throw new ErroInscricao('Partida não existe mais.', 404);
  if (partida.status !== 'agendada') throw new ErroInscricao('Essa partida não está mais aceitando inscrição.', 409);
  if (personagemId === ID_MONOKUMA && partida.hostDiscordId !== discordId) {
    throw new ErroInscricao('Só o host da partida pode ser o Monokuma.', 403);
  }
  if (tipo === 'participante') {
    const inscritos = await repositorioPartidas.participantes(partidaId);
    if (!podeEntrarComoTitular(inscritos, partida.vagas, discordId, personagemId)) {
      throw new ErroInscricao('As vagas de titular acabaram — entre como reserva.', 409);
    }
  }

  await repositorioPartidas.entrar(partidaId, discordId, personagemId, tipo);
}
