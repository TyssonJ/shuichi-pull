'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCargos } from '@/db/repositorios/cargos';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { validarCargo } from '@/lib/cargos';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

async function registrar(autor: string, acao: string, alvo: string, antigo: string | null, novo: string | null) {
  await repositorioAuditoria.registrar({ autor, acao, alvo, valorAntigo: antigo, valorNovo: novo });
}

/** Dois cargos com o mesmo nome (sem contar maiúsculas) confundem quem lê o perfil. */
async function garantirNomeLivre(nome: string, ignorarId?: number) {
  const existentes = await repositorioCargos.listar();
  if (existentes.some((c) => c.id !== ignorarId && c.nome.toLowerCase() === nome.toLowerCase())) {
    throw new ErroDeNegocio(`Já existe um cargo chamado "${nome}".`);
  }
}

async function criarCargo_(dados: { nome: string; cor: string }): Promise<number> {
  const sessao = await exigirAdm();
  const r = validarCargo(dados);
  if (!r.ok) throw new ErroDeNegocio(r.erro);
  await garantirNomeLivre(r.valor.nome);

  const id = await repositorioCargos.criar(r.valor);
  await registrar(sessao.discordId, 'cargo.criar', `cargo/${id}`, null, JSON.stringify(r.valor));
  revalidatePath('/adm/cargos');
  return id;
}

async function atualizarCargo_(id: number, dados: { nome: string; cor: string }) {
  const sessao = await exigirAdm();
  const atual = await repositorioCargos.buscar(id);
  if (!atual) throw new ErroDeNegocio('Esse cargo não existe mais.');
  const r = validarCargo(dados);
  if (!r.ok) throw new ErroDeNegocio(r.erro);
  await garantirNomeLivre(r.valor.nome, id);

  await repositorioCargos.atualizar(id, r.valor);
  await registrar(sessao.discordId, 'cargo.editar', `cargo/${id}`, JSON.stringify({ nome: atual.nome, cor: atual.cor }), JSON.stringify(r.valor));
  revalidatePath('/adm/cargos');
}

async function excluirCargo_(id: number) {
  const sessao = await exigirAdm();
  const atual = await repositorioCargos.buscar(id);
  if (!atual) throw new ErroDeNegocio('Esse cargo não existe mais.');
  await repositorioCargos.excluir(id);
  await registrar(sessao.discordId, 'cargo.excluir', `cargo/${id}`, atual.nome, null);
  revalidatePath('/adm/cargos');
}

async function concederCargo_(discordId: string, cargoId: number) {
  const sessao = await exigirAdm();
  const cargo = await repositorioCargos.buscar(cargoId);
  if (!cargo) throw new ErroDeNegocio('Esse cargo não existe mais.');
  if (!(await repositorioUsuarios.buscar(discordId))) throw new ErroDeNegocio('Essa pessoa ainda não entrou no site.');

  await repositorioCargos.conceder(discordId, cargoId, sessao.discordId);
  await registrar(sessao.discordId, 'cargo.conceder', `cargo/${cargoId}`, null, discordId);
  revalidatePath('/adm/cargos');
  revalidatePath(`/u/${discordId}`);
  emitirEvento({ tipo: 'cargo.concedido', discordId, cargo: { id: cargo.id, nome: cargo.nome } });
}

async function retirarCargo_(discordId: string, cargoId: number) {
  const sessao = await exigirAdm();
  const cargo = await repositorioCargos.buscar(cargoId);
  if (!cargo) throw new ErroDeNegocio('Esse cargo não existe mais.');

  await repositorioCargos.retirar(discordId, cargoId);
  await registrar(sessao.discordId, 'cargo.retirar', `cargo/${cargoId}`, discordId, null);
  revalidatePath('/adm/cargos');
  revalidatePath(`/u/${discordId}`);
  emitirEvento({ tipo: 'cargo.retirado', discordId, cargo: { id: cargo.id, nome: cargo.nome } });
}

export async function criarCargoAction(...args: Parameters<typeof criarCargo_>) {
  return executar(() => criarCargo_(...args));
}
export async function atualizarCargoAction(...args: Parameters<typeof atualizarCargo_>) {
  return executar(() => atualizarCargo_(...args));
}
export async function excluirCargoAction(...args: Parameters<typeof excluirCargo_>) {
  return executar(() => excluirCargo_(...args));
}
export async function concederCargoAction(...args: Parameters<typeof concederCargo_>) {
  return executar(() => concederCargo_(...args));
}
export async function retirarCargoAction(...args: Parameters<typeof retirarCargo_>) {
  return executar(() => retirarCargo_(...args));
}
