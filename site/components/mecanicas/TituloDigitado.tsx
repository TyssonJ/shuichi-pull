'use client';

import { useEffect, useState } from 'react';
import { useMovimentoReduzido } from '@/lib/motion';

/**
 * Efeito de digitação linha por linha, cursor em bloco piscando no fim. Quem
 * pede menos movimento recebe o texto inteiro de uma vez, sem datilografia.
 */
export function TituloDigitado({ texto }: { texto: string }) {
  const reduzido = useMovimentoReduzido();
  const [tamanho, setTamanho] = useState(0);

  useEffect(() => {
    // A preferência de movimento só é conhecida no cliente — este efeito
    // sincroniza a animação com ela, por isso o set direto aqui é o padrão
    // já usado em lib/motion.ts, não um efeito derivável de outro jeito.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (reduzido) { setTamanho(texto.length); return; }
    setTamanho(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTamanho(i);
      if (i >= texto.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [texto, reduzido]);

  return (
    <span>
      {texto.slice(0, tamanho)}
      <span aria-hidden className="animate-pulse">█</span>
    </span>
  );
}
