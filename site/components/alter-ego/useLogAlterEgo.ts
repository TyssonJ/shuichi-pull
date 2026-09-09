'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { logAleatorio, logDaSecao, logDeBoot, type LinhaLog } from '@/lib/alter-ego-log';

const INTERVALO_MIN_MS = 30_000;
const INTERVALO_MAX_MS = 45_000;

export function useLogAlterEgo() {
  const pathname = usePathname();
  const [linha, setLinha] = useState<LinhaLog | null>(null);
  const montado = useRef(false);

  // Ao montar, mostra uma fala de boot — uma única vez, fora do rodízio
  // recorrente (senão o Alter Ego ficaria se reapresentando a cada
  // 30-45s). Trocas de pathname depois do primeiro mount reagem à seção
  // de verdade.
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      setLinha(logDeBoot());
      return;
    }
    const daSecao = logDaSecao(pathname ?? '');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (daSecao) setLinha(daSecao);
  }, [pathname]);

  // Rodízio ocioso: a cada troca de `linha` (por qualquer motivo — boot,
  // navegação, ou o próprio rodízio), agenda a próxima troca sozinha
  // dentro de 30-45s. Reiniciar a cada troca evita disparar de novo logo
  // depois de uma reatividade real.
  useEffect(() => {
    const duracao = INTERVALO_MIN_MS + Math.random() * (INTERVALO_MAX_MS - INTERVALO_MIN_MS);
    const id = setTimeout(() => {
      setLinha((atual) => logAleatorio(atual?.tag));
    }, duracao);
    return () => clearTimeout(id);
  }, [linha]);

  function forcarNovaLinha() {
    setLinha((atual) => logAleatorio(atual?.tag));
  }

  return { tag: linha?.tag ?? '', texto: linha?.texto ?? '', forcarNovaLinha };
}
