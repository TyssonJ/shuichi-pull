'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { atalhoDeEdicao } from '@/lib/adm/atalho-edicao';

function Nucleo() {
  const { data: sessao, status } = useSession();
  const pathname = usePathname();

  if (status === 'authenticated' && sessao?.user) {
    // Só ADM vê: leva do site como o público vê direto pro editor daquela
    // página (já abrindo o registro, quando a página é de um personagem/item).
    const atalho = sessao.user.papel ? atalhoDeEdicao(pathname ?? '') : null;

    return (
      <div className="flex shrink-0 items-center gap-2">
      {atalho && (
        <a
          href={atalho.href}
          title={atalho.rotulo}
          className="rounded-[2px] border-2 border-amber px-2.5 py-1.5 font-mono text-[12px] font-bold tracking-[.1em] text-amber transition-colors hover:bg-amber hover:text-[#08090D]"
        >
          ✎ EDITAR
        </a>
      )}
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
            className="h-12 w-12 rounded-full border-2 border-alter-green shadow-[0_0_10px_rgba(0,255,102,0.55)] transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-alter-green font-mono text-[16px] text-alter-green">
            {sessao.user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0D] bg-alter-green"
        />
      </a>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn('discord')}
      aria-label="Entrar com o Discord"
      className="flex shrink-0 items-center gap-2 rounded-[2px] border-2 border-execution-pink bg-execution-pink/10 px-4 py-2.5 font-mono text-[13px] font-bold tracking-[.1em] text-execution-pink transition-colors hover:bg-execution-pink hover:text-[#08090D]"
    >
      <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-execution-pink" />
      CONECTAR
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
