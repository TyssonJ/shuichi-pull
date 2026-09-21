import { MIDIA_HOST } from './midia-host';

/**
 * Upload de imagem e vídeo: o navegador envia direto pro Vercel Blob (o
 * arquivo não passa pela função do site, que só aceita corpo de poucos MB) e
 * o servidor decide, ANTES de dar o token, o que é permitido em cada uso.
 */
export type TipoUpload = 'icone' | 'imagem' | 'chat-video' | 'video-perfil';

const MB = 1024 * 1024;
const IMAGENS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export const LIMITES_UPLOAD: Record<TipoUpload, { tipos: string[]; maxBytes: number; rotulo: string }> = {
  icone: { tipos: IMAGENS, maxBytes: 1 * MB, rotulo: 'ícone' },
  imagem: { tipos: IMAGENS, maxBytes: 5 * MB, rotulo: 'imagem' },
  'chat-video': { tipos: ['video/mp4', 'video/webm'], maxBytes: 40 * MB, rotulo: 'vídeo do chat' },
  'video-perfil': { tipos: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 150 * MB, rotulo: 'vídeo' },
};

/** Vídeo do perfil: até 5 minutos. O servidor não abre o arquivo, então a
 * duração é conferida no navegador; o teto de tamanho é a trava de verdade. */
export const VIDEO_PERFIL_MAX_SEGUNDOS = 300;
export const CHAT_VIDEO_MAX_SEGUNDOS = 60;

/** Quantos arquivos uma pessoa pode enviar por dia — trava de abuso e de cota. */
export const UPLOADS_POR_DIA = 40;

export function ehTipoUpload(valor: unknown): valor is TipoUpload {
  return typeof valor === 'string' && valor in LIMITES_UPLOAD;
}

/** Link que aponta pro NOSSO Blob (https, sem credenciais). */
export function ehUrlDeMidia(entrada: string): boolean {
  try {
    const u = new URL(entrada);
    return u.protocol === 'https:' && u.hostname === MIDIA_HOST && !u.username && !u.password;
  } catch {
    return false;
  }
}

type Resultado = { ok: true } | { ok: false; erro: string };

export function formatarTamanho(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(bytes >= 10 * MB ? 0 : 1).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Confere tipo e tamanho de um arquivo pro uso escolhido. Roda no cliente
 * (pra avisar antes de enviar) e no servidor (que é quem decide). */
export function validarArquivoDeUpload(tipo: TipoUpload, arquivo: { tamanho: number; mime: string }): Resultado {
  const regra = LIMITES_UPLOAD[tipo];
  if (!regra.tipos.includes(arquivo.mime)) {
    const aceitos = regra.tipos.map((t) => t.split('/')[1].toUpperCase()).join(', ');
    return { ok: false, erro: `Formato não aceito para ${regra.rotulo}. Use: ${aceitos}.` };
  }
  if (arquivo.tamanho <= 0) return { ok: false, erro: 'O arquivo está vazio.' };
  if (arquivo.tamanho > regra.maxBytes) {
    return { ok: false, erro: `O ${regra.rotulo} tem ${formatarTamanho(arquivo.tamanho)}; o máximo é ${formatarTamanho(regra.maxBytes)}.` };
  }
  return { ok: true };
}

export function tipoDeMidia(mime: string): 'imagem' | 'video' {
  return mime.startsWith('video/') ? 'video' : 'imagem';
}

/** "5 min", "1 min 20 s", "45 s" — pra dizer o tamanho de um vídeo em voz humana. */
export function formatarSegundos(total: number): string {
  const s = Math.max(0, Math.round(total));
  const min = Math.floor(s / 60);
  const resto = s % 60;
  if (min === 0) return `${resto} s`;
  return resto === 0 ? `${min} min` : `${min} min ${resto} s`;
}
