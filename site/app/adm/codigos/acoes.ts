'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCodigos } from '@/db/repositorios/codigos';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { CodigoSchema, type Codigo } from '@/lib/eventos';

export async function salvarCodigo(dados: Codigo) {
  const sessao = await exigirAdm();
  const validado = CodigoSchema.parse(dados);

  const existente = await repositorioCodigos.buscar(validado.codigo);
  if (existente) await repositorioCodigos.atualizar(validado.codigo, validado);
  else await repositorioCodigos.criar(validado);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: existente ? 'codigo.editar' : 'codigo.criar', alvo: validado.codigo,
    valorAntigo: existente?.recompensa ?? null, valorNovo: validado.recompensa,
  });

  revalidatePath('/codigos');
}

export async function excluirCodigo(codigo: string) {
  const sessao = await exigirAdm();
  await repositorioCodigos.excluir(codigo);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'codigo.excluir', alvo: codigo, valorAntigo: null, valorNovo: null,
  });
  revalidatePath('/codigos');
}
