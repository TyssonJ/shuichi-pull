import { validarUrlBanner } from './perfil-visual';
import { luminancia } from './cargos';

/**
 * Estilo do perfil público: cor de tema, fundo só nas laterais (o miolo
 * continua igual, com fade, como no perfil da Steam) e emojis que só existem
 * dentro do próprio perfil. Tudo aqui passa por aprovação de ADM antes de
 * aparecer pra qualquer pessoa — este arquivo só valida e transforma.
 */
export type EmojiPerfil = { codigo: string; url: string };

export type EstiloPerfil = {
  /** #rrggbb — substitui o verde de destaque só dentro do perfil. */
  corTema: string | null;
  fundoEsquerdo: string | null;
  /** Nulo = espelha o esquerdo. */
  fundoDireito: string | null;
  emojis: EmojiPerfil[];
};

export const ESTILO_VAZIO: EstiloPerfil = { corTema: null, fundoEsquerdo: null, fundoDireito: null, emojis: [] };

export const EMOJIS_MAX = 12;
export const CODIGO_EMOJI = /^[a-z0-9_]{2,20}$/;
/** Cor do fundo do site, contra a qual a cor de tema precisa ser legível. */
const FUNDO_DO_SITE = '#08090d';
export const CONTRASTE_MINIMO = 3;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

/** Razão de contraste WCAG entre duas cores #rrggbb (1 a 21). */
export function razaoDeContraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

function opcional(url: string | null | undefined, rotulo: string): Resultado<string | null> {
  const texto = (url ?? '').trim();
  if (!texto) return { ok: true, valor: null };
  const r = validarUrlBanner(texto);
  return r.ok ? { ok: true, valor: r.valor } : { ok: false, erro: `${rotulo}: ${r.erro}` };
}

export function validarEstilo(entrada: {
  corTema?: string | null; fundoEsquerdo?: string | null; fundoDireito?: string | null; emojis?: { codigo: string; url: string }[];
}): Resultado<EstiloPerfil> {
  let corTema: string | null = null;
  const corBruta = (entrada.corTema ?? '').trim().toLowerCase();
  if (corBruta) {
    if (!/^#[0-9a-f]{6}$/.test(corBruta)) return { ok: false, erro: 'A cor precisa estar no formato #RRGGBB.' };
    if (razaoDeContraste(corBruta, FUNDO_DO_SITE) < CONTRASTE_MINIMO) {
      return { ok: false, erro: 'Essa cor é escura demais e sumiria no fundo do site. Escolha uma mais clara.' };
    }
    corTema = corBruta;
  }

  const esquerdo = opcional(entrada.fundoEsquerdo, 'Fundo da esquerda');
  if (!esquerdo.ok) return esquerdo;
  const direito = opcional(entrada.fundoDireito, 'Fundo da direita');
  if (!direito.ok) return direito;
  if (direito.valor && !esquerdo.valor) return { ok: false, erro: 'Defina o fundo da esquerda antes do da direita.' };

  const lista = entrada.emojis ?? [];
  if (lista.length > EMOJIS_MAX) return { ok: false, erro: `No máximo ${EMOJIS_MAX} emojis.` };
  const emojis: EmojiPerfil[] = [];
  const usados = new Set<string>();
  for (const e of lista) {
    const codigo = e.codigo.trim().toLowerCase().replace(/^:|:$/g, '');
    if (!CODIGO_EMOJI.test(codigo)) {
      return { ok: false, erro: `O código ":${codigo}:" precisa ter de 2 a 20 letras minúsculas, números ou _.` };
    }
    if (usados.has(codigo)) return { ok: false, erro: `O código ":${codigo}:" está repetido.` };
    usados.add(codigo);
    const imagem = validarUrlBanner(e.url);
    if (!imagem.ok) return { ok: false, erro: `Emoji :${codigo}: — ${imagem.erro}` };
    emojis.push({ codigo, url: imagem.valor });
  }

  return { ok: true, valor: { corTema, fundoEsquerdo: esquerdo.valor, fundoDireito: direito.valor, emojis } };
}

/** O estilo não muda nada? (Não faz sentido mandar pra aprovação.) */
export function estiloVazio(e: EstiloPerfil): boolean {
  return !e.corTema && !e.fundoEsquerdo && !e.fundoDireito && e.emojis.length === 0;
}

export function estilosIguais(a: EstiloPerfil | null | undefined, b: EstiloPerfil | null | undefined): boolean {
  return JSON.stringify(a ?? ESTILO_VAZIO) === JSON.stringify(b ?? ESTILO_VAZIO);
}

export type Segmento =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'emoji'; codigo: string; url: string };

/** Quebra o texto em pedaços de texto e emojis (":kappa:"). Código que a pessoa
 * não tem fica como texto: os emojis só valem no perfil de quem os criou. */
export function segmentarComEmojis(texto: string, emojis: EmojiPerfil[]): Segmento[] {
  const mapa = new Map(emojis.map((e) => [e.codigo, e.url]));
  const segmentos: Segmento[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(/:([a-z0-9_]{2,20}):/g)) {
    const url = mapa.get(m[1]);
    if (!url) continue;
    if (m.index > ultimo) segmentos.push({ tipo: 'texto', texto: texto.slice(ultimo, m.index) });
    segmentos.push({ tipo: 'emoji', codigo: m[1], url });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) segmentos.push({ tipo: 'texto', texto: texto.slice(ultimo) });
  return segmentos;
}
