'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCodigos } from '@/db/repositorios/codigos';
import { CodigoSchema, type Codigo } from '@/lib/eventos';

export async function salvarCodigo(dados: Codigo) {
  await exigirAdm();
  const validado = CodigoSchema.parse(dados);

  const existente = await repositorioCodigos.buscar(validado.codigo);
  if (existente) await repositorioCodigos.atualizar(validado.codigo, validado);
  else await repositorioCodigos.criar(validado);

  revalidatePath('/codigos');
}

export async function excluirCodigo(codigo: string) {
  await exigirAdm();
  await repositorioCodigos.excluir(codigo);
  revalidatePath('/codigos');
}
