'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { emitirEvento } from '@/lib/junko/servico';

export async function definirStatusUuidAction(discordId: string, status: 'pendente' | 'aprovado' | 'banido') {
  const sessao = await exigirAdm();
  await repositorioUsuarios.definirStatusUuid(discordId, status);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'usuario.status_uuid', alvo: discordId,
    valorAntigo: null, valorNovo: status,
  });
  revalidatePath('/adm/usuarios');
  emitirEvento({ tipo: 'uid.status', discordId, status });
}

export async function definirPodeSerHostAction(discordId: string, valor: boolean) {
  const sessao = await exigirAdm();
  await repositorioUsuarios.definirPodeSerHost(discordId, valor);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'usuario.pode_ser_host', alvo: discordId,
    valorAntigo: null, valorNovo: String(valor),
  });
  revalidatePath('/adm/usuarios');
  emitirEvento({ tipo: 'host.permissao', discordId, podeSerHost: valor });
}

/** Moderação: apelido ou ícone inadequado volta pro nome e ícone do Discord. */
export async function resetarIdentidadeAction(discordId: string) {
  const sessao = await exigirAdm();
  const antes = await repositorioUsuarios.buscar(discordId);
  await repositorioUsuarios.resetarIdentidade(discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'usuario.resetar_identidade', alvo: discordId,
    valorAntigo: antes?.apelido ?? null, valorNovo: null,
  });
  revalidatePath('/adm/usuarios');
  revalidatePath(`/u/${discordId}`);
}
