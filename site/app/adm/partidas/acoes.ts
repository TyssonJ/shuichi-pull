'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

export async function cancelarPartidaAdminAction(partidaId: number) {
  const sessao = await exigirAdm();
  await repositorioPartidas.mudarStatus(partidaId, 'cancelada');
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'partida.cancelar_adm', alvo: String(partidaId),
    valorAntigo: null, valorNovo: 'cancelada',
  });
  revalidatePath('/adm/partidas');
  revalidatePath(`/partidas/${partidaId}`);
  revalidatePath('/partidas');
}

export async function transferirHostAction(partidaId: number, novoHostDiscordId: string) {
  const sessao = await exigirAdm();
  const alvo = novoHostDiscordId.trim();
  if (!alvo) throw new Error('Informe o Discord ID do novo host.');

  await repositorioPartidas.atualizar(partidaId, { hostDiscordId: alvo });
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'partida.transferir_host', alvo: String(partidaId),
    valorAntigo: null, valorNovo: alvo,
  });
  revalidatePath('/adm/partidas');
  revalidatePath(`/partidas/${partidaId}`);
}
