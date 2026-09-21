'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioConquistas } from '@/db/repositorios/conquistas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { validarConquista, validarMotivo, type DadosConquista } from '@/lib/conquistas';
import { ehUrlDeMidia } from '@/lib/midia';
import { verificarMidia, apagarMidia } from '@/lib/midia-servidor';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

async function registrar(autor: string, acao: string, alvo: string, antigo: string | null, novo: string | null) {
  await repositorioAuditoria.registrar({ autor, acao, alvo, valorAntigo: antigo, valorNovo: novo });
}

/** Valida os textos e, se o ícone foi enviado por aqui, confere no Blob que é imagem pequena. */
async function validarDados(dados: DadosConquista): Promise<DadosConquista> {
  const r = validarConquista(dados);
  if (!r.ok) throw new ErroDeNegocio(r.erro);
  if (ehUrlDeMidia(r.valor.iconeUrl)) {
    const arquivo = await verificarMidia(r.valor.iconeUrl, 'icone');
    if (!arquivo.ok) throw new ErroDeNegocio(arquivo.erro);
  }
  return r.valor;
}

async function criarConquista_(dados: DadosConquista): Promise<number> {
  const sessao = await exigirAdm();
  const valido = await validarDados(dados);
  const id = await repositorioConquistas.criar(valido);
  await registrar(sessao.discordId, 'conquista.criar', `conquista/${id}`, null, valido.nome);
  revalidatePath('/adm/conquistas');
  return id;
}

async function atualizarConquista_(id: number, dados: DadosConquista) {
  const sessao = await exigirAdm();
  const atual = await repositorioConquistas.buscar(id);
  if (!atual) throw new ErroDeNegocio('Essa conquista não existe mais.');
  const valido = await validarDados(dados);

  await repositorioConquistas.atualizar(id, valido);
  // Trocou o ícone enviado por aqui: o arquivo antigo não serve mais.
  if (atual.iconeUrl !== valido.iconeUrl) await apagarMidia(atual.iconeUrl);
  await registrar(sessao.discordId, 'conquista.editar', `conquista/${id}`, atual.nome, valido.nome);
  revalidatePath('/adm/conquistas');
}

async function excluirConquista_(id: number) {
  const sessao = await exigirAdm();
  const atual = await repositorioConquistas.buscar(id);
  if (!atual) throw new ErroDeNegocio('Essa conquista não existe mais.');
  await repositorioConquistas.excluir(id);
  await apagarMidia(atual.iconeUrl);
  await registrar(sessao.discordId, 'conquista.excluir', `conquista/${id}`, atual.nome, null);
  revalidatePath('/adm/conquistas');
}

async function concederConquista_(discordId: string, conquistaId: number, motivo?: string) {
  const sessao = await exigirAdm();
  const conquista = await repositorioConquistas.buscar(conquistaId);
  if (!conquista) throw new ErroDeNegocio('Essa conquista não existe mais.');
  if (!(await repositorioUsuarios.buscar(discordId))) throw new ErroDeNegocio('Essa pessoa ainda não entrou no site.');
  const m = validarMotivo(motivo);
  if (!m.ok) throw new ErroDeNegocio(m.erro);

  await repositorioConquistas.conceder(discordId, conquistaId, sessao.discordId, m.valor);
  await registrar(sessao.discordId, 'conquista.conceder', `conquista/${conquistaId}`, null, discordId);
  revalidatePath('/adm/conquistas');
  revalidatePath(`/u/${discordId}`);
  emitirEvento({
    tipo: 'conquista.concedida', discordId, motivo: m.valor,
    conquista: { id: conquista.id, nome: conquista.nome, descricaoCurta: conquista.descricaoCurta },
  });
}

async function retirarConquista_(discordId: string, conquistaId: number) {
  const sessao = await exigirAdm();
  const conquista = await repositorioConquistas.buscar(conquistaId);
  if (!conquista) throw new ErroDeNegocio('Essa conquista não existe mais.');

  await repositorioConquistas.retirar(discordId, conquistaId);
  await registrar(sessao.discordId, 'conquista.retirar', `conquista/${conquistaId}`, discordId, null);
  revalidatePath('/adm/conquistas');
  revalidatePath(`/u/${discordId}`);
  emitirEvento({ tipo: 'conquista.retirada', discordId, conquista: { id: conquista.id, nome: conquista.nome } });
}

export async function criarConquistaAction(...args: Parameters<typeof criarConquista_>) {
  return executar(() => criarConquista_(...args));
}
export async function atualizarConquistaAction(...args: Parameters<typeof atualizarConquista_>) {
  return executar(() => atualizarConquista_(...args));
}
export async function excluirConquistaAction(...args: Parameters<typeof excluirConquista_>) {
  return executar(() => excluirConquista_(...args));
}
export async function concederConquistaAction(...args: Parameters<typeof concederConquista_>) {
  return executar(() => concederConquista_(...args));
}
export async function retirarConquistaAction(...args: Parameters<typeof retirarConquista_>) {
  return executar(() => retirarConquista_(...args));
}
