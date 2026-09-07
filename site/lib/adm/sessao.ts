import { auth } from '@/auth';

export type SessaoAdm = { discordId: string; papel: 'adm' | 'chefe' };

export async function sessaoAdm(): Promise<SessaoAdm | null> {
  const sessao = await auth();
  if (!sessao?.user?.papel) return null;
  return { discordId: sessao.user.discordId, papel: sessao.user.papel };
}

export async function exigirAdm(): Promise<SessaoAdm> {
  const sessao = await sessaoAdm();
  if (!sessao) throw new Error('Acesso negado: faça login como administrador.');
  return sessao;
}

export async function exigirChefe(): Promise<SessaoAdm & { papel: 'chefe' }> {
  const sessao = await exigirAdm();
  if (sessao.papel !== 'chefe') throw new Error('Acesso negado: ação restrita a chefes.');
  return sessao as SessaoAdm & { papel: 'chefe' };
}
