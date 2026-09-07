import falas from '@/content/falas.json';
import falasPagina from '@/content/falas-pagina.json';

export type EstadoEgo =
  | 'ocioso' | 'busca-com-resultado' | 'busca-sem-resultado'
  | 'item-raro' | 'primeira-visita' | 'carregando' | 'erro-404';

export type Face =
  | { tipo: 'sprite'; src: string }
  | { tipo: 'kaomoji'; texto: string };

// Só estes estados têm sprite oficial. O resto usa kaomoji — é o que dá
// estados ilimitados sem precisar de arte nova.
const SPRITES: Partial<Record<EstadoEgo, string>> = {
  'ocioso': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(1).webp',
  'busca-com-resultado': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(3).webp',
  'busca-sem-resultado': '/sprites/alterego/Alter_Ego_Sprite_Danganronpa_1_(6).webp',
};

const KAOMOJIS: Record<EstadoEgo, string> = {
  'ocioso': '(・‿・)',
  'busca-com-resultado': '(◕‿◕)',
  'busca-sem-resultado': '(´･_･`)',
  'item-raro': '(・o・)',
  'primeira-visita': '(๑•̀ㅂ•́)و',
  'carregando': '(－ω－) zZ',
  'erro-404': '(╥﹏╥)',
};

/**
 * O sprite do Chihiro perde a leitura abaixo de ~60px, entao quem desenha
 * pequeno (a bolinha flutuante) pede `forcarKaomoji` e recebe a carinha.
 */
export function faceDoEstado(estado: EstadoEgo, forcarKaomoji = false): Face {
  const sprite = SPRITES[estado];
  return sprite && !forcarKaomoji
    ? { tipo: 'sprite', src: sprite }
    : { tipo: 'kaomoji', texto: KAOMOJIS[estado] };
}

export const SECOES_EGO = [
  'home', 'comecar', 'elenco', 'itens', 'mapa',
  'mecanicas', 'eventos', 'codigos', 'faq',
] as const;
export type SecaoEgo = (typeof SECOES_EGO)[number];

/**
 * Fichas (`/elenco/shuichi-saihara/`) contam como a secao que as contem, para
 * o Alter Ego falar de elenco sem precisar de fala por personagem.
 */
export function secaoDoCaminho(caminho: string): SecaoEgo {
  const primeiro = caminho.split('/').filter(Boolean)[0];
  const achado = SECOES_EGO.find((s) => s === primeiro);
  return achado ?? 'home';
}

export function falaDoEstado(
  estado: EstadoEgo, variaveis: Record<string, string | number> = {}
): string {
  const modelo = (falas as Record<string, string>)[estado] ?? '';
  return modelo.replace(/\{(\w+)\}/g, (_, chave) => String(variaveis[chave] ?? `{${chave}}`));
}

type ConteudoSecao = { kaomoji: string; falas: string[] };
const POR_SECAO = falasPagina as Record<SecaoEgo, ConteudoSecao>;

export function falasDaSecao(secao: SecaoEgo): string[] {
  return POR_SECAO[secao].falas;
}

export function kaomojiDaSecao(secao: SecaoEgo): string {
  return POR_SECAO[secao].kaomoji;
}

/**
 * O sorteio entra por parametro para o teste poder fixar o resultado — e para
 * o componente nao sortear durante o render do servidor, o que daria
 * hidratacao divergente.
 */
export function falaDaSecao(secao: SecaoEgo, sorteio: () => number = Math.random): string {
  const pool = falasDaSecao(secao);
  return pool[Math.min(Math.floor(sorteio() * pool.length), pool.length - 1)];
}
