import { eq, asc, sql, isNotNull } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { perfilEstilos } from '../schema';
import type { EstiloPerfil } from '../../lib/estilo-perfil';

type Banco = typeof DbClient;
export type PerfilEstiloLinha = typeof perfilEstilos.$inferSelect;

export function criarRepositorioPerfilEstilos(db: Banco) {
  return {
    async buscar(discordId: string): Promise<PerfilEstiloLinha | null> {
      const linhas = await db.select().from(perfilEstilos).where(eq(perfilEstilos.discordId, discordId));
      return linhas[0] ?? null;
    },

    /**
     * A pessoa mandou um estilo. Comum: vira pedido pendente (nada muda em público
     * até um ADM aprovar). ADM: `publicarDireto` — ele é quem aprova, então o
     * estilo entra na hora.
     */
    async enviar(discordId: string, estilo: EstiloPerfil, opcoes: { publicarDireto: boolean; autor: string }) {
      const agora = new Date();
      const valores = opcoes.publicarDireto
        ? { publicado: estilo, pendente: null, status: 'nenhum', motivoRejeicao: null, enviadoEm: null, revisadoPor: opcoes.autor, revisadoEm: agora }
        : { pendente: estilo, status: 'pendente', motivoRejeicao: null, enviadoEm: agora };
      await db.insert(perfilEstilos).values({ discordId, ...valores, atualizadoEm: agora }).onConflictDoUpdate({
        target: perfilEstilos.discordId,
        set: { ...valores, atualizadoEm: agora },
      });
    },

    /** A pessoa desiste do pedido pendente (ou some com o que foi rejeitado). */
    async cancelarPedido(discordId: string) {
      await db.update(perfilEstilos)
        .set({ pendente: null, status: 'nenhum', motivoRejeicao: null, enviadoEm: null, atualizadoEm: new Date() })
        .where(eq(perfilEstilos.discordId, discordId));
    },

    /** O pedido vira o estilo público. */
    async aprovar(discordId: string, revisor: string) {
      const agora = new Date();
      await db.update(perfilEstilos)
        .set({
          publicado: sql`${perfilEstilos.pendente}`, pendente: null, status: 'nenhum', motivoRejeicao: null,
          revisadoPor: revisor, revisadoEm: agora, atualizadoEm: agora,
        })
        .where(eq(perfilEstilos.discordId, discordId));
    },

    /** Rejeita e guarda o pedido junto do motivo: a pessoa vê o que foi recusado e corrige. */
    async rejeitar(discordId: string, revisor: string, motivo: string) {
      const agora = new Date();
      await db.update(perfilEstilos)
        .set({ status: 'rejeitado', motivoRejeicao: motivo, revisadoPor: revisor, revisadoEm: agora, atualizadoEm: agora })
        .where(eq(perfilEstilos.discordId, discordId));
    },

    /** Tira o estilo que está no ar (moderação, ou a própria pessoa limpando). */
    async removerPublicado(discordId: string, revisor: string) {
      const agora = new Date();
      await db.update(perfilEstilos)
        .set({ publicado: null, revisadoPor: revisor, revisadoEm: agora, atualizadoEm: agora })
        .where(eq(perfilEstilos.discordId, discordId));
    },

    async listarPendentes(): Promise<PerfilEstiloLinha[]> {
      return db.select().from(perfilEstilos).where(eq(perfilEstilos.status, 'pendente')).orderBy(asc(perfilEstilos.enviadoEm));
    },

    async listarPublicados(): Promise<PerfilEstiloLinha[]> {
      return db.select().from(perfilEstilos).where(isNotNull(perfilEstilos.publicado)).orderBy(asc(perfilEstilos.atualizadoEm));
    },

    async contarPendentes(): Promise<number> {
      const [linha] = await db.select({ n: sql<number>`count(*)::int` }).from(perfilEstilos).where(eq(perfilEstilos.status, 'pendente'));
      return linha?.n ?? 0;
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPerfilEstilos = criarRepositorioPerfilEstilos(db);
