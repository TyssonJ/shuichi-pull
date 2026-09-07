import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { db } from './db/client';
import { criarRepositorioAdms } from './db/repositorios/administradores';

// A instância de produção do repositório é montada aqui, e não dentro do
// próprio módulo do repositório — assim `db/repositorios/administradores.ts`
// não importa `db/client.ts` (que exige `DATABASE_URL` só de ser importado),
// e o repositório continua testável isoladamente sem um banco configurado.
const repositorioAdms = criarRepositorioAdms(db);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
  callbacks: {
    async jwt({ token, account, profile }) {
      // account/profile só existem no login inicial — é o único momento em
      // que vale a pena consultar o banco; o resto da sessão lê do token.
      if (account && profile?.id) {
        const discordId = String(profile.id);
        const chefeFundador = process.env.ADM_CHEFE_DISCORD_ID;

        const adm = discordId === chefeFundador
          ? { papel: 'chefe' as const, nome: token.name ?? 'Chefe' }
          : await repositorioAdms.buscarAdm(discordId);

        token.discordId = discordId;
        token.papel = adm?.papel ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId as string;
      session.user.papel = token.papel as 'adm' | 'chefe' | null;
      return session;
    },
  },
});
