'use client';

import { useEffect, useState } from 'react';
import { garantirSincronia } from './relogio-cliente';

/** Se a resposta do servidor demorar mais que isso, mostra com o relógio do aparelho mesmo. */
const ESPERA_MAXIMA_MS = 1500;

/**
 * true quando o relógio já foi sincronizado com o servidor (ou quando esperar
 * mais não vale a pena). Quem mostra tempo espera por isto pra não piscar um
 * número errado e corrigir logo depois.
 */
export function useRelogioPronto(): boolean {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    let vivo = true;
    const limite = setTimeout(() => { if (vivo) setPronto(true); }, ESPERA_MAXIMA_MS);
    void garantirSincronia().then(() => { if (vivo) setPronto(true); });
    return () => {
      vivo = false;
      clearTimeout(limite);
    };
  }, []);
  return pronto;
}
