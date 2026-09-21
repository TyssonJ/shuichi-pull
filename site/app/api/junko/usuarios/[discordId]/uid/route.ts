import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { exigirChaveJunko, AUTOR_JUNKO } from '@/lib/junko/autenticar';
import { discordIdValido, lerCorpo, naoEncontrado } from '@/lib/junko/http';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

const schema = z.object({ status: z.enum(['pendente', 'aprovado', 'banido']) });

/** Aprovar, banir ou devolver pra pendente o UID de alguém — direto do Discord. */
export async function POST(request: Request, { params }: { params: Promise<{ discordId: string }> }) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const { discordId } = await params;
  if (!discordIdValido(discordId)) return Response.json({ erro: 'discordId inválido.' }, { status: 400 });

  const corpo = await lerCorpo(request, schema);
  if (!corpo.ok) return corpo.resposta;

  const usuario = await repositorioUsuarios.buscar(discordId);
  if (!usuario) return naoEncontrado('Essa pessoa ainda não entrou no site.');

  await repositorioUsuarios.definirStatusUuid(discordId, corpo.dados.status);
  await repositorioAuditoria.registrar({
    autor: AUTOR_JUNKO, acao: 'usuario.status_uuid', alvo: discordId,
    valorAntigo: usuario.uuidStatus, valorNovo: corpo.dados.status,
  });
  // De propósito NÃO avisa o bot de volta: foi ele quem pediu (evita eco).
  revalidatePath('/adm/usuarios');
  return Response.json({ ok: true, discordId, uidStatus: corpo.dados.status });
}
