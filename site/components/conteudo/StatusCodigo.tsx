'use client';

import { useEffect, useState } from 'react';

/**
 * O site é estático: o "expirado" calculado no build congela na data em que o
 * site foi publicado. Este componente recalcula no navegador de quem lê, para
 * um código não continuar aparecendo como válido só porque ninguém republicou.
 */
function expirou(expiraEm: string, agora: Date): boolean {
  const [ano, mes, dia] = expiraEm.split('-').map(Number);
  return agora.getTime() > new Date(ano, mes - 1, dia, 23, 59, 59, 999).getTime();
}

type Props = { expiraEm: string | null; expiradoNoBuild: boolean };

export function StatusCodigo({ expiraEm, expiradoNoBuild }: Props) {
  const [expirado, setExpirado] = useState(expiradoNoBuild);

  useEffect(() => {
    // A data so pode ser lida no cliente; no servidor vale o valor do build.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (expiraEm) setExpirado(expirou(expiraEm, new Date()));
  }, [expiraEm]);

  if (!expiraEm) {
    return (
      <span className="rounded-[2px] border border-line px-1.5 py-px font-mono text-[8px] uppercase tracking-[.1em] text-dim">
        sem prazo
      </span>
    );
  }

  const dia = expiraEm.split('-').reverse().join('/');

  return expirado ? (
    <span className="rounded-[2px] border border-alerta px-1.5 py-px font-mono text-[8px] uppercase tracking-[.1em] text-alerta">
      expirado em {dia}
    </span>
  ) : (
    <span className="rounded-[2px] border border-alter-green bg-ego-escuro px-1.5 py-px font-mono text-[8px] uppercase tracking-[.1em] text-[#D6D6E0]">
      funcionando até {dia}
    </span>
  );
}
