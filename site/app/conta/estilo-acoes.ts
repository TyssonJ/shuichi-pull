'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { estiloVazio, estilosIguais, validarEstilo, type EstiloPerfil } from '@/lib/estilo-perfil';
import { ehUrlDeMidia } from '@/lib/midia';
import { verificarMidia } from '@/lib/midia-servidor';
import { emitirEvento } from '@/lib/junko/servico';
import { executar, ErroDeNegocio } from '@/lib/acao';

async function exigirPessoa() {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) throw new ErroDeNegocio('Entra com o Discord primeiro.');
  return { discordId, ehAdm: Boolean(sessao?.user?.papel) };
}

/** Imagem enviada por aqui: confere no Blob que é imagem do tamanho do uso. */
async function conferirArquivos(estilo: EstiloPerfil) {
  const conferencias: { url: string; tipo: 'imagem' | 'icone' }[] = [
    ...[estilo.fundoEsquerdo, estilo.fundoDireito].filter((u): u is string => !!u).map((url) => ({ url, tipo: 'imagem' as const })),
    ...estilo.emojis.map((e) => ({ url: e.url, tipo: 'icone' as const })),
  ];
  for (const { url, tipo } of conferencias) {
    if (!ehUrlDeMidia(url)) continue;
    const r = await verificarMidia(url, tipo);
    if (!r.ok) throw new ErroDeNegocio(r.erro);
  }
}

/**
 * Manda o estilo do perfil. Pessoa comum: vira PEDIDO e só aparece pra todo
 * mundo depois que um ADM aprovar. ADM: entra direto (é ele quem aprovaria).
 * Estilo vazio = a pessoa limpando o próprio: isso vale na hora, sem revisão.
 */
async function enviarEstilo_(entrada: Parameters<typeof validarEstilo>[0]): Promise<'pendente' | 'publicado' | 'removido'> {
  const { discordId, ehAdm } = await exigirPessoa();
  const r = validarEstilo(entrada);
  if (!r.ok) throw new ErroDeNegocio(r.erro);
  const estilo = r.valor;
  const atual = await repositorioPerfilEstilos.buscar(discordId);

  if (estiloVazio(estilo)) {
    await repositorioPerfilEstilos.removerPublicado(discordId, discordId);
    await repositorioPerfilEstilos.cancelarPedido(discordId);
    revalidatePath('/conta');
    revalidatePath(`/u/${discordId}`);
    return 'removido';
  }
  if (estilosIguais(estilo, atual?.publicado)) {
    // Voltar ao que já está no ar = desistir do pedido (pendente ou rejeitado).
    if (!atual || atual.status === 'nenhum') throw new ErroDeNegocio('Esse estilo já está no ar. Mude alguma coisa pra enviar.');
    await repositorioPerfilEstilos.cancelarPedido(discordId);
    revalidatePath('/conta');
    revalidatePath('/adm/perfis');
    return 'publicado';
  }

  await conferirArquivos(estilo);
  await repositorioPerfilEstilos.enviar(discordId, estilo, { publicarDireto: ehAdm, autor: discordId });
  await repositorioAuditoria.registrar({
    autor: discordId, acao: ehAdm ? 'perfil.publicar' : 'perfil.enviar_estilo', alvo: `perfil/${discordId}`,
    valorAntigo: null, valorNovo: JSON.stringify({ cor: estilo.corTema, fundo: Boolean(estilo.fundoEsquerdo), emojis: estilo.emojis.length }),
  });
  revalidatePath('/conta');
  revalidatePath('/adm/perfis');
  revalidatePath(`/u/${discordId}`);
  if (!ehAdm) emitirEvento({ tipo: 'perfil.pendente', discordId });
  return ehAdm ? 'publicado' : 'pendente';
}

async function cancelarPedidoEstilo_() {
  const { discordId } = await exigirPessoa();
  await repositorioPerfilEstilos.cancelarPedido(discordId);
  revalidatePath('/conta');
  revalidatePath('/adm/perfis');
}

export async function enviarEstiloAction(...args: Parameters<typeof enviarEstilo_>) {
  return executar(() => enviarEstilo_(...args));
}

export async function cancelarPedidoEstiloAction() {
  return executar(() => cancelarPedidoEstilo_());
}
