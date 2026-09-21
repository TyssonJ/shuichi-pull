import { eq, desc, inArray, arrayContains } from 'drizzle-orm';
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

    /** Trocar o UID volta o status pra "pendente" — uma aprovação anterior
     * não deve valer pra um valor diferente do que foi revisado. */
    async atualizarPerfil(discordId: string, dados: { uuidGmod: string | null; mains: string[] }) {
      const linhas = await db.select({ uuidGmod: usuarios.uuidGmod }).from(usuarios)
        .where(eq(usuarios.discordId, discordId));
      const uuidMudou = linhas[0]?.uuidGmod !== dados.uuidGmod;

      await db.update(usuarios)
        .set({
          ...dados,
          atualizadoEm: new Date(),
          ...(uuidMudou ? { uuidStatus: 'pendente' as const } : {}),
        })
        .where(eq(usuarios.discordId, discordId));
    },

    /** Descrição e banner do perfil público. Já chegam validados por
     * lib/perfil-visual.ts — o repositório só grava. */
    async atualizarPersonalizacao(discordId: string, dados: {
      bio: string | null; bannerTipo: string | null; bannerValor: string | null;
    }) {
      await db.update(usuarios)
        .set({ ...dados, atualizadoEm: new Date() })
        .where(eq(usuarios.discordId, discordId));
    },

    /** Apelido e ícone escolhidos pela pessoa (já validados e com o ícone
     * resolvido pra endereço). Não mexe em discordNome/discordAvatar: esses
     * são sempre os originais do Discord. */
    async atualizarIdentidade(discordId: string, dados: {
      apelido: string | null; avatarTipo: string | null; avatarValor: string | null; avatarUrl: string | null;
    }) {
      await db.update(usuarios).set({ ...dados, atualizadoEm: new Date() }).where(eq(usuarios.discordId, discordId));
    },

    /** Moderação: volta a pessoa pro nome e ícone do Discord. */
    async resetarIdentidade(discordId: string) {
      await db.update(usuarios)
        .set({ apelido: null, avatarTipo: null, avatarValor: null, avatarUrl: null, atualizadoEm: new Date() })
        .where(eq(usuarios.discordId, discordId));
    },

    /** Quem marcou esse personagem como main, do mais antigo pro mais novo. */
    async quemJogaDeMain(personagemId: string): Promise<UsuarioLinha[]> {
      return db.select().from(usuarios)
        .where(arrayContains(usuarios.mains, [personagemId]))
        .orderBy(usuarios.criadoEm);
    },

    /** Quais desses discordIds têm conta no site. */
    async existentes(ids: string[]): Promise<Set<string>> {
      if (ids.length === 0) return new Set();
      const linhas = await db.select({ id: usuarios.discordId }).from(usuarios).where(inArray(usuarios.discordId, ids));
      return new Set(linhas.map((l) => l.id));
    },

    async listarTodos(): Promise<UsuarioLinha[]> {
      return db.select().from(usuarios).orderBy(desc(usuarios.criadoEm));
    },

    async definirStatusUuid(discordId: string, status: 'pendente' | 'aprovado' | 'banido') {
      await db.update(usuarios).set({ uuidStatus: status }).where(eq(usuarios.discordId, discordId));
    },

    async definirPodeSerHost(discordId: string, valor: boolean) {
      await db.update(usuarios).set({ podeSerHost: valor }).where(eq(usuarios.discordId, discordId));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioUsuarios = criarRepositorioUsuarios(db);
