import { eq, and, asc, desc, ne, inArray, gte, lte } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { partidas, partidaParticipantes, partidaCapitulos } from '../schema';
import {
  calcularEstatisticas, desfechoParaUsuario, foiBlackened, type Desfecho, type Estatisticas,
} from '../../lib/estatisticas-usuario';
import type { PartidaAvisada } from '../../lib/alerta-partida';
import type { StatusPartida } from '../../lib/status-partida';

type Banco = typeof DbClient;
export type PartidaLinha = typeof partidas.$inferSelect;
export type ParticipanteLinha = typeof partidaParticipantes.$inferSelect;
export type PartidaHistorico = PartidaLinha & { eraBlackened: boolean; desfecho: Desfecho | null };
export type NovaPartida = {
  titulo: string; hostDiscordId: string; dataHora: Date; regras: string | null; capaUrl: string | null;
  vagas?: number;
};

export function criarRepositorioPartidas(db: Banco) {
  return {
    async listarAbertas(): Promise<PartidaLinha[]> {
      return db.select().from(partidas)
        .where(ne(partidas.status, 'cancelada'))
        .orderBy(asc(partidas.dataHora));
    },

    /** Inclui as canceladas — só o painel do ADM precisa vê-las. */
    async listarTodas(): Promise<PartidaLinha[]> {
      return db.select().from(partidas).orderBy(desc(partidas.dataHora));
    },

    /** Partidas agendadas a partir de `de`, da mais próxima pra mais distante. */
    async proximasAgendadas(de: Date, limite: number): Promise<PartidaLinha[]> {
      return db.select().from(partidas)
        .where(and(eq(partidas.status, 'agendada'), gte(partidas.dataHora, de)))
        .orderBy(asc(partidas.dataHora))
        .limit(limite);
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

    /** Além do status, carimba o horário: "começar" grava iniciadaEm e
     * "finalizar" grava finalizadaEm — é daí que saem o cronômetro e a duração. */
    async mudarStatus(id: number, status: StatusPartida, agora: Date = new Date()) {
      const horarios =
        status === 'em_andamento' ? { iniciadaEm: agora }
        : status === 'finalizada' ? { finalizadaEm: agora }
        : {};
      await db.update(partidas).set({ status, ...horarios }).where(eq(partidas.id, id));
    },

    /** Só o estado (status e horários) de várias partidas, pro monitor da página. */
    async estados(ids: number[]): Promise<Pick<PartidaLinha, 'id' | 'status' | 'iniciadaEm'>[]> {
      if (ids.length === 0) return [];
      return db.select({ id: partidas.id, status: partidas.status, iniciadaEm: partidas.iniciadaEm })
        .from(partidas).where(inArray(partidas.id, ids));
    },

    /** Partidas rolando agora, as mais antigas primeiro. */
    async emAndamento(): Promise<PartidaLinha[]> {
      return db.select().from(partidas)
        .where(eq(partidas.status, 'em_andamento'))
        .orderBy(asc(partidas.iniciadaEm));
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

    /** O host muda a inscrição de alguém que JÁ está na partida (personagem e/ou
     * titular↔reserva). Diferente de `entrar`, nunca cria uma inscrição nova. */
    async atualizarInscricao(
      partidaId: number, discordId: string,
      dados: { personagemId: string | null; tipo: 'participante' | 'reserva' },
    ) {
      await db.update(partidaParticipantes).set(dados).where(and(
        eq(partidaParticipantes.partidaId, partidaId), eq(partidaParticipantes.discordId, discordId),
      ));
    },

    /** Checklist do host: "já convidei essa pessoa pra party". */
    async definirConvidado(partidaId: number, discordId: string, convidado: boolean) {
      await db.update(partidaParticipantes).set({ convidado }).where(and(
        eq(partidaParticipantes.partidaId, partidaId), eq(partidaParticipantes.discordId, discordId),
      ));
    },

    async sair(partidaId: number, discordId: string) {
      await db.delete(partidaParticipantes)
        .where(and(
          eq(partidaParticipantes.partidaId, partidaId),
          eq(partidaParticipantes.discordId, discordId),
        ));
    },

    /**
     * Partidas agendadas em que o usuário está inscrito (titular ou reserva)
     * com horário dentro de [de, ate] — alimenta o aviso global do site.
     */
    async proximasDoUsuario(discordId: string, de: Date, ate: Date): Promise<PartidaAvisada[]> {
      const linhas = await db
        .select({
          id: partidas.id, titulo: partidas.titulo, dataHora: partidas.dataHora,
          tipo: partidaParticipantes.tipo,
        })
        .from(partidaParticipantes)
        .innerJoin(partidas, eq(partidas.id, partidaParticipantes.partidaId))
        .where(and(
          eq(partidaParticipantes.discordId, discordId),
          eq(partidas.status, 'agendada'),
          gte(partidas.dataHora, de),
          lte(partidas.dataHora, ate),
        ))
        .orderBy(asc(partidas.dataHora));
      return linhas.map((l) => ({ ...l, dataHora: l.dataHora.toISOString() }));
    },

    /**
     * Tudo que o perfil público precisa numa carga só: o histórico COMPLETO
     * de partidas finalizadas (mais recentes primeiro) e as estatísticas.
     * O relatório por capítulo entra no cálculo — o culpado pode estar só nele.
     */
    async perfilDoUsuario(discordId: string): Promise<{
      historico: PartidaHistorico[]; estatisticas: Estatisticas;
    }> {
      const entradas = await db.select({ partidaId: partidaParticipantes.partidaId })
        .from(partidaParticipantes)
        .where(eq(partidaParticipantes.discordId, discordId));
      const ids = [...new Set(entradas.map((e) => e.partidaId))];
      if (ids.length === 0) {
        return { historico: [], estatisticas: calcularEstatisticas(discordId, [], []) };
      }

      const [finalizadas, capitulos] = await Promise.all([
        db.select().from(partidas)
          .where(and(eq(partidas.status, 'finalizada'), inArray(partidas.id, ids)))
          .orderBy(desc(partidas.dataHora)),
        db.select().from(partidaCapitulos).where(inArray(partidaCapitulos.partidaId, ids)),
      ]);

      return {
        estatisticas: calcularEstatisticas(discordId, finalizadas, capitulos),
        historico: finalizadas.map((p) => {
          const caps = capitulos.filter((c) => c.partidaId === p.id);
          return {
            ...p,
            eraBlackened: foiBlackened(discordId, p, caps),
            desfecho: desfechoParaUsuario(discordId, p, caps),
          };
        }),
      };
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPartidas = criarRepositorioPartidas(db);
