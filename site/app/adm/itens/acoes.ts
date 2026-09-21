'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { gerarId } from '@/lib/adm/gerar-id';
import { validarItemExtra, type DadosItemExtra } from '@/lib/adm/item-extra';
import { listarItens } from '@/lib/itens';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

/** O item mexe em quatro lugares: lista, ficha, painel e — se tiver ponto de
 * spawn — o mapa e a página de cada local onde ele sai. */
function revalidarItens(id: string, localIds: string[] = []) {
  revalidatePath('/itens');
  revalidatePath(`/itens/${id}`);
  revalidatePath('/adm/itens');
  if (localIds.length > 0) {
    revalidatePath('/mapa');
    for (const l of new Set(localIds)) revalidatePath(`/mapa/${l}`);
  }
}

export async function criarItemAction(dados: DadosItemExtra) {
  const sessao = await exigirAdm();
  const id = gerarId(dados.nomePt);
  if (!id) throw new Error('Dá um nome pro item antes de salvar.');

  const extras = await repositorioItensAdm.listarExtras();
  if (listarItens().some((i) => i.id === id) || extras.some((i) => i.id === id)) {
    throw new Error(`Já existe um item com o id "${id}". Use outro nome, ou edite/restaure o existente.`);
  }

  const item = validarItemExtra(id, dados);
  await repositorioItensAdm.criarExtra(item, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.criar', alvo: id,
    valorAntigo: null, valorNovo: item.nome.pt,
  });
  revalidarItens(id, item.spawns.map((s) => s.localId));
}

export async function atualizarItemAction(id: string, dados: DadosItemExtra) {
  const sessao = await exigirAdm();
  const extras = await repositorioItensAdm.listarExtras();
  const atual = extras.find((i) => i.id === id);
  if (!atual) {
    throw new Error('Só itens criados pelo painel podem ser editados aqui — os do guia usam "Corrigir campos".');
  }

  const item = validarItemExtra(id, dados);
  await repositorioItensAdm.atualizarExtra(item);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.editar', alvo: id,
    valorAntigo: atual.nome.pt, valorNovo: item.nome.pt,
  });
  // Os locais antigos também: o item pode ter deixado de sair neles.
  revalidarItens(id, [...atual.spawns, ...item.spawns].map((s) => s.localId));
}

export async function excluirItemAction(id: string, nome: string) {
  const sessao = await exigirAdm();
  const extras = await repositorioItensAdm.listarExtras();
  const locais = (extras.find((i) => i.id === id)?.spawns ?? []).map((s) => s.localId);

  await repositorioItensAdm.excluir(id, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.excluir', alvo: id,
    valorAntigo: nome, valorNovo: null,
  });
  revalidarItens(id, locais);
}

export async function restaurarItemAction(id: string) {
  const sessao = await exigirAdm();
  await repositorioItensAdm.restaurar(id);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.restaurar', alvo: id,
    valorAntigo: null, valorNovo: id,
  });
  revalidarItens(id);
}
