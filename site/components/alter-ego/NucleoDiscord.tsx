'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import type { Session } from 'next-auth';

function Nucleo() {
  const { data: sessao, status } = useSession();

  if (status === 'authenticated' && sessao?.user) {
    return (
      <a
        href="/conta/"
        aria-label={`Conta de ${sessao.user.name ?? 'usuário'}`}
        className="group relative shrink-0"
      >
        {sessao.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sessao.user.image}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-alter-green shadow-[0_0_6px_rgba(0,255,102,0.5)] transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-alter-green font-mono text-[9px] text-alter-green">
            {sessao.user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0A0A0D] bg-alter-green"
        />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn('discord')}
      aria-label="Entrar com o Discord"
      title="Entrar com o Discord"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-dim text-[9px] text-dim transition-colors hover:border-cyber-cyan hover:text-cyber-cyan"
    >
      ?
    </button>
  );
}

export function NucleoDiscord({ sessaoInicial }: { sessaoInicial?: Session | null } = {}) {
  return (
    <SessionProvider session={sessaoInicial}>
      <Nucleo />
    </SessionProvider>
  );
}
