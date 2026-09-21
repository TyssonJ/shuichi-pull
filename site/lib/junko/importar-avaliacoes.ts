import { revalidatePath } from 'next/cache';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { normalizarAvaliacoesExternas, type AvaliacaoIgnorada } from './avaliacoes';

export type ResultadoImportacao = { importadas: number; ignoradas: AvaliacaoIgnorada[] };

/**
 * Único caminho pelo qual avaliação do Junko Bot entra no site — seja o bot
 * mandando (POST /api/junko/avaliacoes/) ou o chefe puxando pelo painel.
 * Valida item a item, confere que a pessoa avaliada existe aqui, grava sem
 * duplicar (pelo externoId) e deixa rastro na auditoria.
 */
export async function importarAvaliacoes(bruto: unknown, autor: string): Promise<ResultadoImportacao> {
  const candidatos = Array.isArray(bruto)
    ? bruto.map((i) => (typeof i === 'object' && i !== null ? (i as { avaliadoDiscordId?: unknown }).avaliadoDiscordId : undefined))
        .filter((id): id is string => typeof id === 'string')
    : [];
  const conhecidos = await repositorioUsuarios.existentes([...new Set(candidatos)]);

  const { validas, ignoradas } = normalizarAvaliacoesExternas(bruto, conhecidos);
  if (validas.length > 0) {
    await repositorioPartidaAvaliacoes.importarDoJunko(validas);
    for (const id of new Set(validas.map((v) => v.avaliadoDiscordId))) revalidatePath(`/u/${id}`);
  }

  await repositorioAuditoria.registrar({
    autor, acao: 'junko.avaliacoes_importar', alvo: 'junko/avaliacoes', valorAntigo: null,
    valorNovo: `${validas.length} importada(s), ${ignoradas.length} ignorada(s)`,
  });
  return { importadas: validas.length, ignoradas };
}
