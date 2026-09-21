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
    // Ícone escolhido no site em destaque; o do Discord, pequeno ao lado.
    const foto = sessao.user.avatarUrl ?? sessao.user.image;
    const nomeConta = sessao.user.apelido ?? sessao.user.name ?? 'usuário';

    return (
      <div className="flex shrink-0 items-center gap-2">
      {atalho && (
        <a
          href={atalho.href}
          title={atalho.rotulo}
          className="rounded-[2px] border-2 border-amber px-2 py-1.5 font-mono text-[12px] font-bold tracking-[.1em] text-amber transition-colors hover:bg-amber hover:text-[#08090D] sm:px-2.5"
        >
          ✎<span className="hidden sm:inline"> EDITAR</span>
        </a>
      )}
      <a
        href={sessao.user.discordId ? `/u/${sessao.user.discordId}/` : '/conta/'}
        aria-label={`Conta de ${nomeConta}`}
        className="group relative shrink-0"
      >
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-alter-green object-cover sm:h-12 sm:w-12 object-top shadow-[0_0_10px_rgba(0,255,102,0.55)] transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="flex h-10 w-10 items-center sm:h-12 sm:w-12 justify-center rounded-full border-2 border-alter-green font-mono text-[16px] text-alter-green">
            {sessao.user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        {sessao.user.avatarUrl && sessao.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sessao.user.image}
            alt=""
            title="Seu ícone do Discord"
            className="absolute -bottom-1 -left-2 h-5 w-5 rounded-full border-2 border-[#0A0A0D] bg-[#0A0A0D]"
          />
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
      className="flex shrink-0 items-center gap-1.5 rounded-[2px] border-2 border-execution-pink bg-execution-pink/10 px-2.5 py-2 font-mono text-[11px] font-bold tracking-[.08em] text-execution-pink sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px] sm:tracking-[.1em] transition-colors hover:bg-execution-pink hover:text-[#08090D]"
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
