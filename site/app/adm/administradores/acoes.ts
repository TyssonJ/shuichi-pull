'use server';

import { revalidatePath } from 'next/cache';
import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';

export async function promoverAdmAction(args: { discordId: string; nome: string; papel: 'adm' | 'chefe' }) {
  const sessao = await exigirChefe();
  await repositorioAdms.promoverAdm({ ...args, promovidoPor: sessao.discordId });
  revalidatePath('/adm/administradores');
}

export async function rebaixarAdmAction(discordId: string) {
  await exigirChefe();
  await repositorioAdms.rebaixarAdm(discordId);
  revalidatePath('/adm/administradores');
}
