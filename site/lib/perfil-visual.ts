/**
 * Personalização visual do perfil público: descrição (bio) e banner.
 * Tudo aqui é lógica pura — a mesma validação roda no servidor (que é quem
 * decide) e na prévia do editor (que só antecipa o resultado).
 */

import { MIDIA_HOST } from './midia-host';

export const BIO_MAX = 280;

export type TipoBanner = 'preset' | 'personagem' | 'url';
export type Banner = { tipo: TipoBanner; valor: string };

export type PresetBanner = { id: string; rotulo: string; fundo: string };

/** Fundos prontos, na identidade do site (verde de sistema, rosa de execução,
 * ciano, âmbar). CSS puro: não dependem de arquivo nem de rede. */
export const PRESETS_BANNER: PresetBanner[] = [
  {
    id: 'terminal',
    rotulo: 'Terminal',
    fundo: 'radial-gradient(120% 140% at 15% 0%, rgba(0,255,102,.32), transparent 60%), linear-gradient(135deg, #04140A, #050805)',
  },
  {
    id: 'execucao',
    rotulo: 'Execução',
    fundo: 'radial-gradient(120% 140% at 85% 0%, rgba(255,0,127,.38), transparent 60%), linear-gradient(135deg, #1A0410, #08090D)',
  },
  {
    id: 'ciano',
    rotulo: 'Ciano',
    fundo: 'radial-gradient(120% 140% at 50% 0%, rgba(0,240,255,.30), transparent 62%), linear-gradient(135deg, #04121A, #08090D)',
  },
  {
    id: 'ambar',
    rotulo: 'Âmbar',
    fundo: 'radial-gradient(120% 140% at 20% 100%, rgba(245,158,11,.30), transparent 60%), linear-gradient(135deg, #1A1204, #08090D)',
  },
  {
    id: 'glitch',
    rotulo: 'Glitch',
    fundo: 'linear-gradient(115deg, rgba(0,255,102,.22) 0%, transparent 38%, rgba(255,0,127,.26) 62%, transparent 100%), linear-gradient(135deg, #08090D, #0E0E13)',
  },
  {
    id: 'noite',
    rotulo: 'Noite',
    fundo: 'linear-gradient(160deg, #0E0E13, #050508)',
  },
];

export const BANNER_PADRAO: Banner = { tipo: 'preset', valor: 'terminal' };

/** Só hospedagens de imagem estáveis. Link de anexo do Discord expira em
 * poucas horas e quebraria o banner em silêncio, então de propósito não
 * está aqui. Restringir também impede que um perfil aponte pra um servidor
 * qualquer só pra registrar o IP de quem visita. */
export const HOSTS_IMAGEM_PERMITIDOS = [
  'i.imgur.com',
  'i.ibb.co',
  'i.postimg.cc',
  'files.catbox.moe',
  'media.tenor.com',
  'media.giphy.com',
  'pbs.twimg.com',
  'upload.wikimedia.org',
  'i.pinimg.com',
  // Arquivos que a pessoa envia pelo próprio site (Vercel Blob).
  MIDIA_HOST,
] as const;

/** Hospedagens externas, pra mostrar na mensagem de erro (o Blob é o botão de upload). */
export const HOSTS_EXTERNOS_DE_IMAGEM = HOSTS_IMAGEM_PERMITIDOS.filter((h) => h !== MIDIA_HOST);

export const URL_BANNER_MAX = 300;

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export function validarBio(entrada: string): Resultado<string | null> {
  // Quebras de linha viram no máximo duas seguidas: bio não é lugar pra
  // empurrar o resto do perfil pra baixo.
  const limpa = entrada.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (limpa.length > BIO_MAX) return { ok: false, erro: `A descrição passa de ${BIO_MAX} caracteres.` };
  return { ok: true, valor: limpa || null };
}

export function validarUrlBanner(entrada: string): Resultado<string> {
  const texto = entrada.trim();
  if (texto.length > URL_BANNER_MAX) return { ok: false, erro: 'O link é longo demais.' };

  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return { ok: false, erro: 'Isso não parece um link válido.' };
  }

  if (url.protocol !== 'https:') return { ok: false, erro: 'O link precisa começar com https://.' };
  if (url.username || url.password) return { ok: false, erro: 'O link não pode ter usuário e senha.' };
  if (!(HOSTS_IMAGEM_PERMITIDOS as readonly string[]).includes(url.hostname)) {
    return {
      ok: false,
      erro: `Use uma imagem hospedada em: ${HOSTS_EXTERNOS_DE_IMAGEM.join(', ')} — ou envie o arquivo pelo botão de upload.`,
    };
  }
  return { ok: true, valor: url.toString() };
}

/** Confere o banner escolhido. `idsPersonagens` é o elenco atual (com extras
 * e sem removidos): um banner de personagem que saiu do site não vale mais. */
export function validarBanner(
  tipo: string,
  valor: string,
  idsPersonagens: ReadonlySet<string>,
): Resultado<Banner> {
  if (tipo === 'preset') {
    return PRESETS_BANNER.some((p) => p.id === valor)
      ? { ok: true, valor: { tipo, valor } }
      : { ok: false, erro: 'Esse fundo não existe.' };
  }
  if (tipo === 'personagem') {
    return idsPersonagens.has(valor)
      ? { ok: true, valor: { tipo, valor } }
      : { ok: false, erro: 'Esse personagem não está no elenco.' };
  }
  if (tipo === 'url') {
    const r = validarUrlBanner(valor);
    return r.ok ? { ok: true, valor: { tipo, valor: r.valor } } : r;
  }
  return { ok: false, erro: 'Tipo de banner inválido.' };
}

/** Lê o que está gravado no banco de volta pra um Banner utilizável.
 * Qualquer coisa fora do esperado (linha antiga, personagem removido) cai
 * no padrão em vez de quebrar a página. */
export function bannerDoRegistro(
  tipo: string | null,
  valor: string | null,
  idsPersonagens: ReadonlySet<string>,
): Banner {
  if (!tipo || !valor) return BANNER_PADRAO;
  const r = validarBanner(tipo, valor, idsPersonagens);
  return r.ok ? r.valor : BANNER_PADRAO;
}

export function fundoDoPreset(id: string): string {
  return (PRESETS_BANNER.find((p) => p.id === id) ?? PRESETS_BANNER[0]).fundo;
}
