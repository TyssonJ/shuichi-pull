import { eq, and, asc, inArray } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { cargos, usuarioCargos } from '../schema';

type Banco = typeof DbClient;
export type CargoLinha = typeof cargos.$inferSelect;

export function criarRepositorioCargos(db: Banco) {
  return {
    async listar(): Promise<CargoLinha[]> {
      return db.select().from(cargos).orderBy(asc(cargos.nome));
    },

    async buscar(id: number): Promise<CargoLinha | null> {
      const linhas = await db.select().from(cargos).where(eq(cargos.id, id));
      return linhas[0] ?? null;
    },

    async criar(dados: { nome: string; cor: string }): Promise<number> {
      const [linha] = await db.insert(cargos).values(dados).returning({ id: cargos.id });
      return linha.id;
    },

    async atualizar(id: number, dados: { nome: string; cor: string }) {
      await db.update(cargos).set(dados).where(eq(cargos.id, id));
    },

    /** Apagar o cargo tira ele de todo mundo (cascade). */
    async excluir(id: number) {
      await db.delete(cargos).where(eq(cargos.id, id));
    },

    async portadores(cargoId: number): Promise<{ discordId: string; concedidoEm: Date }[]> {
      return db.select({ discordId: usuarioCargos.discordId, concedidoEm: usuarioCargos.concedidoEm })
        .from(usuarioCargos).where(eq(usuarioCargos.cargoId, cargoId)).orderBy(asc(usuarioCargos.concedidoEm));
    },

    /** Todos os pares (pessoa, cargo) de uma vez — o painel agrupa. */
    async todosOsPortadores(): Promise<{ discordId: string; cargoId: number }[]> {
      return db.select({ discordId: usuarioCargos.discordId, cargoId: usuarioCargos.cargoId }).from(usuarioCargos);
    },

    async cargosDoUsuario(discordId: string): Promise<CargoLinha[]> {
      const linhas = await db.select({ cargo: cargos }).from(usuarioCargos)
        .innerJoin(cargos, eq(cargos.id, usuarioCargos.cargoId))
        .where(eq(usuarioCargos.discordId, discordId))
        .orderBy(asc(usuarioCargos.concedidoEm));
      return linhas.map((l) => l.cargo);
    },

    /** Cargos de várias pessoas de uma vez (chat, listas). */
    async cargosDeUsuarios(discordIds: string[]): Promise<Map<string, CargoLinha[]>> {
      const mapa = new Map<string, CargoLinha[]>();
      if (discordIds.length === 0) return mapa;
      const linhas = await db.select({ discordId: usuarioCargos.discordId, cargo: cargos }).from(usuarioCargos)
        .innerJoin(cargos, eq(cargos.id, usuarioCargos.cargoId))
        .where(inArray(usuarioCargos.discordId, discordIds))
        .orderBy(asc(usuarioCargos.concedidoEm));
      for (const l of linhas) mapa.set(l.discordId, [...(mapa.get(l.discordId) ?? []), l.cargo]);
      return mapa;
    },

    async conceder(discordId: string, cargoId: number, concedidoPor: string) {
      await db.insert(usuarioCargos).values({ discordId, cargoId, concedidoPor }).onConflictDoNothing();
    },

    async retirar(discordId: string, cargoId: number) {
      await db.delete(usuarioCargos).where(and(eq(usuarioCargos.discordId, discordId), eq(usuarioCargos.cargoId, cargoId)));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioCargos = criarRepositorioCargos(db);
