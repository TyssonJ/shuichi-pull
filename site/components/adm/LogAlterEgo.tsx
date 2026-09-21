import Link from 'next/link';

export type LinhaLog = { chave: number; hora: string; autor: string; texto: string };

/** O que o painel andou fazendo, no formato de terminal do Alter Ego. */
export function LogAlterEgo({ linhas }: { linhas: LinhaLog[] }) {
  return (
    <div className="clip-dossier-card relative overflow-hidden border border-[#0F5A2E] bg-[#03100A] p-4">
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[.16em] text-alter-green">
            ALTER_EGO // LOG DE AÇÕES
          </h3>
          <Link href="/adm/auditoria" className="font-mono text-[10px] text-cyber-cyan hover:underline">
            ver tudo →
          </Link>
        </div>

        {linhas.length === 0 ? (
          <p className="font-mono text-xs text-[#5FBF85]">&gt; nenhuma ação registrada ainda.</p>
        ) : (
          <ul className="space-y-1 font-mono text-[12px] leading-snug">
            {linhas.map((l) => (
              <li key={l.chave} className="flex gap-2">
                <span className="shrink-0 text-[#5FBF85]">[{l.hora}]</span>
                <span className="min-w-0">
                  <b className="text-execution-pink">{l.autor}</b>{' '}
                  <span className="text-[#C8F5D8]">{l.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
