'use client';

import { useEffect, useState } from 'react';
import { formatarRestante, intervaloDaContagem } from '@/lib/contagem';

/** Contagem regressiva até a partida. Só calcula no cliente: o HTML do
 * servidor e o primeiro render do navegador precisam bater, e "agora" não
 * bate. */
export function Contagem({ dataHora, className = '' }: { dataHora: string; className?: string }) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const alvo = new Date(dataHora).getTime();
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      const ms = alvo - Date.now();
      setRestante(ms);
      timer = setTimeout(tick, intervaloDaContagem(ms));
    }
    tick();
    return () => clearTimeout(timer);
  }, [dataHora]);

  return (
    <span className={className} data-testid="contagem">
      {restante === null ? '--' : formatarRestante(restante)}
    </span>
  );
}
