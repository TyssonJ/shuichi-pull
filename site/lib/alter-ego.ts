import falas from '@/content/falas.json';

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

export function faceDoEstado(estado: EstadoEgo): Face {
  const sprite = SPRITES[estado];
  return sprite
    ? { tipo: 'sprite', src: sprite }
    : { tipo: 'kaomoji', texto: KAOMOJIS[estado] };
}

export function falaDoEstado(
  estado: EstadoEgo, variaveis: Record<string, string | number> = {}
): string {
  const modelo = (falas as Record<string, string>)[estado] ?? '';
  return modelo.replace(/\{(\w+)\}/g, (_, chave) => String(variaveis[chave] ?? `{${chave}}`));
}
