'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { gerarId } from '@/lib/adm/gerar-id';
import { validarPersonagemExtra, type DadosPersonagemExtra } from '@/lib/adm/personagem-extra';
import { listarPersonagens } from '@/lib/dados';
import { repositorioPersonagensAdm } from '@/db/repositorios/personagens-adm';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';

/** Só o que é estático precisa revalidar: partidas, conta e perfil já
 * renderizam a cada acesso e leem o elenco atual sozinhos. */
function revalidarPersonagens(id: string) {
  revalidatePath('/elenco');
  revalidatePath(`/elenco/${id}`);
  revalidatePath('/adm/personagens');
}

export async function criarPersonagemAction(dados: DadosPersonagemExtra) {
  const sessao = await exigirAdm();
  const id = gerarId(dados.nome);
  if (!id) throw new Error('Dá um nome pro personagem antes de salvar.');

  const extras = await repositorioPersonagensAdm.listarExtras();
  if (listarPersonagens().some((p) => p.id === id) || extras.some((p) => p.id === id)) {
    throw new Error(`Já existe um personagem com o id "${id}". Use outro nome, ou edite/restaure o existente.`);
  }

  const personagem = validarPersonagemExtra(id, dados);
  await repositorioPersonagensAdm.criarExtra(personagem, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'personagem.criar', alvo: id,
    valorAntigo: null, valorNovo: personagem.nome,
  });
  revalidarPersonagens(id);
}

export async function atualizarPersonagemAction(id: string, dados: DadosPersonagemExtra) {
  const sessao = await exigirAdm();
  const extras = await repositorioPersonagensAdm.listarExtras();
  const atual = extras.find((p) => p.id === id);
  if (!atual) {
    throw new Error('Só personagens criados pelo painel podem ser editados aqui — os do guia usam "Corrigir campos".');
  }

  const personagem = validarPersonagemExtra(id, dados);
  await repositorioPersonagensAdm.atualizarExtra(personagem);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'personagem.editar', alvo: id,
    valorAntigo: atual.nome, valorNovo: personagem.nome,
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
  const sessao = await exigirAdm();
  await repositorioPersonagensAdm.restaurar(id);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'personagem.restaurar', alvo: id,
    valorAntigo: null, valorNovo: id,
  });
  revalidarPersonagens(id);
}
