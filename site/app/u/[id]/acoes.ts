'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

/** Moderação: um ADM apaga uma avaliação abusiva do perfil. A avaliação é
 * anônima também pra quem modera — some pelo id, sem revelar o autor. */
export async function removerAvaliacaoAdmAction(perfilDiscordId: string, avaliacaoId: number) {
  const sessao = await exigirAdm();
  await repositorioPartidaAvaliacoes.removerPorId(avaliacaoId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'avaliacao.remover', alvo: `perfil/${perfilDiscordId}`,
    valorAntigo: `avaliacao ${avaliacaoId}`, valorNovo: null,
  });
  revalidatePath(`/u/${perfilDiscordId}`);
}
