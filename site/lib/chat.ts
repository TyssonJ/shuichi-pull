import { razaoDeContraste } from './estilo-perfil';

/**
 * Chat do Alter Ego: uma sala geral (todo mundo logado) e uma sala por partida
 * (só quem está nela, o host e os ADMs). Vercel não tem websocket, então o
 * navegador consulta de poucos em poucos segundos; este arquivo só tem as regras.
 */
export const SALA_GERAL = 'geral';
/** Evento do navegador que abre o painel do chat numa sala: `detail: { sala }`. */
export const EVENTO_ABRIR_CHAT = 'chat:abrir';
export type Sala = { tipo: 'geral' } | { tipo: 'partida'; partidaId: number };

export function salaDaPartida(partidaId: number): string {
  return `partida:${partidaId}`;
}

/** Texto -> sala válida; qualquer outra coisa (inclusive "partida:0") é recusada. */
export function lerSala(texto: string): Sala | null {
  if (texto === SALA_GERAL) return { tipo: 'geral' };
  const m = /^partida:([1-9]\d{0,8})$/.exec(texto);
  return m ? { tipo: 'partida', partidaId: Number(m[1]) } : null;
}

const HORA = 60 * 60 * 1000;
/** Jogador só vê as últimas 4 h; ADM, as últimas 24 h. Depois disso, o que sobrou é apagado. */
export const JANELA_JOGADOR_MS = 4 * HORA;
export const JANELA_ADM_MS = 24 * HORA;
export const RETENCAO_MS = 24 * HORA;

export function janelaVisivelMs(ehAdm: boolean): number {
  return ehAdm ? JANELA_ADM_MS : JANELA_JOGADOR_MS;
}

/** Um arquivo numa mensagem (mesmo formato dos posts do perfil). */
export type AnexoChat = { tipo: 'imagem' | 'video'; url: string; duracaoSegundos: number | null };

export const CHAT_TEXTO_MAX = 500;
export const CHAT_MENSAGENS_POR_CONSULTA = 100;
/** Quem não deu sinal de vida há mais que isso deixa de contar como "online". */
export const PRESENCA_TTL_MS = 30_000;
export const INTERVALO_CONSULTA_MS = 3_000;

export const ENVIO_INTERVALO_MIN_MS = 1_000;
export const ENVIOS_POR_MINUTO = 15;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export function validarTextoChat(entrada: string): Resultado<string> {
  const texto = entrada.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  for (const c of texto) {
    const codigo = c.codePointAt(0)!;
    if ((codigo < 32 && codigo !== 10) || codigo === 127) return { ok: false, erro: 'A mensagem tem caracteres de controle.' };
  }
  if ([...texto].length > CHAT_TEXTO_MAX) return { ok: false, erro: `A mensagem passa de ${CHAT_TEXTO_MAX} caracteres.` };
  return { ok: true, valor: texto };
}

/** Anti-flood: um intervalo mínimo entre mensagens e um teto por minuto. */
export function checarLimiteDeEnvio(dados: { ultimoEnvioMs: number | null; enviosNoUltimoMinuto: number; agoraMs: number }): Resultado<null> {
  if (dados.ultimoEnvioMs !== null && dados.agoraMs - dados.ultimoEnvioMs < ENVIO_INTERVALO_MIN_MS) {
    return { ok: false, erro: 'Calma, você está mandando mensagem rápido demais.' };
  }
  if (dados.enviosNoUltimoMinuto >= ENVIOS_POR_MINUTO) {
    return { ok: false, erro: `Limite de ${ENVIOS_POR_MINUTO} mensagens por minuto. Espera um pouco.` };
  }
  return { ok: true, valor: null };
}

// ---- Menções de personagem (@makoto-naegi) -------------------------------

export type PersonagemChat = { id: string; nome: string; cor: string };

export type SegmentoChat =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'mencao'; id: string; nome: string; cor: string };

/** "@id" vira menção só se o id existir no elenco e começar uma palavra
 * (e-mail e "a@b" ficam como texto). O resto do texto passa intacto. */
export function segmentarMencoes(texto: string, personagens: Map<string, PersonagemChat>): SegmentoChat[] {
  const segmentos: SegmentoChat[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(/(^|\s)@([a-z0-9-]{2,60})(?![a-z0-9-])/g)) {
    const personagem = personagens.get(m[2]);
    if (!personagem) continue;
    const inicio = m.index + m[1].length;
    if (inicio > ultimo) segmentos.push({ tipo: 'texto', texto: texto.slice(ultimo, inicio) });
    segmentos.push({ tipo: 'mencao', id: personagem.id, nome: personagem.nome, cor: personagem.cor });
    ultimo = inicio + m[2].length + 1;
  }
  if (ultimo < texto.length) segmentos.push({ tipo: 'texto', texto: texto.slice(ultimo) });
  return segmentos;
}

function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Enquanto a pessoa digita "@ma…", quais personagens oferecer. Devolve onde
 * a menção começa (pra substituir) ou null quando o cursor não está numa. */
export function sugerirMencoes(
  texto: string, cursor: number, personagens: PersonagemChat[], limite = 6,
): { inicio: number; opcoes: PersonagemChat[] } | null {
  const antes = texto.slice(0, cursor);
  const m = /(^|\s)@([a-z0-9-]{0,40})$/i.exec(antes);
  if (!m) return null;
  const termo = semAcento(m[2]);
  const opcoes = personagens
    .filter((p) => !termo || p.id.includes(termo) || semAcento(p.nome).includes(termo))
    .sort((a, b) => Number(!a.id.startsWith(termo)) - Number(!b.id.startsWith(termo)) || a.nome.localeCompare(b.nome))
    .slice(0, limite);
  return { inicio: antes.length - m[2].length - 1, opcoes };
}

// ---- Cores ---------------------------------------------------------------

const FUNDO_DO_CHAT = '#0e0e13';

function hexParaRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function rgbParaHex([r, g, b]: number[]): string {
  return '#' + [r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('');
}

/** Clareia a cor do personagem, só o necessário, até dar leitura no fundo do chat. */
export function corLegivel(hex: string, fundo: string = FUNDO_DO_CHAT, minimo = 4.5): string {
  let cor = hex.toLowerCase();
  for (let passo = 0; passo < 20 && razaoDeContraste(cor, fundo) < minimo; passo += 1) {
    cor = rgbParaHex(hexParaRgb(cor).map((c) => c + (255 - c) * 0.12));
  }
  return cor;
}

/** Cor estável por id, pra quem não tem sprite (personagem criado pelo ADM). */
export function corPorId(id: string): string {
  let h = 0;
  for (const c of id) h = (h * 31 + c.codePointAt(0)!) % 360;
  const s = 0.7;
  const l = 0.62;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbParaHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

/** Cor da menção: a do sprite, se houver; senão a derivada do id. Sempre legível. */
export function corDoPersonagem(id: string, corDoSprite: string | undefined): string {
  return corLegivel(corDoSprite ?? corPorId(id));
}

/** Quantas mensagens o painel guarda na tela (o resto sai do topo). */
export const CHAT_MENSAGENS_NA_TELA = 200;

/**
 * Junta o que já está na tela com o que o servidor mandou: sem repetir, em
 * ordem, e tirando (1) o que sumiu do servidor (apagado por um ADM) e (2) o que
 * passou da janela de tempo de quem está vendo. Só some por (1) o que está
 * dentro do intervalo que o servidor listou — o que é mais antigo que
 * `idsVisiveis` (limitado a 100) não dá pra afirmar que sumiu. Servidor sem
 * nenhuma mensagem na janela = tela vazia.
 */
export function juntarMensagens<T extends { id: number; criadoEm?: string }>(
  atuais: T[], novas: T[], idsVisiveis: number[], opcoes: { desdeMs?: number } = {},
): T[] {
  if (idsVisiveis.length === 0) return [];
  const porId = new Map<number, T>();
  for (const m of atuais) porId.set(m.id, m);
  for (const m of novas) porId.set(m.id, m);

  const vivas = new Set(idsVisiveis);
  const menorVisivel = Math.min(...idsVisiveis);
  const { desdeMs } = opcoes;
  return [...porId.values()]
    .filter((m) => m.id < menorVisivel || vivas.has(m.id))
    .filter((m) => desdeMs === undefined || !m.criadoEm || Date.parse(m.criadoEm) >= desdeMs)
    .sort((a, b) => a.id - b.id)
    .slice(-CHAT_MENSAGENS_NA_TELA);
}
