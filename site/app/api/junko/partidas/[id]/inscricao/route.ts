import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { exigirChaveJunko, AUTOR_JUNKO } from '@/lib/junko/autenticar';
import { lerCorpo, naoEncontrado, schemaDiscordId } from '@/lib/junko/http';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { inscreverNaPartida, ErroInscricao } from '@/lib/inscricao-partida';
import { ID_MONOKUMA } from '@/lib/monokuma';

const schemaEntrar = z.object({
  discordId: schemaDiscordId,
  tipo: z.enum(['participante', 'reserva']).default('participante'),
  personagemId: z.string().min(1).max(100).nullable().default(null),
});
const schemaSair = z.object({ discordId: schemaDiscordId });

function idDaPartida(bruto: string): number | null {
  const id = Number(bruto);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function revalidar(partidaId: number) {
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

/** Inscreve alguém numa partida, com as mesmas regras do site (vagas, Monokuma só do host…). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const partidaId = idDaPartida((await params).id);
  if (partidaId === null) return Response.json({ erro: 'id de partida inválido.' }, { status: 400 });

  const corpo = await lerCorpo(request, schemaEntrar);
  if (!corpo.ok) return corpo.resposta;
  const { discordId, tipo, personagemId } = corpo.dados;

  if (!(await repositorioUsuarios.buscar(discordId))) {
    return naoEncontrado('Essa pessoa ainda não entrou no site — ela precisa conectar com o Discord uma vez.');
  }
  if (personagemId !== null && personagemId !== ID_MONOKUMA) {
    const elenco = await listarPersonagensComCorrecoes();
    if (!elenco.some((p) => p.id === personagemId)) {
      return Response.json({ erro: 'personagemId não existe no elenco.' }, { status: 400 });
    }
  }

  try {
    await inscreverNaPartida({ partidaId, discordId, personagemId, tipo });
  } catch (e) {
    if (e instanceof ErroInscricao) return Response.json({ erro: e.message }, { status: e.status });
    throw e;
  }

  await repositorioAuditoria.registrar({
    autor: AUTOR_JUNKO, acao: 'partida.inscricao', alvo: String(partidaId), valorAntigo: null, valorNovo: `${discordId} (${tipo})`,
  });
  revalidar(partidaId);
  return Response.json({ ok: true, partidaId, discordId, papel: tipo, personagemId });
}

/** Tira alguém da partida. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const partidaId = idDaPartida((await params).id);
  if (partidaId === null) return Response.json({ erro: 'id de partida inválido.' }, { status: 400 });

  const corpo = await lerCorpo(request, schemaSair);
  if (!corpo.ok) return corpo.resposta;

  if (!(await repositorioPartidas.buscar(partidaId))) return naoEncontrado('Partida não existe.');

  await repositorioPartidas.sair(partidaId, corpo.dados.discordId);
  await repositorioAuditoria.registrar({
    autor: AUTOR_JUNKO, acao: 'partida.saida', alvo: String(partidaId), valorAntigo: corpo.dados.discordId, valorNovo: null,
  });
  revalidar(partidaId);
  return Response.json({ ok: true, partidaId, discordId: corpo.dados.discordId });
}
