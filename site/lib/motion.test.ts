import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMovimentoReduzido } from './motion';

function mockarMovimentoReduzido(reduzido: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduzido && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('useMovimentoReduzido', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('fica em true quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    const { result } = renderHook(() => useMovimentoReduzido());
    expect(result.current).toBe(true);
  });

  it('fica em false quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    const { result } = renderHook(() => useMovimentoReduzido());
    expect(result.current).toBe(false);
  });
});
