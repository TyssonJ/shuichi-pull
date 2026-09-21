/**
 * Roda `fn` quando o navegador estiver ocioso (não atrapalha o carregamento e a
 * hidratação da página), com um teto de espera. Onde não existe
 * `requestIdleCallback` (Safari, testes) roda logo em seguida, como antes.
 * Devolve a função que cancela.
 */
export function aoFicarOcioso(fn: () => void, limiteMs = 2500): () => void {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: limiteMs });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(fn, 0);
  return () => clearTimeout(t);
}
