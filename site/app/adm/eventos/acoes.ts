'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { EventoSchema, type Evento } from '@/lib/eventos';

export async function salvarEvento(dados: Evento) {
  await exigirAdm();
  const validado = EventoSchema.parse(dados);

  const existente = await repositorioEventos.buscar(validado.id);
  if (existente) await repositorioEventos.atualizar(validado.id, validado);
  else await repositorioEventos.criar(validado);

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${validado.id}`);
}

export async function excluirEvento(id: string) {
  await exigirAdm();
  await repositorioEventos.excluir(id);
  revalidatePath('/eventos');
}
