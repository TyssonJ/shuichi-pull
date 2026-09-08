'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import type { Colecao } from '@/lib/correcoes-merge';

const ROTA_LISTAGEM: Record<Colecao, string> = {
  personagens: '/elenco',
  itens: '/itens',
  locais: '/mapa',
  faq: '/faq',
  controles: '/mecanicas',
};

/** Só personagens/itens/locais têm página de detalhe própria por registro. */
const TEM_PAGINA_DE_DETALHE: Record<Colecao, boolean> = {
  personagens: true, itens: true, locais: true, faq: false, controles: false,
};

function revalidarColecao(colecao: Colecao, registroId: string) {
  const base = ROTA_LISTAGEM[colecao];
  revalidatePath(base);
  if (TEM_PAGINA_DE_DETALHE[colecao]) revalidatePath(`${base}/${registroId}`);
}

export async function salvarCorrecaoAction(colecao: Colecao, args: {
  registroId: string; campo: string; valor: string; valorBase: string;
}) {
  const sessao = await exigirAdm();
  await repositorioCorrecoes.salvarCorrecao({ ...args, colecao, autor: sessao.discordId });
  revalidarColecao(colecao, args.registroId);
}

export async function reverterCorrecaoAction(colecao: Colecao, args: {
  registroId: string; campo: string;
}) {
  const sessao = await exigirAdm();
  await repositorioCorrecoes.reverterCorrecao({ ...args, colecao, autor: sessao.discordId });
  revalidarColecao(colecao, args.registroId);
}
