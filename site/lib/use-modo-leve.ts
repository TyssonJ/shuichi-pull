'use client';

import { useSyncExternalStore } from 'react';
import { EVENTO_MODO_LEVE, modoLeveAtivo } from './modo-leve';

function assinar(aoMudar: () => void) {
  window.addEventListener(EVENTO_MODO_LEVE, aoMudar);
  return () => window.removeEventListener(EVENTO_MODO_LEVE, aoMudar);
}

/**
 * true quando o site está no modo leve. No servidor (e na hidratação) é sempre
 * false, igual ao HTML que ele gerou; logo depois o React confere o atributo
 * real no <html> e re-renderiza se for o caso.
 */
export function useModoLeve(): boolean {
  return useSyncExternalStore(assinar, modoLeveAtivo, () => false);
}
