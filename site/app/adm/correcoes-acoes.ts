'use server';

import { revalidatePath } from 'next/cache';
import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import type { Colecao } from '@/lib/correcoes-merge';
import { caminhosParaRevalidar } from '@/lib/adm/rotas-colecao';

function revalidarColecao(colecao: Colecao, registroId: string) {
  // Inclui a rota do próprio painel: sem ela o indicador "●" e o banner de
  // conflito não atualizam sozinhos depois de salvar/reverter.
  for (const caminho of caminhosParaRevalidar(colecao, registroId)) revalidatePath(caminho);
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
