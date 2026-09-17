import { eq, and, asc, desc, ne, inArray, count } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidas, partidaParticipantes } from '../schema';

type Banco = typeof DbClient;
export type PartidaLinha = typeof partidas.$inferSelect;
export type ParticipanteLinha = typeof partidaParticipantes.$inferSelect;
export type NovaPartida = {
  titulo: string; hostDiscordId: string; dataHora: Date; regras: string | null; capaUrl: string | null;
};

export function criarRepositorioPartidas(db: Banco) {
  return {
    async listarAbertas(): Promise<PartidaLinha[]> {
      return db.select().from(partidas)
        .where(ne(partidas.status, 'cancelada'))
        .orderBy(asc(partidas.dataHora));
    },

    async buscar(id: number): Promise<PartidaLinha | null> {
      const linhas = await db.select().from(partidas).where(eq(partidas.id, id));
      return linhas[0] ?? null;
    },

    async participantes(partidaId: number): Promise<ParticipanteLinha[]> {
      return db.select().from(partidaParticipantes)
        .where(eq(partidaParticipantes.partidaId, partidaId))
        .orderBy(asc(partidaParticipantes.entradaEm));
    },

    async criar(dados: NovaPartida): Promise<number> {
      const [linha] = await db.insert(partidas).values(dados).returning({ id: partidas.id });
      return linha.id;
    },

    async atualizar(id: number, dados: Partial<NovaPartida>) {
      await db.update(partidas).set(dados).where(eq(partidas.id, id));
    },

    async mudarStatus(id: number, status: 'agendada' | 'finalizada' | 'cancelada') {
      await db.update(partidas).set({ status }).where(eq(partidas.id, id));
    },

    /** Relatório pós-partida (AAR) — só faz sentido depois que a partida
     * já foi marcada finalizada, mas fica separado de mudarStatus porque o
     * host pode preencher aos poucos ou editar depois de finalizar. */
    async salvarRelatorio(id: number, dados: {
      capitulo: string | null;
      blackened: string | null;
      mvpDiscordIds: string[];
      resultado: 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia' | null;
    }) {
      await db.update(partidas).set(dados).where(eq(partidas.id, id));
    },

    /** Entrar de novo com outro personagem (ou trocar de participante pra
     * reserva) substitui a entrada anterior — daí o onConflictDoUpdate no
     * lugar de barrar a segunda entrada. */
    async entrar(
      partidaId: number, discordId: string, personagemId: string | null,
      tipo: 'participante' | 'reserva' = 'participante',
    ) {
      await db.insert(partidaParticipantes)
        .values({ partidaId, discordId, personagemId, tipo })
        .onConflictDoUpdate({
          target: [partidaParticipantes.partidaId, partidaParticipantes.discordId],
          set: { personagemId, tipo },
        });
    },

    async sair(partidaId: number, discordId: string) {
      await db.delete(partidaParticipantes)
        .where(and(
          eq(partidaParticipantes.partidaId, partidaId),
          eq(partidaParticipantes.discordId, discordId),
        ));
    },

    /** Últimas partidas finalizadas de que um usuário participou — usado no
     * perfil público (histórico de sessões). */
    async historicoDoUsuario(discordId: string, limite = 10): Promise<PartidaLinha[]> {
      const entradas = await db.select({ partidaId: partidaParticipantes.partidaId })
        .from(partidaParticipantes)
        .where(eq(partidaParticipantes.discordId, discordId));
      if (entradas.length === 0) return [];

      const todas = await db.select().from(partidas)
        .where(eq(partidas.status, 'finalizada'))
        .orderBy(desc(partidas.dataHora));
      const idsDoUsuario = new Set(entradas.map((e) => e.partidaId));
      return todas.filter((p) => idsDoUsuario.has(p.id)).slice(0, limite);
    },

    /** Total de partidas finalizadas de que um usuário participou — usado
     * pro título/badge do perfil público, separado do histórico porque esse
     * é limitado a `limite` linhas. */
    async contarFinalizadas(discordId: string): Promise<number> {
      const entradas = await db.select({ partidaId: partidaParticipantes.partidaId })
        .from(partidaParticipantes)
        .where(eq(partidaParticipantes.discordId, discordId));
      if (entradas.length === 0) return 0;

      const idsDoUsuario = [...new Set(entradas.map((e) => e.partidaId))];
      const [linha] = await db.select({ total: count() }).from(partidas)
        .where(and(eq(partidas.status, 'finalizada'), inArray(partidas.id, idsDoUsuario)));
      return linha?.total ?? 0;
    },

    /** Estatísticas completas do perfil público — vitórias/derrotas dependem
     * de cruzar o resultado da partida com se o usuário era o blackened
     * revelado nela, então precisa das partidas inteiras, não só da
     * contagem. "Casos resolvidos" = vitórias como não-blackened, ou seja,
     * partidas em que o grupo pegou o culpado certo. */
    async estatisticasDoUsuario(discordId: string) {
      const entradas = await db.select({ partidaId: partidaParticipantes.partidaId })
        .from(partidaParticipantes)
        .where(eq(partidaParticipantes.discordId, discordId));
      const idsDoUsuario = new Set(entradas.map((e) => e.partidaId));
      if (idsDoUsuario.size === 0) {
        return {
          total: 0, vitorias: 0, derrotas: 0, tragedias: 0,
          comoBlackened: 0, comoDetetive: 0, casosResolvidos: 0, mvps: 0,
        };
      }

      const todas = await db.select().from(partidas)
        .where(and(eq(partidas.status, 'finalizada'), inArray(partidas.id, [...idsDoUsuario])));

      let vitorias = 0, derrotas = 0, tragedias = 0, comoBlackened = 0, mvps = 0, casosResolvidos = 0;
      for (const p of todas) {
        const eraBlackened = p.blackened === discordId;
        if (eraBlackened) comoBlackened++;
        if (p.mvpDiscordIds.includes(discordId)) mvps++;

        if (p.resultado === 'tragedia') { tragedias++; continue; }
        if (p.resultado === 'vitoria_mestre') {
          if (eraBlackened) vitorias++; else derrotas++;
        } else if (p.resultado === 'vitoria_alunos') {
          if (eraBlackened) { derrotas++; } else { vitorias++; casosResolvidos++; }
        }
      }

      return {
        total: todas.length,
        vitorias, derrotas, tragedias,
        comoBlackened, comoDetetive: todas.length - comoBlackened,
        casosResolvidos, mvps,
      };
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPartidas = criarRepositorioPartidas(db);
