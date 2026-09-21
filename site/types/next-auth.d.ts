import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      discordId: string;
      papel: 'adm' | 'chefe' | null;
      /** Escolhidos no site. `name`/`image` continuam sendo os do Discord. */
      apelido?: string | null;
      avatarUrl?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    discordId?: string;
    papel?: 'adm' | 'chefe' | null;
    apelido?: string | null;
    avatarUrl?: string | null;
  }
}
