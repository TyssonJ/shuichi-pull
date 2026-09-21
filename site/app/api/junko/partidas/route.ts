import { exigirChaveJunko } from '@/lib/junko/autenticar';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { ocupamVaga } from '@/lib/vagas';
import { resumoDaPartida } from '@/lib/junko/eventos';

const LIMITE = 20;
/** Partida que começou há pouco ainda interessa (o lobby dá 15 min de folga). */
const TOLERANCIA_MS = 15 * 60_000;

/** Próximas partidas agendadas e as que estão em andamento, com vagas e quem já entrou. */
export async function GET(request: Request) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const [agendadas, rolando] = await Promise.all([
    repositorioPartidas.proximasAgendadas(new Date(Date.now() - TOLERANCIA_MS), LIMITE),
    repositorioPartidas.emAndamento(),
  ]);

  const detalhar = (partidas: typeof agendadas) => Promise.all(partidas.map(async (p) => {
    const inscritos = await repositorioPartidas.participantes(p.id);
    return {
      ...resumoDaPartida(p),
      ocupadas: ocupamVaga(inscritos).length,
      reservas: inscritos.filter((i) => i.tipo === 'reserva').length,
      inscritos: inscritos.map((i) => ({ discordId: i.discordId, papel: i.tipo, personagemId: i.personagemId })),
    };
  }));

  return Response.json({ partidas: await detalhar(agendadas), emAndamento: await detalhar(rolando) });
}
