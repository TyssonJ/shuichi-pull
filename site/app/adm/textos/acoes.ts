'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { PREFIXO_TEXTO, definicaoDoTexto, validarTexto } from '@/lib/textos-site';
import { executar, ErroDeNegocio } from '@/lib/acao';

/** Salva o texto de uma página. Vazio = volta ao padrão do site. */
async function salvarTextoAction_(chave: string, valor: string) {
  const sessao = await exigirAdm();

  const definicao = definicaoDoTexto(chave);
  const r = validarTexto(chave, valor);
  if (!definicao || !r.ok) throw new ErroDeNegocio(r.ok ? 'Esse texto não é editável.' : r.erro);

  const antigo = await repositorioConfiguracoes.obter(PREFIXO_TEXTO + chave);
  await repositorioConfiguracoes.definir(PREFIXO_TEXTO + chave, r.valor);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'texto.definir', alvo: `texto/${chave}`,
    valorAntigo: antigo, valorNovo: r.valor || null,
  });

  revalidatePath(definicao.pagina.length > 1 ? definicao.pagina.replace(/\/+$/, '') : definicao.pagina);
  revalidatePath('/adm/textos');
}

export async function salvarTextoAction(...args: Parameters<typeof salvarTextoAction_>) {
  return executar(() => salvarTextoAction_(...args));
}
