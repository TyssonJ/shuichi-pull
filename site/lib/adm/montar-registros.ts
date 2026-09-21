import { obterCaminho, type MapaCorrecoes } from '@/lib/correcoes-merge';
import type { CampoCorrigivel } from './colecoes-corrigiveis';
import { CAMPOS_CONTEUDO, type ColecaoConteudo } from './conteudo';

/** O que o editor visual recebe de cada registro — só dados simples, porque
 * atravessa a fronteira servidor → cliente. */
export type RegistroEditor = {
  id: string;
  titulo: string;
  /** Seção/grupo, quando faz sentido agrupar a lista. */
  grupo: string | null;
  origem: 'guia' | 'novo';
  /** Registro do guia que o ADM já corrigiu em algum campo. */
  alterado: boolean;
  /** Valor atual de cada campo, já com as correções. */
  valores: Record<string, string>;
  /** Valor original do guia por campo; null nos registros criados no painel. */
  originais: Record<string, string> | null;
};

/** Registros vindos do guidebook, com as correções do ADM por cima. */
export function montarRegistrosDoGuia(
  base: { id: string }[],
  campos: CampoCorrigivel[],
  correcoes: MapaCorrecoes,
  caminhoTitulo: string,
  caminhoGrupo: string | null = null,
): RegistroEditor[] {
  return base.map((registro) => {
    const doRegistro = correcoes.get(registro.id);
    const valores: Record<string, string> = {};
    const originais: Record<string, string> = {};

    for (const campo of campos) {
      const original = obterCaminho(registro, campo.caminho) ?? '';
      originais[campo.caminho] = original;
      valores[campo.caminho] = doRegistro?.get(campo.caminho)?.valor ?? original;
    }

    return {
      id: registro.id,
      titulo: valores[caminhoTitulo] || registro.id,
      grupo: caminhoGrupo ? obterCaminho(registro, caminhoGrupo) : null,
      origem: 'guia',
      alterado: (doRegistro?.size ?? 0) > 0,
      valores,
      originais,
    };
  });
}

/** Registros criados pelo ADM (FAQ e mecânicas). */
export function montarRegistrosNovos(
  colecao: ColecaoConteudo,
  extras: { id: string; dados: Record<string, string> }[],
  caminhoTitulo: string,
  caminhoGrupo: string,
): RegistroEditor[] {
  return extras.map((e) => {
    const valores: Record<string, string> = {};
    for (const campo of CAMPOS_CONTEUDO[colecao]) valores[campo.chave] = e.dados[campo.chave] ?? '';
    return {
      id: e.id,
      titulo: valores[caminhoTitulo] || e.id,
      grupo: valores[caminhoGrupo] || null,
      origem: 'novo',
      alterado: false,
      valores,
      originais: null,
    };
  });
}
