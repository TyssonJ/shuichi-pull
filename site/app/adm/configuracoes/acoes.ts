'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

export async function definirConfiguracaoAction(chave: string, valor: boolean) {
  const sessao = await exigirAdm();
  await repositorioConfiguracoes.definir(chave, String(valor));
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'configuracao.definir', alvo: chave,
    valorAntigo: null, valorNovo: String(valor),
  });
  revalidatePath('/adm/configuracoes');
  // Cada toggle novo revalida a própria página afetada aqui — só existe um
  // hoje (o selo do elenco), então não vale abstrair isso ainda.
  revalidatePath('/elenco');
}
