'use client';

import { useEffect, useState } from 'react';
import { formatarCronometro } from '@/lib/status-partida';
import { agoraSincronizado, garantirSincronia } from '@/lib/relogio-cliente';
import { useRelogioPronto } from '@/lib/use-relogio';

/** Quanto tempo a partida está rolando, contando em tempo real. Só calcula no
 * cliente (o "agora" do servidor e o do navegador nunca batem), e usa o
 * relógio SINCRONIZADO com o servidor: com o do aparelho, quem tinha o
 * relógio adiantado ou atrasado via um tempo diferente dos outros, e quem
 * estava atrasado via o cronômetro parado em 00:00:00. */
export function Cronometro({ desdeIso, className = '' }: { desdeIso: string; className?: string }) {
  const pronto = useRelogioPronto();
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!pronto) return;
    const inicio = new Date(desdeIso).getTime();
    const tick = () => setMs(agoraSincronizado() - inicio);
    tick();
    const timer = setInterval(tick, 1000);
    // Aba que estava escondida (o navegador pausa os timers) volta já certa.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') {
        tick();
        void garantirSincronia();
      }
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [desdeIso, pronto]);

  return (
    <span className={className} data-testid="cronometro">
      {ms === null ? '--:--:--' : formatarCronometro(ms)}
    </span>
  );
}
