'use server';

import { after } from 'next/server';
import { auth } from '@/auth';
import { repositorioChat } from '@/db/repositorios/chat';
import { repositorioMidias } from '@/db/repositorios/midias';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { podeAcessarSala } from '@/lib/chat-acesso';
import {
  CHAT_VIDEO_MAX_SEGUNDOS, formatarSegundos, ehUrlDeMidia, tipoDeMidia,
} from '@/lib/midia';
import { RETENCAO_MS, checarLimiteDeEnvio, lerSala, validarTextoChat, type AnexoChat } from '@/lib/chat';
import { apagarMidia, verificarMidia } from '@/lib/midia-servidor';
import { executar, ErroDeNegocio } from '@/lib/acao';

async function exigirPessoa() {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) throw new ErroDeNegocio('Entra com o Discord pra usar o chat.');
  return { discordId, ehAdm: Boolean(sessao?.user?.papel) };
}

/** Uma imagem OU um vídeo curto por mensagem; o tipo vem do arquivo no Blob. */
async function conferirAnexo(
  anexo: { url: string; video: boolean; duracaoSegundos: number | null } | null, discordId: string,
): Promise<AnexoChat[]> {
  if (!anexo) return [];
  if (!ehUrlDeMidia(anexo.url)) throw new ErroDeNegocio('Só arquivos enviados por aqui podem ir no chat.');
  const dono = await repositorioMidias.buscarPorUrl(anexo.url);
  if (dono && dono.discordId !== discordId) throw new ErroDeNegocio('Esse arquivo é de outra pessoa.');
  const conferido = await verificarMidia(anexo.url, anexo.video ? 'chat-video' : 'imagem');
  if (!conferido.ok) throw new ErroDeNegocio(conferido.erro);
  const tipo = tipoDeMidia(conferido.mime);
  if (tipo === 'video' && anexo.duracaoSegundos !== null) {
    if (!Number.isFinite(anexo.duracaoSegundos) || anexo.duracaoSegundos < 0) throw new ErroDeNegocio('Duração de vídeo inválida.');
    if (anexo.duracaoSegundos > CHAT_VIDEO_MAX_SEGUNDOS) {
      throw new ErroDeNegocio(`O vídeo tem ${formatarSegundos(anexo.duracaoSegundos)}; no chat o máximo é ${formatarSegundos(CHAT_VIDEO_MAX_SEGUNDOS)}.`);
    }
  }
  return [{ tipo, url: anexo.url, duracaoSegundos: tipo === 'video' && anexo.duracaoSegundos !== null ? Math.round(anexo.duracaoSegundos) : null }];
}

async function enviarMensagem_(entrada: {
  sala: string; texto: string; anexo: { url: string; video: boolean; duracaoSegundos: number | null } | null;
}): Promise<number> {
  const { discordId, ehAdm } = await exigirPessoa();
  const sala = lerSala(entrada.sala);
  if (!sala) throw new ErroDeNegocio('Sala inválida.');
  if (!(await podeAcessarSala(sala, { discordId, ehAdm }))) throw new ErroDeNegocio('Você não está nessa sala.');

  const texto = validarTextoChat(entrada.texto);
  if (!texto.ok) throw new ErroDeNegocio(texto.erro);
  if (texto.valor.length === 0 && !entrada.anexo) throw new ErroDeNegocio('Escreva algo ou anexe um arquivo.');

  const agora = new Date();
  const recente = await repositorioChat.atividadeRecente(discordId, agora);
  const limite = checarLimiteDeEnvio({
    ultimoEnvioMs: recente.ultimo ? recente.ultimo.getTime() : null, enviosNoUltimoMinuto: recente.noUltimoMinuto, agoraMs: agora.getTime(),
  });
  if (!limite.ok) throw new ErroDeNegocio(limite.erro);

  const anexos = await conferirAnexo(entrada.anexo, discordId);
  const id = await repositorioChat.criar({ sala: entrada.sala, autorDiscordId: discordId, texto: texto.valor, anexos });

  // Sem cron: cada envio aproveita pra apagar o que passou de 24 h (e os arquivos).
  after(async () => {
    const urls = await repositorioChat.purgar(new Date(Date.now() - RETENCAO_MS));
    await Promise.all(urls.map((u) => apagarMidia(u)));
  });
  return id;
}

/** A pessoa apaga a própria mensagem; ADM apaga qualquer uma (fica na auditoria). */
async function apagarMensagem_(mensagemId: number) {
  const { discordId, ehAdm } = await exigirPessoa();
  const mensagem = await repositorioChat.buscar(mensagemId);
  if (!mensagem) throw new ErroDeNegocio('Essa mensagem já não existe.');
  const propria = mensagem.autorDiscordId === discordId;
  if (!propria && !ehAdm) throw new ErroDeNegocio('Você só pode apagar as suas mensagens.');

  await repositorioChat.remover(mensagemId);
  for (const a of mensagem.anexos) await apagarMidia(a.url);
  if (!propria) {
    await repositorioAuditoria.registrar({
      autor: discordId, acao: 'chat.apagar_mensagem', alvo: `chat/${mensagem.sala}/${mensagemId}`,
      valorAntigo: `${mensagem.autorDiscordId}: ${mensagem.texto.slice(0, 200)}`, valorNovo: null,
    });
  }
}

export async function enviarMensagemAction(...args: Parameters<typeof enviarMensagem_>) {
  return executar(() => enviarMensagem_(...args));
}

export async function apagarMensagemAction(...args: Parameters<typeof apagarMensagem_>) {
  return executar(() => apagarMensagem_(...args));
}
