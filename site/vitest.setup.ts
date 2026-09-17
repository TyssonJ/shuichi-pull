import '@testing-library/jest-dom/vitest';

// `SessionProvider` do next-auth busca `/api/auth/session` sozinho quando
// nenhum componente passa uma sessão inicial explícita (é o caso de
// `NucleoDiscord` no app real) — sem isso, cada teste que monta a barra de
// navegação dispararia uma tentativa de rede de verdade contra localhost.
// Resposta vazia = não autenticado, que é o estado padrão nos testes.
const buscarOriginal = globalThis.fetch;
globalThis.fetch = ((entrada: RequestInfo | URL, opcoes?: RequestInit) => {
  const url = typeof entrada === 'string' ? entrada
    : entrada instanceof URL ? entrada.href
    : entrada.url;
  if (url.includes('/api/auth/session')) {
    return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  if (buscarOriginal) return buscarOriginal(entrada, opcoes);
  return Promise.reject(new Error(`fetch não mockado para ${url}`));
}) as typeof fetch;

// O jsdom não implementa matchMedia, e os componentes consultam
// prefers-reduced-motion. O padrão aqui é "sem redução de movimento".
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}
