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
