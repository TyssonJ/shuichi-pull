'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioConteudoAdm } from '@/db/repositorios/conteudo-adm';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import {
  CAMPO_TITULO, ehColecaoConteudo, gerarIdConteudo, validarConteudo, type ColecaoConteudo,
} from '@/lib/adm/conteudo';
import { caminhosParaRevalidar } from '@/lib/adm/rotas-colecao';
import { obterCaminho, type Colecao } from '@/lib/correcoes-merge';
import { executar, ErroDeNegocio } from '@/lib/acao';

/** Campo que dá nome ao registro: nunca pode ficar vazio. */
const CAMINHO_TITULO: Record<Colecao, string> = {
  personagens: 'nome', itens: 'nome.pt', locais: 'nome.pt', faq: 'pergunta', controles: 'titulo',
};

const MAX_CAMPO = 8000;

function revalidar(colecao: Colecao, id: string) {
  for (const caminho of caminhosParaRevalidar(colecao, id)) revalidatePath(caminho);
}

function limpar(valor: string): string {
  return valor.replace(/\r\n/g, '\n').trim();
}

/** Sprite e ícone entram num <img src>: só caminho do próprio site ou https. */
function validarCampo(caminho: string, valor: string): string | null {
  if (valor.length > MAX_CAMPO) return 'Texto longo demais.';
  if ((caminho === 'sprite' || caminho === 'icone') && valor && !/^(\/|https:\/\/)/.test(valor)) {
    return 'O endereço da imagem precisa começar com / ou https://.';
  }
  return null;
}

/**
 * Salva todos os campos de um registro de uma vez, do jeito que o editor
 * visual manda. Criado pelo ADM → grava direto. Vindo do guia → só grava
 * como correção o que difere do original; se o valor voltou a ser igual ao
 * guia, a correção some (o registro "desedita" sozinho).
 */
async function salvarRegistroAction_(colecao: Colecao, id: string, valores: Record<string, string>) {
  const sessao = await exigirAdm();

  if (ehColecaoConteudo(colecao)) {
    const extra = await repositorioConteudoAdm.buscarExtra(colecao, id);
    if (extra) {
      const r = validarConteudo(colecao, { ...extra.dados, ...valores });
      if (!r.ok) throw new ErroDeNegocio(r.erro);
      await repositorioConteudoAdm.atualizarExtra(colecao, id, r.valor);
      await repositorioAuditoria.registrar({
        autor: sessao.discordId, acao: 'conteudo.editar', alvo: `${colecao}/${id}`,
        valorAntigo: JSON.stringify(extra.dados), valorNovo: JSON.stringify(r.valor),
      });
      revalidar(colecao, id);
      return;
    }
  }

  const registro = registrosBase(colecao).find((r) => r.id === id);
  if (!registro) throw new ErroDeNegocio('Esse registro não existe mais.');

  const correcoes = (await repositorioCorrecoes.buscarCorrecoesPorColecao(colecao)).get(id);

  // Valida tudo antes de gravar qualquer campo, pra não salvar pela metade.
  const alteracoes: { caminho: string; valor: string; original: string }[] = [];
  for (const campo of CAMPOS_POR_COLECAO[colecao]) {
    if (!(campo.caminho in valores)) continue;
    const valor = limpar(valores[campo.caminho]);
    const erro = validarCampo(campo.caminho, valor);
    if (erro) throw new ErroDeNegocio(`${campo.rotulo}: ${erro}`);
    if (campo.caminho === CAMINHO_TITULO[colecao] && !valor) {
      throw new ErroDeNegocio(`"${campo.rotulo}" não pode ficar vazio.`);
    }
    alteracoes.push({ caminho: campo.caminho, valor, original: obterCaminho(registro, campo.caminho) ?? '' });
  }

  for (const { caminho, valor, original } of alteracoes) {
    const atual = correcoes?.get(caminho);
    if (valor === original) {
      if (atual) await repositorioCorrecoes.reverterCorrecao({ colecao, registroId: id, campo: caminho, autor: sessao.discordId });
    } else if (atual?.valor !== valor) {
      await repositorioCorrecoes.salvarCorrecao({
        colecao, registroId: id, campo: caminho, valor, valorBase: original, autor: sessao.discordId,
      });
    }
  }
  revalidar(colecao, id);
}

/** Volta um registro do guia ao texto original, de uma vez (todos os campos). */
async function reverterRegistroAction_(colecao: Colecao, id: string) {
  const sessao = await exigirAdm();
  for (const campo of CAMPOS_POR_COLECAO[colecao]) {
    await repositorioCorrecoes.reverterCorrecao({ colecao, registroId: id, campo: campo.caminho, autor: sessao.discordId });
  }
  revalidar(colecao, id);
}

/** Cria uma pergunta de FAQ / card de mecânica novo. Devolve o id gerado. */
async function criarConteudoAction_(colecao: ColecaoConteudo, valores: Record<string, string>): Promise<string> {
  const sessao = await exigirAdm();
  const r = validarConteudo(colecao, valores);
  if (!r.ok) throw new ErroDeNegocio(r.erro);

  const ocupados = new Set<string>([
    ...registrosBase(colecao).map((b) => b.id),
    ...(await repositorioConteudoAdm.listarExtras(colecao)).map((e) => e.id),
    ...(await repositorioConteudoAdm.listarRemovidos(colecao)),
  ]);
  const id = gerarIdConteudo(r.valor[CAMPO_TITULO[colecao]], ocupados);

  await repositorioConteudoAdm.criarExtra(colecao, id, r.valor, sessao.discordId);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'conteudo.criar', alvo: `${colecao}/${id}`,
    valorAntigo: null, valorNovo: JSON.stringify(r.valor),
  });
  revalidar(colecao, id);
  return id;
}

/** Criado pelo ADM → apaga de vez. Do guia → só esconde (dá pra restaurar). */
async function excluirConteudoAction_(colecao: ColecaoConteudo, id: string) {
  const sessao = await exigirAdm();
  const extra = await repositorioConteudoAdm.buscarExtra(colecao, id);

  if (extra) {
    await repositorioConteudoAdm.excluirExtra(colecao, id);
    await repositorioAuditoria.registrar({
      autor: sessao.discordId, acao: 'conteudo.excluir', alvo: `${colecao}/${id}`,
      valorAntigo: JSON.stringify(extra.dados), valorNovo: null,
    });
  } else {
    if (!registrosBase(colecao).some((r) => r.id === id)) throw new ErroDeNegocio('Esse registro não existe mais.');
    await repositorioConteudoAdm.ocultar(colecao, id, sessao.discordId);
    await repositorioAuditoria.registrar({
      autor: sessao.discordId, acao: 'conteudo.ocultar', alvo: `${colecao}/${id}`, valorAntigo: null, valorNovo: null,
    });
  }
  revalidar(colecao, id);
}

async function restaurarConteudoAction_(colecao: ColecaoConteudo, id: string) {
  const sessao = await exigirAdm();
  await repositorioConteudoAdm.restaurar(colecao, id);
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'conteudo.restaurar', alvo: `${colecao}/${id}`, valorAntigo: null, valorNovo: null,
  });
  revalidar(colecao, id);
}

export async function salvarRegistroAction(...args: Parameters<typeof salvarRegistroAction_>) {
  return executar(() => salvarRegistroAction_(...args));
}

export async function reverterRegistroAction(...args: Parameters<typeof reverterRegistroAction_>) {
  return executar(() => reverterRegistroAction_(...args));
}

export async function criarConteudoAction(...args: Parameters<typeof criarConteudoAction_>) {
  return executar(() => criarConteudoAction_(...args));
}

export async function excluirConteudoAction(...args: Parameters<typeof excluirConteudoAction_>) {
  return executar(() => excluirConteudoAction_(...args));
}

export async function restaurarConteudoAction(...args: Parameters<typeof restaurarConteudoAction_>) {
  return executar(() => restaurarConteudoAction_(...args));
}
