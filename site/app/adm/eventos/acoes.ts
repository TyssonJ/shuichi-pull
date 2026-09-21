'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { EventoSchema, type Evento } from '@/lib/eventos';

export async function salvarEvento(dados: Evento) {
  const sessao = await exigirAdm();
  const validado = EventoSchema.parse(dados);

  const existente = await repositorioEventos.buscar(validado.id);
  if (existente) await repositorioEventos.atualizar(validado.id, validado);
  else await repositorioEventos.criar(validado);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: existente ? 'evento.editar' : 'evento.criar', alvo: validado.id,
    valorAntigo: existente?.titulo ?? null, valorNovo: validado.titulo,
  });

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${validado.id}`);
}

export async function excluirEvento(id: string) {
  const sessao = await exigirAdm();
  await repositorioEventos.excluir(id);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'evento.excluir', alvo: id, valorAntigo: null, valorNovo: null,
  });
  revalidatePath('/eventos');
}
