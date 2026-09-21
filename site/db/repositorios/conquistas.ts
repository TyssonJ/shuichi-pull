import { eq, and, asc, desc } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { conquistas, usuarioConquistas } from '../schema';
import type { DadosConquista } from '../../lib/conquistas';

type Banco = typeof DbClient;
export type ConquistaLinha = typeof conquistas.$inferSelect;
export type ConquistaDoUsuario = ConquistaLinha & { concedidaEm: Date; motivo: string | null };

export function criarRepositorioConquistas(db: Banco) {
  return {
    async listar(): Promise<ConquistaLinha[]> {
      return db.select().from(conquistas).orderBy(asc(conquistas.nome));
    },

    async buscar(id: number): Promise<ConquistaLinha | null> {
      const linhas = await db.select().from(conquistas).where(eq(conquistas.id, id));
      return linhas[0] ?? null;
    },

    async criar(dados: DadosConquista): Promise<number> {
      const [linha] = await db.insert(conquistas).values(dados).returning({ id: conquistas.id });
      return linha.id;
    },

    async atualizar(id: number, dados: DadosConquista) {
      await db.update(conquistas).set(dados).where(eq(conquistas.id, id));
    },

    /** Apagar a conquista tira ela de todo mundo (cascade). */
    async excluir(id: number) {
      await db.delete(conquistas).where(eq(conquistas.id, id));
    },

    async todosOsPortadores(): Promise<{ discordId: string; conquistaId: number }[]> {
      return db.select({ discordId: usuarioConquistas.discordId, conquistaId: usuarioConquistas.conquistaId }).from(usuarioConquistas);
    },

    /** As conquistas de uma pessoa, da mais recente pra mais antiga. */
    async conquistasDoUsuario(discordId: string): Promise<ConquistaDoUsuario[]> {
      const linhas = await db.select({ conquista: conquistas, concedidaEm: usuarioConquistas.concedidaEm, motivo: usuarioConquistas.motivo })
        .from(usuarioConquistas)
        .innerJoin(conquistas, eq(conquistas.id, usuarioConquistas.conquistaId))
        .where(eq(usuarioConquistas.discordId, discordId))
        .orderBy(desc(usuarioConquistas.concedidaEm));
      return linhas.map((l) => ({ ...l.conquista, concedidaEm: l.concedidaEm, motivo: l.motivo }));
    },

    async conceder(discordId: string, conquistaId: number, concedidaPor: string, motivo: string | null) {
      await db.insert(usuarioConquistas).values({ discordId, conquistaId, concedidaPor, motivo }).onConflictDoNothing();
    },

    async retirar(discordId: string, conquistaId: number) {
      await db.delete(usuarioConquistas).where(and(eq(usuarioConquistas.discordId, discordId), eq(usuarioConquistas.conquistaId, conquistaId)));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioConquistas = criarRepositorioConquistas(db);
