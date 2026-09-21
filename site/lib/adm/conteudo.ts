import { gerarId } from './gerar-id';

/**
 * Coleções de texto que o ADM pode ampliar de verdade (criar e esconder),
 * não só corrigir: perguntas do FAQ e cards de mecânica. Itens e personagens
 * têm o próprio CRUD, com muito mais campos.
 */
export type ColecaoConteudo = 'faq' | 'controles';

export type CampoConteudo = {
  chave: string;
  rotulo: string;
  max: number;
  longo?: boolean;
  /** Só pode ser escolhido ao criar; nos registros do guia é fixo. */
  soExtra?: boolean;
};

export const CAMPOS_CONTEUDO: Record<ColecaoConteudo, CampoConteudo[]> = {
  faq: [
    { chave: 'secao', rotulo: 'Seção', max: 60, soExtra: true },
    { chave: 'pergunta', rotulo: 'Pergunta', max: 200 },
    { chave: 'resposta', rotulo: 'Resposta', max: 6000, longo: true },
  ],
  controles: [
    { chave: 'grupo', rotulo: 'Grupo', max: 60, soExtra: true },
    { chave: 'titulo', rotulo: 'Título', max: 120 },
    { chave: 'texto', rotulo: 'Texto', max: 6000, longo: true },
  ],
};

/** Campo que dá nome ao registro na lista do editor e gera o id. */
export const CAMPO_TITULO: Record<ColecaoConteudo, string> = { faq: 'pergunta', controles: 'titulo' };

export function ehColecaoConteudo(colecao: string): colecao is ColecaoConteudo {
  return colecao === 'faq' || colecao === 'controles';
}

type Resultado = { ok: true; valor: Record<string, string> } | { ok: false; erro: string };

/** Todos os campos são obrigatórios e têm tamanho máximo. Campos que a
 * coleção não conhece são descartados — o banco só guarda o esperado. */
export function validarConteudo(colecao: ColecaoConteudo, entrada: Record<string, string>): Resultado {
  const valor: Record<string, string> = {};
  for (const campo of CAMPOS_CONTEUDO[colecao]) {
    const texto = (entrada[campo.chave] ?? '').replace(/\r\n/g, '\n').trim();
    if (!texto) return { ok: false, erro: `Preencha o campo "${campo.rotulo}".` };
    if (texto.length > campo.max) {
      return { ok: false, erro: `"${campo.rotulo}" passa de ${campo.max} caracteres.` };
    }
    valor[campo.chave] = texto;
  }
  return { ok: true, valor };
}

/** Id estável a partir do título; se já existir (no guia, entre os criados
 * ou entre os escondidos), ganha -2, -3… — id nunca é reaproveitado, senão
 * um registro escondido voltaria a aparecer com outro texto. */
export function gerarIdConteudo(titulo: string, ocupados: ReadonlySet<string>): string {
  const base = gerarId(titulo).slice(0, 50).replace(/-+$/g, '') || 'novo';
  if (!ocupados.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidato = `${base}-${n}`;
    if (!ocupados.has(candidato)) return candidato;
  }
}
