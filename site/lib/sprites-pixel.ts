import { ID_MONOKUMA, SPRITE_MONOKUMA } from './monokuma';

/**
 * Sprites 8-bit (ícones pixel de rosto) baixados da wiki do Danganronpa pra
 * `public/sprites/pixel/<id>.png` — a maioria vem do minijogo Despair Dungeon
 * do V3, que tem um por personagem no mesmo estilo. Ficam numa lista
 * explícita (e não num existsSync) porque o Vercel não garante `public/` no
 * bundle das funções; o teste garante que a lista bate com a pasta.
 */
const COM_PIXEL = new Set([
  'akane-owari',
  'angie-yonaga',
  'aoi-asahina',
  'byakuya-togami-ultimate-affluent-progeny',
  'byakuya-togami-ultimate-imposter',
  'celestia-ludenberg',
  'chiaki-nanami',
  'chihiro-fujisaki',
  'fuyuhiko-kuzuryu',
  'gonta-gokuhara',
  'gundham-tanaka',
  'hajime-hinata',
  'hifumi-yamada',
  'himiko-yumeno',
  'hiyoko-saionji',
  'ibuki-mioda',
  'jataro-kemuri',
  'junko-enoshima-ultimate-analyst',
  'junko-enoshima-ultimate-fashionista',
  'k1-b0',
  'kaede-akamatsu',
  'kaito-momota',
  'kazuichi-soda',
  'kirumi-tojo',
  'kiyotaka-ishimaru',
  'kokichi-oma',
  'komaru-naegi',
  'korekiyo-shinguji',
  'kotoko-utsugi',
  'kyoko-kirigiri',
  'leon-kuwata',
  'mahiru-koizumi',
  'maki-harukawa',
  'makoto-naegi',
  'masaru-daimon',
  'mikan-tsumiki',
  'miu-iruma',
  'monaca-towa',
  'mondo-owada',
  'mukuro-ikusaba',
  'nagisa-shingetsu',
  'nagito-komaeda',
  'nekomaru-nidai',
  'peko-pekoyama',
  'rantaro-amami',
  'ryoma-hoshi',
  'sakura-ogami',
  'sayaka-maizono',
  'shuichi-saihara',
  'sonia-nevermind',
  'tenko-chabashira',
  'teruteru-hanamura',
  'toko-fukawa',
  'tsumugi-shirogane',
  'yasuhiro-hagakure',
]);

/** Sem sprite pixel na wiki (só a Ryoko Otonashi): a UI cai no retrato normal. */
export function spritePixelDe(personagemId: string): string | null {
  return COM_PIXEL.has(personagemId) ? `/sprites/pixel/${personagemId}.png` : null;
}

export const IDS_COM_PIXEL: readonly string[] = [...COM_PIXEL];

/**
 * Imagem de um inscrito numa partida: o sprite pixel, senão o retrato normal
 * (Ryoko Otonashi, personagens criados pelo ADM), e `null` na vaga genérica
 * (ainda sem personagem escolhido) — quem desenha decide o "?".
 */
export function iconeDoInscrito(
  personagemId: string | null, retratoPorId: ReadonlyMap<string, string>,
): string | null {
  if (!personagemId) return null;
  if (personagemId === ID_MONOKUMA) return SPRITE_MONOKUMA;
  return spritePixelDe(personagemId) ?? retratoPorId.get(personagemId) ?? null;
}
