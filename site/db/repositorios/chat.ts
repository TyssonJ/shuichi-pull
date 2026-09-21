import { and, asc, desc, eq, gt, gte, inArray, lt, or, sql } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { administradores, chatMensagens, chatPresenca, partidaParticipantes, partidas, usuarios } from '../schema';
import type { AnexoChat } from '../../lib/chat';

type Banco = typeof DbClient;

export type MensagemComAutor = {
  id: number;
  sala: string;
  autorDiscordId: string;
  texto: string;
  anexos: AnexoChat[];
  criadoEm: Date;
  autor: {
    discordNome: string | null;
    discordAvatar: string | null;
    apelido: string | null;
    avatarUrl: string | null;
    ehAdm: boolean;
  };
};

export type SalaDePartida = { id: number; titulo: string; status: string };

export function criarRepositorioChat(db: Banco) {
  const campos = {
    id: chatMensagens.id,
    sala: chatMensagens.sala,
    autorDiscordId: chatMensagens.autorDiscordId,
    texto: chatMensagens.texto,
    anexos: chatMensagens.anexos,
    criadoEm: chatMensagens.criadoEm,
    discordNome: usuarios.discordNome,
    discordAvatar: usuarios.discordAvatar,
    apelido: usuarios.apelido,
    avatarUrl: usuarios.avatarUrl,
    admId: administradores.discordId,
  };

  function comAutor(l: { [K in keyof typeof campos]: unknown }): MensagemComAutor {
    return {
      id: l.id as number,
      sala: l.sala as string,
      autorDiscordId: l.autorDiscordId as string,
      texto: l.texto as string,
      anexos: l.anexos as AnexoChat[],
      criadoEm: l.criadoEm as Date,
      autor: {
        discordNome: (l.discordNome as string | null) ?? null,
        discordAvatar: (l.discordAvatar as string | null) ?? null,
        apelido: (l.apelido as string | null) ?? null,
        avatarUrl: (l.avatarUrl as string | null) ?? null,
        ehAdm: l.admId != null,
      },
    };
  }

  return {
    /**
     * Mensagens da sala dentro da janela `desde`. Sem `depoisDe`: as mais recentes
     * (em ordem cronológica). Com `depoisDe`: só as que chegaram depois dela.
     */
    async listar(sala: string, opcoes: { desde: Date; depoisDe?: number; limite: number }): Promise<MensagemComAutor[]> {
      const filtro = and(
        eq(chatMensagens.sala, sala),
        gte(chatMensagens.criadoEm, opcoes.desde),
        opcoes.depoisDe !== undefined ? gt(chatMensagens.id, opcoes.depoisDe) : undefined,
      );
      const base = db.select(campos).from(chatMensagens)
        .leftJoin(usuarios, eq(usuarios.discordId, chatMensagens.autorDiscordId))
        .leftJoin(administradores, eq(administradores.discordId, chatMensagens.autorDiscordId))
        .where(filtro);
      if (opcoes.depoisDe !== undefined) return (await base.orderBy(asc(chatMensagens.id)).limit(opcoes.limite)).map(comAutor);
      return (await base.orderBy(desc(chatMensagens.id)).limit(opcoes.limite)).map(comAutor).reverse();
    },

    /** Ids ainda visíveis: o navegador some com o que não está mais na lista (apagado por ADM). */
    async idsNaJanela(sala: string, desde: Date, limite: number): Promise<number[]> {
      const linhas = await db.select({ id: chatMensagens.id }).from(chatMensagens)
        .where(and(eq(chatMensagens.sala, sala), gte(chatMensagens.criadoEm, desde)))
        .orderBy(desc(chatMensagens.id)).limit(limite);
      return linhas.map((l) => l.id);
    },

    async criar(dados: { sala: string; autorDiscordId: string; texto: string; anexos: AnexoChat[] }): Promise<number> {
      const [linha] = await db.insert(chatMensagens).values(dados).returning({ id: chatMensagens.id });
      return linha.id;
    },

    async buscar(id: number) {
      const linhas = await db.select().from(chatMensagens).where(eq(chatMensagens.id, id));
      return linhas[0] ?? null;
    },

    async remover(id: number) {
      await db.delete(chatMensagens).where(eq(chatMensagens.id, id));
    },

    /** Última mensagem e quantas nos últimos 60 s — a base do anti-flood. */
    async atividadeRecente(discordId: string, agora: Date): Promise<{ ultimo: Date | null; noUltimoMinuto: number }> {
      const desde = new Date(agora.getTime() - 60_000);
      const [linha] = await db.select({
        ultimo: sql<Date | null>`max(${chatMensagens.criadoEm})`,
        n: sql<number>`count(*)::int`,
      }).from(chatMensagens).where(and(eq(chatMensagens.autorDiscordId, discordId), gte(chatMensagens.criadoEm, desde)));
      return { ultimo: linha?.ultimo ? new Date(linha.ultimo) : null, noUltimoMinuto: linha?.n ?? 0 };
    },

    /** Batimento: a pessoa está com esta sala aberta agora. */
    async marcarPresenca(discordId: string, sala: string, agora: Date) {
      await db.insert(chatPresenca).values({ discordId, sala, vistoEm: agora })
        .onConflictDoUpdate({ target: chatPresenca.discordId, set: { sala, vistoEm: agora } });
    },

    async contarOnline(sala: string, desde: Date): Promise<number> {
      const [linha] = await db.select({ n: sql<number>`count(*)::int` }).from(chatPresenca)
        .where(and(eq(chatPresenca.sala, sala), gte(chatPresenca.vistoEm, desde)));
      return linha?.n ?? 0;
    },

    /** Partidas em aberto (agendada / em andamento) em que a pessoa é host ou está inscrita. */
    async salasDePartida(discordId: string): Promise<SalaDePartida[]> {
      const linhas = await db.selectDistinct({ id: partidas.id, titulo: partidas.titulo, status: partidas.status, dataHora: partidas.dataHora })
        .from(partidas)
        .leftJoin(partidaParticipantes, eq(partidaParticipantes.partidaId, partidas.id))
        .where(and(
          inArray(partidas.status, ['agendada', 'em_andamento']),
          or(eq(partidas.hostDiscordId, discordId), eq(partidaParticipantes.discordId, discordId)),
        ))
        .orderBy(asc(partidas.dataHora));
      return linhas.map(({ id, titulo, status }) => ({ id, titulo, status }));
    },

    /**
     * Apaga mensagens mais velhas que `antes` (e a presença antiga) e devolve os
     * arquivos delas, pra quem chamou tirar do Blob. Em lotes, pra não travar.
     */
    async purgar(antes: Date, limite = 200): Promise<string[]> {
      const velhas = await db.select({ id: chatMensagens.id, anexos: chatMensagens.anexos }).from(chatMensagens)
        .where(lt(chatMensagens.criadoEm, antes)).limit(limite);
      if (velhas.length > 0) await db.delete(chatMensagens).where(inArray(chatMensagens.id, velhas.map((v) => v.id)));
      await db.delete(chatPresenca).where(lt(chatPresenca.vistoEm, antes));
      return velhas.flatMap((v) => v.anexos.map((a) => a.url));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioChat = criarRepositorioChat(db);
