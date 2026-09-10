'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECOES } from '@/lib/secoes';
import { useLogAlterEgo } from '@/components/alter-ego/useLogAlterEgo';

type Props = {
  as?: 'div' | 'article';
  children: React.ReactNode;
};

export function PainelComTrilhas({ as = 'div', children }: Props) {
  const pathname = usePathname();
  const { tag, texto, forcarNovaLinha } = useLogAlterEgo();
  const Tag = as;

  return (
    <Tag className="relative px-4 py-8 xl:mx-auto xl:grid xl:max-w-[1400px] xl:grid-cols-[180px_minmax(0,56rem)_220px] xl:gap-10 xl:px-8">
      <aside className="relative hidden xl:block">
        <nav aria-label="Seções do site" className="sticky top-20 space-y-1">
          {SECOES.map((s) => {
            const ativa = pathname?.startsWith(s.url);
            return (
              <Link
                key={s.url}
                href={s.url}
                aria-current={ativa ? 'page' : undefined}
                className={`block rounded-[2px] border px-2 py-1.5 font-mono text-[8px] tracking-[.08em] ${
                  ativa
                    ? 'border-execution-pink text-execution-pink'
                    : 'border-line text-dim hover:border-cyber-cyan hover:text-cyber-cyan'
                }`}
              >
                {s.numero} {'//'} {s.nome.toUpperCase()}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative min-w-0">{children}</div>

      <aside className="relative hidden xl:block">
        <button
          type="button"
          data-testid="feed-alterego"
          aria-label="Pedir uma nova leitura ao Alter Ego"
          onClick={forcarNovaLinha}
          className="sticky top-20 w-full rounded-[3px] border border-line bg-sur p-3 text-left transition-colors hover:border-alter-green"
        >
          <p className="mb-1.5 font-mono text-[8px] tracking-[.14em] text-alter-green">
            ALTER_EGO // LOG
          </p>
          <p className="font-mono text-[9px] leading-relaxed text-dim">
            <span className="text-alter-green">[{tag}]</span> {texto}
          </p>
        </button>
      </aside>
    </Tag>
  );
}
