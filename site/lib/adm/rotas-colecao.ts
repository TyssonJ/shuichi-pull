import type { Colecao } from '@/lib/correcoes-merge';

/** Página pública de listagem de cada coleção. */
export const ROTA_LISTAGEM: Record<Colecao, string> = {
  personagens: '/elenco',
  itens: '/itens',
  locais: '/mapa',
  faq: '/faq',
  controles: '/mecanicas',
};

/** Rota do próprio painel adm para cada coleção — os nomes não batem 1:1
 * com os da coleção (locais é /adm/mapa, controles é /adm/mecanicas). */
export const ROTA_ADMIN: Record<Colecao, string> = {
  personagens: '/adm/personagens',
  itens: '/adm/itens',
  locais: '/adm/mapa',
  faq: '/adm/faq',
  controles: '/adm/mecanicas',
};

/** Só personagens/itens/locais têm página de detalhe própria por registro. */
const TEM_PAGINA_DE_DETALHE: Record<Colecao, boolean> = {
  personagens: true, itens: true, locais: true, faq: false, controles: false,
};

/** Tudo que precisa ser revalidado depois de mexer num registro. Sem a rota
 * do próprio painel o indicador "●" de editado não atualiza sozinho. */
export function caminhosParaRevalidar(colecao: Colecao, registroId: string): string[] {
  const base = ROTA_LISTAGEM[colecao];
  return [
    base,
    ...(TEM_PAGINA_DE_DETALHE[colecao] ? [`${base}/${registroId}`] : []),
    ROTA_ADMIN[colecao],
  ];
}

/** Onde o registro aparece de fato no site, pro botão "ver na página". */
export function urlPublicaDoRegistro(colecao: Colecao, registroId: string): string {
  const base = ROTA_LISTAGEM[colecao];
  return TEM_PAGINA_DE_DETALHE[colecao] ? `${base}/${registroId}/` : `${base}/#${registroId}`;
}
