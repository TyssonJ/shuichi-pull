'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioPersonagensAdm } from '@/db/repositorios/personagens-adm';
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

function revalidarPersonagens(id?: string) {
  revalidatePath('/elenco');
  if (id) revalidatePath(`/elenco/${id}`);
  revalidatePath('/adm/personagens');
}

export async function criarPersonagemAction(args: {
  nome: string; jogo: string; talentoPt: string; descricaoPt: string;
  velocidade: number; mochila: number; percepcao: number; vida: number;
  sprite: string | null;
}) {
  const sessao = await exigirAdm();
  const id = gerarId(args.nome);
  if (!id) throw new Error('Dá um nome pro personagem antes de salvar.');

  await repositorioPersonagensAdm.criarExtra({
    id,
    nome: args.nome,
    talentoPt: args.talentoPt,
    talentoEn: args.talentoPt,
    descricaoPt: args.descricaoPt,
    descricaoEn: args.descricaoPt,
    jogo: args.jogo,
    velocidade: args.velocidade,
    mochila: args.mochila,
    percepcao: args.percepcao,
    vida: args.vida,
    sprite: args.sprite,
    autor: sessao.discordId,
  });
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'personagem.criar', alvo: id,
    valorAntigo: null, valorNovo: args.nome,
  });
  revalidarPersonagens(id);
}

export async function excluirPersonagemAction(id: string, nome: string) {
  const sessao = await exigirAdm();
  await repositorioPersonagensAdm.excluir(id, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'personagem.excluir', alvo: id,
    valorAntigo: nome, valorNovo: null,
  });
  revalidarPersonagens(id);
}

export async function restaurarPersonagemAction(id: string) {
  await exigirAdm();
  await repositorioPersonagensAdm.restaurar(id);
  revalidarPersonagens(id);
}
