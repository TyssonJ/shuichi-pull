import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { usuarios } from '../schema';

type Banco = typeof DbClient;
export type UsuarioLinha = typeof usuarios.$inferSelect;

export function criarRepositorioUsuarios(db: Banco) {
  return {
    async buscar(discordId: string): Promise<UsuarioLinha | null> {
      const linhas = await db.select().from(usuarios).where(eq(usuarios.discordId, discordId));
      return linhas[0] ?? null;
    },

    /** Cria a conta no primeiro login; em visitas seguintes só atualiza
     * nome/avatar do Discord (nunca mexe em uuidGmod/mains, que só o
     * próprio formulário de perfil altera). */
    async garantir(discordId: string, discordNome: string, discordAvatar: string | null) {
      await db.insert(usuarios)
        .values({ discordId, discordNome, discordAvatar })
        .onConflictDoUpdate({
          target: usuarios.discordId,
          set: { discordNome, discordAvatar },
        });
    },

    async atualizarPerfil(discordId: string, dados: { uuidGmod: string | null; mains: string[] }) {
      await db.update(usuarios)
        .set({ ...dados, atualizadoEm: new Date() })
        .where(eq(usuarios.discordId, discordId));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioUsuarios = criarRepositorioUsuarios(db);
