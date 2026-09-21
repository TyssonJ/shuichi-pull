import type { Colecao } from '@/lib/correcoes-merge';
import { CAMPOS_POR_COLECAO, type CampoCorrigivel } from './colecoes-corrigiveis';
import { CAMPOS_CONTEUDO, ehColecaoConteudo } from './conteudo';

export type CampoEditor = {
  /** Caminho do campo no registro (ex.: "resposta", "talento.pt"). */
  chave: string;
  rotulo: string;
  longo?: boolean;
  /** Fixo nos registros do guia; só dá pra escolher ao criar um novo. */
  soNovo?: boolean;
};

/** Campos do formulário do editor visual, na ordem em que aparecem. */
export function camposDoEditor(colecao: Colecao): CampoEditor[] {
  if (ehColecaoConteudo(colecao)) {
    return CAMPOS_CONTEUDO[colecao].map((c) => ({
      chave: c.chave, rotulo: c.rotulo, longo: c.longo, soNovo: c.soExtra,
    }));
  }
  return CAMPOS_POR_COLECAO[colecao].map((c) => ({ chave: c.caminho, rotulo: c.rotulo, longo: c.longo }));
}

/** Campos lidos de cada registro do guia. Em FAQ/mecânicas inclui também a
 * seção/grupo, que aparece no formulário (travado) mas não é corrigível. */
export function camposParaMontar(colecao: Colecao): CampoCorrigivel[] {
  if (colecao === 'faq') return [{ rotulo: 'Seção', caminho: 'secao' }, ...CAMPOS_POR_COLECAO.faq];
  if (colecao === 'controles') return [{ rotulo: 'Grupo', caminho: 'grupo' }, ...CAMPOS_POR_COLECAO.controles];
  return CAMPOS_POR_COLECAO[colecao];
}
