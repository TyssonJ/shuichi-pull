import { repositorioPartidas } from '@/db/repositorios/partidas';
import type { Sala } from './chat';

export type PessoaDoChat = { discordId: string; ehAdm: boolean };

/**
 * Quem entra em qual sala: a geral é de todo mundo que está logado; a de uma
 * partida é só de quem está nela (titular ou reserva), do host e dos ADMs.
 */
export async function podeAcessarSala(sala: Sala, pessoa: PessoaDoChat): Promise<boolean> {
  if (sala.tipo === 'geral') return true;
  if (pessoa.ehAdm) return Boolean(await repositorioPartidas.buscar(sala.partidaId));
  const partida = await repositorioPartidas.buscar(sala.partidaId);
  if (!partida) return false;
  if (partida.hostDiscordId === pessoa.discordId) return true;
  const inscritos = await repositorioPartidas.participantes(sala.partidaId);
  return inscritos.some((p) => p.discordId === pessoa.discordId);
}
