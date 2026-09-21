'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { TOGGLES } from '@/lib/configuracoes';

export async function definirConfiguracaoAction(chave: string, valor: boolean) {
  const sessao = await exigirAdm();
  // A tabela também guarda textos e dados internos: esta ação só mexe nos toggles.
  if (!TOGGLES.some((t) => t.chave === chave)) throw new Error('Configuração desconhecida.');
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
