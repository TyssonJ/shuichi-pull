import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { repositorioAdms } from './db/repositorios/administradores';

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
