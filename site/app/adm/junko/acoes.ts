'use server';

import { revalidatePath } from 'next/cache';
import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { CFG_JUNKO, validarUrlJunko } from '@/lib/junko/config';
import { gerarChave, hashDaChave } from '@/lib/junko/chave';
import { notificarJunko, lerConfigEnvio } from '@/lib/junko/servico';
import { pingarBot, type EstadoBot } from '@/lib/junko/ping';
import type { ResultadoEnvio } from '@/lib/junko/enviar';
import { buscarAvaliacoesDoBot, validarCaminhoAvaliacoes, CAMINHO_AVALIACOES_PADRAO } from '@/lib/junko/buscar-avaliacoes';
import { importarAvaliacoes } from '@/lib/junko/importar-avaliacoes';
import type { AvaliacaoIgnorada } from '@/lib/junko/avaliacoes';
import { executar, ErroDeNegocio } from '@/lib/acao';

/**
 * Gera a chave que o bot usa pra falar com o site. Só o hash fica guardado:
 * a chave em texto volta UMA vez, aqui, e nunca mais. Gerar de novo
 * invalida a anterior na hora.
 */
export async function gerarChaveJunkoAction(): Promise<string> {
  const sessao = await exigirChefe();
  const chave = gerarChave();
  await repositorioConfiguracoes.definir(CFG_JUNKO.chaveHash, hashDaChave(chave));
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'junko.chave_gerar', alvo: 'junko/chave', valorAntigo: null, valorNovo: null,
  });
  revalidatePath('/adm/junko');
  return chave;
}

async function salvarConfigJunkoAction_(dados: {
  url: string;
  ativo: boolean;
  /** Credencial que o bot exige pra receber eventos. null = não mexe; '' = apaga. */
  chaveSaida: string | null;
  /** Rota do bot que devolve as avaliações dele. Omitido = não mexe. */
  caminhoAvaliacoes?: string;
}) {
  const sessao = await exigirChefe();

  const url = validarUrlJunko(dados.url);
  if (!url.ok) throw new ErroDeNegocio(url.erro);
  const caminho = dados.caminhoAvaliacoes === undefined ? null : validarCaminhoAvaliacoes(dados.caminhoAvaliacoes);
  if (caminho && !caminho.ok) throw new ErroDeNegocio(caminho.erro);
  if (caminho?.ok) await repositorioConfiguracoes.definir(CFG_JUNKO.caminhoAvaliacoes, caminho.valor);

  await repositorioConfiguracoes.definir(CFG_JUNKO.url, url.valor);
  await repositorioConfiguracoes.definir(CFG_JUNKO.eventosAtivos, String(dados.ativo));
  if (dados.chaveSaida !== null) {
    await repositorioConfiguracoes.definir(CFG_JUNKO.chaveSaida, dados.chaveSaida.trim());
  }

  // O valor da credencial nunca vai pra auditoria.
  await repositorioAuditoria.registrar({
    autor: sessao.discordId, acao: 'junko.configurar', alvo: 'junko/config', valorAntigo: null,
    valorNovo: JSON.stringify({ url: url.valor, ativo: dados.ativo, chaveSaida: dados.chaveSaida === null ? 'inalterada' : dados.chaveSaida.trim() ? 'definida' : 'apagada' }),
  });
  revalidatePath('/adm/junko');
}

/** Manda um evento "teste" agora, mesmo com o envio desligado. */
export async function enviarTesteJunkoAction(): Promise<ResultadoEnvio> {
  await exigirChefe();
  const resultado = await notificarJunko({ tipo: 'teste' }, { forcar: true });
  revalidatePath('/adm/junko');
  return resultado;
}

export async function verificarBotAction(): Promise<EstadoBot> {
  await exigirChefe();
  return pingarBot((await lerConfigEnvio()).url);
}

export async function salvarConfigJunkoAction(...args: Parameters<typeof salvarConfigJunkoAction_>) {
  return executar(() => salvarConfigJunkoAction_(...args));
}

export type ResultadoImportacaoBot =
  | { ok: true; importadas: number; ignoradas: AvaliacaoIgnorada[] }
  | { ok: false; erro: string };

/**
 * Puxa as avaliações do bot agora e grava no site (as que já vieram antes
 * são atualizadas, não duplicadas). Só chefe. Não lança: o motivo de uma
 * falha (bot fora do ar, rota ainda inexistente) volta pro painel mostrar.
 */
export async function importarAvaliacoesDoBotAction(): Promise<ResultadoImportacaoBot> {
  const sessao = await exigirChefe();
  const config = await lerConfigEnvio();
  const [caminhoSalvo, desde] = await Promise.all([
    repositorioConfiguracoes.obter(CFG_JUNKO.caminhoAvaliacoes),
    repositorioConfiguracoes.obter(CFG_JUNKO.ultimaImportacao),
  ]);

  const busca = await buscarAvaliacoesDoBot({
    url: config.url, chave: config.chave, desde,
    caminho: caminhoSalvo ?? CAMINHO_AVALIACOES_PADRAO,
  });
  if (!busca.ok) return { ok: false, erro: busca.erro };

  const comeco = new Date().toISOString();
  const r = await importarAvaliacoes(busca.bruto, sessao.discordId);
  await repositorioConfiguracoes.definir(CFG_JUNKO.ultimaImportacao, comeco);
  revalidatePath('/adm/junko');
  return { ok: true, importadas: r.importadas, ignoradas: r.ignoradas };
}
