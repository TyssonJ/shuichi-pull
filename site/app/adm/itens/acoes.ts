'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

const DIACRITICOS = new RegExp(String.fromCharCode(0x5b, 0x5c, 0x75, 0x30, 0x33, 0x30, 0x30, 0x2d, 0x5c, 0x75, 0x30, 0x33, 0x36, 0x66, 0x5d), 'g');

function gerarId(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function revalidarItens(id?: string) {
  revalidatePath('/itens');
  if (id) revalidatePath(`/itens/${id}`);
  revalidatePath('/adm/itens');
}

export async function criarItemAction(args: {
  nomePt: string; categoriaPt: string; raridadePt: string; nivelRaridade: number;
  peso: number | null; icone: string | null; descricaoPt: string | null;
}) {
  const sessao = await exigirAdm();
  const id = gerarId(args.nomePt);
  if (!id) throw new Error('Dá um nome pro item antes de salvar.');

  await repositorioItensAdm.criarExtra({
    id,
    nomePt: args.nomePt,
    nomeEn: args.nomePt,
    categoriaPt: args.categoriaPt,
    categoriaEn: args.categoriaPt,
    raridadePt: args.raridadePt,
    raridadeEn: args.raridadePt,
    nivelRaridade: args.nivelRaridade,
    peso: args.peso,
    icone: args.icone,
    descricaoPt: args.descricaoPt,
    autor: sessao.discordId,
  });
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.criar', alvo: id,
    valorAntigo: null, valorNovo: args.nomePt,
  });
  revalidarItens(id);
}

export async function excluirItemAction(id: string, nome: string) {
  const sessao = await exigirAdm();
  await repositorioItensAdm.excluir(id, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'item.excluir', alvo: id,
    valorAntigo: nome, valorNovo: null,
  });
  revalidarItens(id);
}

export async function restaurarItemAction(id: string) {
  await exigirAdm();
  await repositorioItensAdm.restaurar(id);
  revalidarItens(id);
}
