import NextAuth, { type NextAuthConfig } from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { repositorioAdms } from './db/repositorios/administradores';
import { repositorioUsuarios } from './db/repositorios/usuarios';

/** Resolve o papel atual de um discordId, sempre a partir da fonte de
 * verdade (banco), nunca de um valor cacheado — o atalho do chefe fundador
 * é a única exceção, por ser instantâneo/gratuito e não depender do banco. */
export async function resolvePapel(discordId: string): Promise<'adm' | 'chefe' | null> {
  const chefeFundador = process.env.ADM_CHEFE_DISCORD_ID;
  if (discordId === chefeFundador) return 'chefe';

  const adm = await repositorioAdms.buscarAdm(discordId);
  return adm?.papel ?? null;
}

const callbacks = {
  // Toda pessoa que entra passa a ter conta no site já no login — antes ela só
  // nascia ao abrir /conta/, e quem nunca abriu tomava 404 no próprio perfil.
  // Falha do banco não pode impedir o login.
  async signIn({ user, profile }) {
    if (profile?.id) {
      try {
        await repositorioUsuarios.garantir(String(profile.id), user?.name ?? 'Sem nome', user?.image ?? null);
      } catch { /* entra assim mesmo; a conta é criada na próxima oportunidade */ }
    }
    return true;
  },
  async jwt({ token, account, profile }) {
    // account/profile só existem no login inicial — é o único momento em
    // que o discordId é obtido do provedor Discord.
    if (account && profile?.id) {
      token.discordId = String(profile.id);
    }

    // papel é revalidado no banco (via resolvePapel) em TODA chamada deste
    // callback, não só no login — isso é o que faz uma promoção/rebaixamento
    // feito por um chefe valer já na próxima requisição, em vez de ficar
    // preso ao valor cacheado no cookie de sessão por até 30 dias (padrão
    // do Auth.js, não configurado aqui).
    // Cast necessário por conta de como o Auth.js tipa o token do callback
    // `jwt` — o mesmo motivo pelo qual o callback `session` abaixo já
    // precisa de `as string` para ler token.discordId.
    const discordId = token.discordId as string | undefined;
    if (discordId) {
      token.papel = await resolvePapel(discordId);
      // Apelido e ícone do site, pro cabeçalho. Falha do banco aqui não pode
      // derrubar o login: sem isso o cabeçalho só mostra os dados do Discord.
      try {
        const u = await repositorioUsuarios.buscar(discordId);
        token.apelido = u?.apelido ?? null;
        token.avatarUrl = u?.avatarUrl ?? null;
      } catch {
        token.apelido = null;
        token.avatarUrl = null;
      }
    }

    return token;
  },
  async session({ session, token }) {
    session.user.discordId = token.discordId as string;
    session.user.papel = token.papel as 'adm' | 'chefe' | null;
    session.user.apelido = (token.apelido as string | null | undefined) ?? null;
    session.user.avatarUrl = (token.avatarUrl as string | null | undefined) ?? null;
    return session;
  },
} satisfies NextAuthConfig['callbacks'];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Discord],
  callbacks,
});

/** Exportado separadamente para ser testável sem precisar reconstruir a
 * forma do objeto de config que NextAuth(...) retorna. */
export const jwtCallback = callbacks.jwt;
export const signInCallback = callbacks.signIn;

