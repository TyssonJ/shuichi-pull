import { ehUrlDeMidia, VIDEO_PERFIL_MAX_SEGUNDOS, formatarSegundos } from './midia';

/**
 * Blog do perfil: posts curtos com texto e, se quiser, imagens ou um vídeo
 * (até 5 min). Este arquivo só valida; quem confere o arquivo no Blob e grava
 * é a ação do servidor.
 */
export type AnexoPost = { tipo: 'imagem' | 'video'; url: string; duracaoSegundos: number | null };

export const POST_TEXTO_MAX = 2000;
export const POST_ANEXOS_MAX = 4;
export const POSTS_MAX_POR_PESSOA = 30;
export const VIDEOS_MAX_POR_PESSOA = 3;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

/** Caractere de controle que não é quebra de linha nem tab (faixa C0 e DEL). */
function ehControle(codigo: number): boolean {
  return (codigo < 32 && codigo !== 9 && codigo !== 10) || codigo === 127;
}

/** Texto do post: quebra de linha padronizada, sem controle e sem parede de linhas em branco. */
export function validarTextoPost(entrada: string): Resultado<string> {
  const texto = entrada.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
  for (const c of texto) {
    if (ehControle(c.codePointAt(0)!)) return { ok: false, erro: 'O texto tem caracteres de controle.' };
  }
  if ([...texto].length > POST_TEXTO_MAX) return { ok: false, erro: `O texto passa de ${POST_TEXTO_MAX} caracteres.` };
  return { ok: true, valor: texto };
}

export function validarAnexosPost(anexos: AnexoPost[]): Resultado<AnexoPost[]> {
  if (anexos.length > POST_ANEXOS_MAX) return { ok: false, erro: `No máximo ${POST_ANEXOS_MAX} arquivos por post.` };
  if (anexos.filter((a) => a.tipo === 'video').length > 1) return { ok: false, erro: 'Só um vídeo por post.' };

  const vistos = new Set<string>();
  for (const a of anexos) {
    if (!ehUrlDeMidia(a.url)) return { ok: false, erro: 'Só arquivos enviados por aqui podem ir no post.' };
    if (vistos.has(a.url)) return { ok: false, erro: 'O mesmo arquivo foi anexado duas vezes.' };
    vistos.add(a.url);
    if (a.tipo === 'video' && a.duracaoSegundos !== null) {
      if (!Number.isFinite(a.duracaoSegundos) || a.duracaoSegundos < 0) return { ok: false, erro: 'Duração de vídeo inválida.' };
      if (a.duracaoSegundos > VIDEO_PERFIL_MAX_SEGUNDOS) {
        return { ok: false, erro: `O vídeo tem ${formatarSegundos(a.duracaoSegundos)}; o máximo é ${formatarSegundos(VIDEO_PERFIL_MAX_SEGUNDOS)}.` };
      }
    }
  }
  return { ok: true, valor: anexos.map((a) => ({ ...a, duracaoSegundos: a.tipo === 'video' && a.duracaoSegundos !== null ? Math.round(a.duracaoSegundos) : null })) };
}

/** Um post precisa de alguma coisa: texto ou pelo menos um arquivo. */
export function postVazio(texto: string, anexos: AnexoPost[]): boolean {
  return texto.length === 0 && anexos.length === 0;
}

export function contarVideos(posts: { anexos: AnexoPost[] }[]): number {
  return posts.reduce((n, p) => n + p.anexos.filter((a) => a.tipo === 'video').length, 0);
}
