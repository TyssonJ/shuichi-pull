const PASTA_ORIGINAL = '/sprites/elenco/';
const PASTA_MINI = '/sprites/elenco-mini/';

/**
 * Onde o sprite aparece pequeno (cartões, ícones, listas), usa a miniatura de
 * 256 px de altura em vez do original de até ~680 px — a página do elenco
 * baixava 2,2 MB pra desenhar imagens de 128 px. Só troca os sprites do nosso
 * elenco; a silhueta, links de ADM e qualquer outro endereço passam intactos.
 * As miniaturas são geradas por `node scripts/gerar-miniaturas.mjs` (um teste
 * garante que nenhum sprite fica sem a dele).
 */
export function miniaturaDoSprite(src: string): string {
  return src.startsWith(PASTA_ORIGINAL) ? PASTA_MINI + src.slice(PASTA_ORIGINAL.length) : src;
}
