'use client';

import { useEffect, useState } from 'react';
import { agoraSincronizado } from '@/lib/relogio-cliente';
import { useRelogioPronto } from '@/lib/use-relogio';

/** Só existe enquanto a partida está a até 30min de começar (ou até 15min
 * depois, pra quem chegou atrasado ver que já rolou) — fora dessa janela
 * não mostra nada, sem precisar de um sistema de notificação de verdade. */
export function AlertaInicio({ dataHora }: { dataHora: string }) {
  const pronto = useRelogioPronto();
  const [minutos, setMinutos] = useState<number | null>(null);

  useEffect(() => {
    if (!pronto) return;
    function calcular() {
      setMinutos((new Date(dataHora).getTime() - agoraSincronizado()) / 60000);
    }
    calcular();
    const t = setInterval(calcular, 30_000);
    return () => clearInterval(t);
  }, [dataHora, pronto]);

  if (minutos === null || minutos < -15 || minutos > 30) return null;

  const comecou = minutos <= 0;

  return (
    <div className="animate-pulse mb-4 rounded-[4px] border-2 border-execution-pink bg-execution-pink/10 px-3 py-2 font-mono text-[11px] tracking-[.05em] text-execution-pink">
      {comecou
        ? '[ ALERTA: A PARTIDA JÁ COMEÇOU — ENTRE NO SERVIDOR ]'
        : `[ ALERTA: A PARTIDA COMEÇA EM ~${Math.ceil(minutos)} MIN ]`}
    </div>
  );
}
