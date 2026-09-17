'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';

export async function definirConfiguracaoAction(chave: string, valor: boolean) {
  await exigirAdm();
  await repositorioConfiguracoes.definir(chave, String(valor));
  revalidatePath('/adm/configuracoes');
  // Cada toggle novo revalida a própria página afetada aqui — só existe um
  // hoje (o selo do elenco), então não vale abstrair isso ainda.
  revalidatePath('/elenco');
}
