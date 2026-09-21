'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioPerfilPosts } from '@/db/repositorios/perfil-posts';
import { repositorioMidias } from '@/db/repositorios/midias';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import {
  contarVideos, postVazio, validarAnexosPost, validarTextoPost, POSTS_MAX_POR_PESSOA, VIDEOS_MAX_POR_PESSOA,
  type AnexoPost,
} from '@/lib/perfil-posts';
import { tipoDeMidia } from '@/lib/midia';
import { apagarMidia, verificarMidia } from '@/lib/midia-servidor';
import { executar, ErroDeNegocio } from '@/lib/acao';

/** O que o navegador manda de cada arquivo: o link e se ele foi enviado como vídeo. */
export type AnexoEnviado = { url: string; video: boolean; duracaoSegundos: number | null };

async function exigirPessoa() {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');
  return { discordId, ehAdm: Boolean(sessao?.user?.papel) };
}

/**
 * Publica um post no blog do PRÓPRIO perfil. O tipo (imagem/vídeo) vem do
 * arquivo real no Blob, nunca do que o navegador diz, e o arquivo precisa ser
 * de quem está postando — senão dava pra anexar (e depois apagar) o arquivo de outra pessoa.
 */
async function publicarPost_(entrada: { texto: string; anexos: AnexoEnviado[] }): Promise<number> {
  const { discordId } = await exigirPessoa();

  const texto = validarTextoPost(entrada.texto);
  if (!texto.ok) throw new ErroDeNegocio(texto.erro);

  const anexos: AnexoPost[] = [];
  for (const a of entrada.anexos) {
    const dono = await repositorioMidias.buscarPorUrl(a.url);
    if (dono && dono.discordId !== discordId) throw new ErroDeNegocio('Esse arquivo é de outra pessoa.');
    const conferido = await verificarMidia(a.url, a.video ? 'video-perfil' : 'imagem');
    if (!conferido.ok) throw new ErroDeNegocio(conferido.erro);
    const tipo = tipoDeMidia(conferido.mime);
    anexos.push({ tipo, url: a.url, duracaoSegundos: tipo === 'video' ? a.duracaoSegundos : null });
  }
  const validos = validarAnexosPost(anexos);
  if (!validos.ok) throw new ErroDeNegocio(validos.erro);
  if (postVazio(texto.valor, validos.valor)) throw new ErroDeNegocio('Escreva algo ou anexe um arquivo.');

  const existentes = await repositorioPerfilPosts.listar(discordId);
  if (existentes.length >= POSTS_MAX_POR_PESSOA) {
    throw new ErroDeNegocio(`Você já tem ${POSTS_MAX_POR_PESSOA} posts. Apague algum pra publicar outro.`);
  }
  if (validos.valor.some((a) => a.tipo === 'video') && contarVideos(existentes) >= VIDEOS_MAX_POR_PESSOA) {
    throw new ErroDeNegocio(`Você já tem ${VIDEOS_MAX_POR_PESSOA} vídeos nos posts. Apague um pra publicar outro.`);
  }

  const id = await repositorioPerfilPosts.criar(discordId, texto.valor, validos.valor);
  revalidatePath(`/u/${discordId}`);
  return id;
}

/** O dono apaga o próprio post; ADM apaga o de qualquer um (moderação, fica na auditoria). */
async function apagarPost_(postId: number) {
  const { discordId, ehAdm } = await exigirPessoa();
  const post = await repositorioPerfilPosts.buscar(postId);
  if (!post) throw new ErroDeNegocio('Esse post não existe mais.');
  const dono = post.discordId === discordId;
  if (!dono && !ehAdm) throw new ErroDeNegocio('Você só pode apagar os seus posts.');

  await repositorioPerfilPosts.remover(postId);
  for (const a of post.anexos) await apagarMidia(a.url);
  if (!dono) {
    await repositorioAuditoria.registrar({
      autor: discordId, acao: 'perfil.apagar_post', alvo: `perfil/${post.discordId}/post/${postId}`,
      valorAntigo: post.texto.slice(0, 200), valorNovo: null,
    });
  }
  revalidatePath(`/u/${post.discordId}`);
}

export async function publicarPostAction(...args: Parameters<typeof publicarPost_>) {
  return executar(() => publicarPost_(...args));
}

export async function apagarPostAction(...args: Parameters<typeof apagarPost_>) {
  return executar(() => apagarPost_(...args));
}
