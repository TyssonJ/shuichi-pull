'use client';

import { useEffect, useState } from 'react';
import { formatarCronometro } from '@/lib/status-partida';

/** Quanto tempo a partida está rolando, contando em tempo real. Só calcula no
 * cliente (como a Contagem): "agora" do servidor e do navegador nunca batem,
 * então o primeiro render é um traço e o número entra depois de montar. */
export function Cronometro({ desdeIso, className = '' }: { desdeIso: string; className?: string }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const inicio = new Date(desdeIso).getTime();
    const tick = () => setMs(Date.now() - inicio);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [desdeIso]);

  return (
    <span className={className} data-testid="cronometro">
      {ms === null ? '--:--:--' : formatarCronometro(ms)}
    </span>
  );
}
