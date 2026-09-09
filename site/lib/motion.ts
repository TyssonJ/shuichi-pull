'use client';

import { useEffect, useState } from 'react';

// Não usamos o `useReducedMotion` do framer-motion: ele lê `window.matchMedia`
// uma única vez, em um singleton de módulo (`motion-dom`), e não reavalia em
// montagens seguintes — isso quebra qualquer teste que mocka `matchMedia` por
// caso de teste. Também não podemos ler a preferência direto num inicializador
// de `useState`: o servidor sempre renderiza como se o movimento não fosse
// reduzido, e se o cliente decidisse diferente já no primeiro render, o React
// acharia um mismatch de hidratação. Por isso começamos sempre em `false`
// (igual ao servidor) e só ajustamos para o valor real dentro de um
// `useEffect`, depois que a hidratação já terminou.
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    // A preferencia so pode ser lida no cliente; comeca em `false` (linha
    // acima) para bater com o servidor e evitar mismatch de hidratacao.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduzido(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return reduzido;
}
