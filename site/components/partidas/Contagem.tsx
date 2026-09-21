'use client';

import { useEffect, useState } from 'react';
import { formatarRestante, intervaloDaContagem } from '@/lib/contagem';
import { agoraSincronizado, garantirSincronia } from '@/lib/relogio-cliente';
import { useRelogioPronto } from '@/lib/use-relogio';

/** Contagem regressiva até a partida. Só calcula no cliente (o HTML do
 * servidor e o primeiro render do navegador precisam bater, e "agora" não
 * bate) e usa o relógio sincronizado com o servidor, pra todo mundo ver o
 * mesmo tempo mesmo com o relógio do aparelho fora de hora. */
export function Contagem({ dataHora, className = '' }: { dataHora: string; className?: string }) {
  const pronto = useRelogioPronto();
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    if (!pronto) return;
    const alvo = new Date(dataHora).getTime();
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const ms = alvo - agoraSincronizado();
      setRestante(ms);
      timer = setTimeout(tick, intervaloDaContagem(ms));
    }
    tick();
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer);
        tick();
        void garantirSincronia();
      }
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [dataHora, pronto]);

  return (
    <span className={className} data-testid="contagem">
      {restante === null ? '--' : formatarRestante(restante)}
    </span>
  );
}
