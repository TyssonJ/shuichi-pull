'use client';

import { useState } from 'react';

/**
 * Trava spoiler de enredo (história e segredo) atrás de um clique — quem
 * só quer referência de RP (personalidade, aparência) nunca esbarra neles
 * por acidente rolando a página.
 */
export function CofreAlterEgo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [desbloqueado, setDesbloqueado] = useState(false);

  if (desbloqueado) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-[3px] border border-dashed border-alter-green/30 bg-ego-escuro/10 px-4 py-6 text-center">
      <p className="font-mono text-[9px] tracking-[.15em] text-alter-green/70">
        [ ALTER_EGO :: COFRE DE DADOS ]
      </p>
      <p className="mx-auto mt-1 max-w-xs font-mono text-[8px] leading-relaxed text-dim">
        {titulo} — contém spoiler de enredo. Acesso restrito por padrão.
      </p>
      <button
        type="button"
        onClick={() => setDesbloqueado(true)}
        className="mt-3 rounded-[2px] border border-alter-green px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-alter-green transition-colors hover:bg-ego-escuro hover:text-[#D6D6E0]"
      >
        [ access restricted — decrypt file? ]
      </button>
    </div>
  );
}
