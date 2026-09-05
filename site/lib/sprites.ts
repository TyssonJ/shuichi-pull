/**
 * Só três personagens têm sprite extraído hoje. O resto usa a silhueta, para
 * que nenhuma ficha mostre imagem quebrada. Quando entrar arte nova, basta
 * acrescentar a pasta e o arquivo aqui.
 */
export const SILHUETA = '/sprites/silhueta.svg';

const ARTE: Record<string, string> = {
  'chihiro-fujisaki': '/sprites/chihiro/Chihiro_Fujisaki_Halfbody_Sprite_(1).webp',
  'shuichi-saihara': '/sprites/shuichi/DRS_-_Shuichi_Saihara_Sprite_(Uniform)_(01).webp',
  // A Junko de verdade é a Analista Suprema; a "Junko" Fashionista é a Mukuro
  // disfarçada e não pode herdar a arte dela.
  'junko-enoshima-ultimate-analyst':
    '/sprites/junko/Danganronpa_1_Junko_Enoshima_Halfbody_Sprite_(Mobile)_(1).webp',
};

export function spriteDoPersonagem(id: string): string {
  return ARTE[id] ?? SILHUETA;
}
