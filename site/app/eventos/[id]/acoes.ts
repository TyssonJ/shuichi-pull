'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioEventoComentarios } from '@/db/repositorios/eventos-comentarios';

async function exigirSessao() {
  const sessao = await auth();
  if (!sessao?.user?.discordId) throw new Error('Entra com o Discord primeiro.');
  return sessao;
}

export async function comentarAction(eventoId: string, texto: string) {
  const sessao = await exigirSessao();
  const limpo = texto.trim();
  if (!limpo) throw new Error('Escreve alguma coisa antes de enviar.');
  if (limpo.length > 1000) throw new Error('Comentário muito longo (máximo 1000 caracteres).');

  await repositorioEventoComentarios.criar(eventoId, sessao.user.discordId, limpo);
  revalidatePath(`/eventos/${eventoId}`);
}

export async function removerComentarioAction(eventoId: string, comentarioId: number) {
  const sessao = await exigirSessao();
  const comentario = await repositorioEventoComentarios.buscar(comentarioId);
  if (!comentario) return;

  const souAutor = comentario.discordId === sessao.user.discordId;
  const souAdm = sessao.user.papel === 'adm' || sessao.user.papel === 'chefe';
  if (!souAutor && !souAdm) throw new Error('Só o autor ou um ADM pode apagar este comentário.');

  await repositorioEventoComentarios.remover(comentarioId);
  revalidatePath(`/eventos/${eventoId}`);
}
