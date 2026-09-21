'use server';

import { revalidatePath } from 'next/cache';
import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

export async function promoverAdmAction(args: { discordId: string; nome: string; papel: 'adm' | 'chefe' }) {
  const sessao = await exigirChefe();
  await repositorioAdms.promoverAdm({ ...args, promovidoPor: sessao.discordId });
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'adm.promover', alvo: args.discordId,
    valorAntigo: null, valorNovo: args.papel,
  });
  revalidatePath('/adm/administradores');
}

export async function rebaixarAdmAction(discordId: string) {
  const sessao = await exigirChefe();
  await repositorioAdms.rebaixarAdm(discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'adm.rebaixar', alvo: discordId,
    valorAntigo: null, valorNovo: null,
  });
  revalidatePath('/adm/administradores');
}
