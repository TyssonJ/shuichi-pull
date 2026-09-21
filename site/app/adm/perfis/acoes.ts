'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

const MOTIVO_REJEICAO_MIN = 5;
const MOTIVO_REJEICAO_MAX = 200;

function revalidar(discordId: string) {
  revalidatePath('/adm/perfis');
  revalidatePath('/conta');
  revalidatePath(`/u/${discordId}`);
}

async function aprovarEstilo_(discordId: string) {
  const sessao = await exigirAdm();
  const linha = await repositorioPerfilEstilos.buscar(discordId);
  if (!linha || linha.status !== 'pendente' || !linha.pendente) {
    throw new ErroDeNegocio('Esse pedido não está mais pendente (talvez outro ADM já revisou).');
  }
  await repositorioPerfilEstilos.aprovar(discordId, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'perfil.aprovar', alvo: `perfil/${discordId}`, valorAntigo: null, valorNovo: 'aprovado',
  });
  revalidar(discordId);
  emitirEvento({ tipo: 'perfil.aprovado', discordId });
}

/** O motivo é obrigatório: a pessoa precisa saber o que mudar. */
async function rejeitarEstilo_(discordId: string, motivo: string) {
  const sessao = await exigirAdm();
  const texto = motivo.replace(/\s+/g, ' ').trim();
  if (texto.length < MOTIVO_REJEICAO_MIN) throw new ErroDeNegocio(`Explique o motivo da rejeição (mínimo ${MOTIVO_REJEICAO_MIN} caracteres).`);
  if (texto.length > MOTIVO_REJEICAO_MAX) throw new ErroDeNegocio(`O motivo passa de ${MOTIVO_REJEICAO_MAX} caracteres.`);

  const linha = await repositorioPerfilEstilos.buscar(discordId);
  if (!linha || linha.status !== 'pendente') throw new ErroDeNegocio('Esse pedido não está mais pendente (talvez outro ADM já revisou).');

  await repositorioPerfilEstilos.rejeitar(discordId, sessao.discordId, texto);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'perfil.rejeitar', alvo: `perfil/${discordId}`, valorAntigo: null, valorNovo: texto,
  });
  revalidar(discordId);
  emitirEvento({ tipo: 'perfil.rejeitado', discordId, motivo: texto });
}

/** Moderação de algo que JÁ está no ar. */
async function removerEstiloPublicado_(discordId: string) {
  const sessao = await exigirAdm();
  const linha = await repositorioPerfilEstilos.buscar(discordId);
  if (!linha?.publicado) throw new ErroDeNegocio('Esse perfil não tem estilo publicado.');
  await repositorioPerfilEstilos.removerPublicado(discordId, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'perfil.remover_estilo', alvo: `perfil/${discordId}`, valorAntigo: 'publicado', valorNovo: null,
  });
  revalidar(discordId);
}

export async function aprovarEstiloAction(...args: Parameters<typeof aprovarEstilo_>) {
  return executar(() => aprovarEstilo_(...args));
}
export async function rejeitarEstiloAction(...args: Parameters<typeof rejeitarEstilo_>) {
  return executar(() => rejeitarEstilo_(...args));
}
export async function removerEstiloPublicadoAction(...args: Parameters<typeof removerEstiloPublicado_>) {
  return executar(() => removerEstiloPublicado_(...args));
}
