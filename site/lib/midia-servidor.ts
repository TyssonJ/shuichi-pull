import { head, del } from '@vercel/blob';
import { repositorioMidias } from '@/db/repositorios/midias';
import { ehUrlDeMidia, validarArquivoDeUpload, type TipoUpload } from './midia';

type Verificada = { ok: true; tamanho: number; mime: string } | { ok: false; erro: string };

/**
 * Antes de guardar um link de mídia (conquista, post, mensagem), confere no
 * próprio Blob que o arquivo existe, é do NOSSO store e tem o tipo e o tamanho
 * do uso. O token de envio já limita isso, mas o link chega do navegador: sem
 * esta checagem alguém poderia usar um vídeo de 150 MB como "ícone".
 */
export async function verificarMidia(url: string, tipo: TipoUpload): Promise<Verificada> {
  if (!ehUrlDeMidia(url)) return { ok: false, erro: 'Esse arquivo não foi enviado por aqui.' };
  try {
    const info = await head(url);
    const r = validarArquivoDeUpload(tipo, { tamanho: info.size, mime: info.contentType });
    return r.ok ? { ok: true, tamanho: info.size, mime: info.contentType } : r;
  } catch {
    return { ok: false, erro: 'Não encontrei o arquivo enviado. Tenta enviar de novo?' };
  }
}

/** Apaga o arquivo do Blob e do registro. Nunca lança: arquivo já removido não é erro. */
export async function apagarMidia(url: string): Promise<void> {
  if (ehUrlDeMidia(url)) {
    try { await del(url); } catch { /* já não existia */ }
  }
  await repositorioMidias.remover(url);
}
