import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { administradores } from '../schema';

type Papel = 'adm' | 'chefe';
type Banco = typeof DbClient;

export function criarRepositorioAdms(db: Banco) {
  return {
    async buscarAdm(discordId: string) {
      const linhas = await db.select().from(administradores)
        .where(eq(administradores.discordId, discordId));
      return linhas[0] ?? null;
    },

    async promoverAdm(args: { discordId: string; nome: string; papel: Papel; promovidoPor: string | null }) {
      await db.insert(administradores).values(args)
        .onConflictDoUpdate({
          target: administradores.discordId,
          set: { papel: args.papel, nome: args.nome },
        });
    },

    async rebaixarAdm(discordId: string) {
      await db.delete(administradores).where(eq(administradores.discordId, discordId));
    },

    async listarAdms() {
      return db.select().from(administradores);
    },
  };
}
