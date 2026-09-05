'use client';

import { useEffect, useState } from 'react';

/** Estado booleano que sobrevive à navegação entre páginas. */
export function usePersistencia(chave: string, inicial: boolean) {
  const [valor, setValor] = useState(inicial);

  useEffect(() => {
    const guardado = localStorage.getItem(chave);
    if (guardado !== null) setValor(guardado === 'true');
  }, [chave]);

  function definir(novo: boolean) {
    setValor(novo);
    localStorage.setItem(chave, String(novo));
  }

  return [valor, definir] as const;
}
