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

/** Rota do próprio painel adm para cada coleção — os nomes não batem 1:1
 * com os da coleção (mesma pegadinha de ROTA_LISTAGEM acima: locais é
 * /adm/mapa, controles é /adm/mecanicas). */
const ROTA_ADMIN: Record<Colecao, string> = {
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

function revalidarColecao(colecao: Colecao, registroId: string) {
  const base = ROTA_LISTAGEM[colecao];
  revalidatePath(base);
  if (TEM_PAGINA_DE_DETALHE[colecao]) revalidatePath(`${base}/${registroId}`);
  // Sem isso, o indicador "●" e o banner de conflito do próprio painel adm
  // não atualizam sozinhos depois de salvar/reverter uma correção — só
  // com um reload manual da página.
  revalidatePath(ROTA_ADMIN[colecao]);
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
