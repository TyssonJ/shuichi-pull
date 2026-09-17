'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';

export async function atualizarPerfilAction(dados: { uuidGmod: string | null; mains: string[] }) {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new Error('Entra com o Discord primeiro.');

  await repositorioUsuarios.atualizarPerfil(sessao.user.discordId, dados);
  revalidatePath('/conta');
}
