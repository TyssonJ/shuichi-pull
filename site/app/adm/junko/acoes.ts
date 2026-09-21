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
}) {
  const sessao = await exigirChefe();

  const url = validarUrlJunko(dados.url);
  if (!url.ok) throw new ErroDeNegocio(url.erro);

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
