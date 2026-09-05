'use client';

import { useEffect, useState } from 'react';

/** Estado booleano que sobrevive à navegação entre páginas. */
export function usePersistencia(chave: string, inicial: boolean) {
  const [valor, setValor] = useState(inicial);

  useEffect(() => {
    // O localStorage só existe no cliente, então o valor guardado só pode ser
    // lido depois da montagem — daí o setState dentro do efeito.
    const guardado = localStorage.getItem(chave);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (guardado !== null) setValor(guardado === 'true');
  }, [chave]);

  function definir(novo: boolean) {
    setValor(novo);
    localStorage.setItem(chave, String(novo));
  }

  return [valor, definir] as const;
}
