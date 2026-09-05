import '@testing-library/jest-dom/vitest';

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
